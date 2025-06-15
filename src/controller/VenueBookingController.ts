import { Request, Response } from 'express';
import { VenueBookingRepository } from '../repositories/VenueBookingRepository';
import { AuthenticatedRequest } from '../middlewares/AuthMiddleware';
import { Between } from 'typeorm';
import { checkConflict } from '../services/bookings/BookingService';
import { VenueBookingInterface } from '../interfaces/VenueBookingInterface';

class VenueBookingController {
  /**
   * Create a new event booking
   * @route POST /api/bookings
   * @access Private (Authenticated Users)
   */
static async createVenueBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
        const bookingData: VenueBookingInterface = req.body;
        console.log("Booking data from request body:", bookingData); // Debugging
//accept the booking service

    const conflictCheck = await checkConflict(bookingData);
    if (!conflictCheck.success) {
        res.status(400).json({ success: false, message: conflictCheck.message });
        return;
    }
        // Extract user and organization IDs from token
        if (!req.user || !req.user.organizations || req.user.organizations.length === 0 || !req.user.userId) {
            console.log("User token data:", req.user); // Debugging
            res.status(401).json({ success: false, message: "Unauthorized: User is not properly authenticated." });
            return;
        }

        // Use the first organization ID from the token (ensure it's a valid UUID)
        const organizationId = req.user.organizationId;
        console.log("Organization ID from token:", organizationId); // Debug the value
        
        // Validate UUID format
        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!UUID_REGEX.test(organizationId)) {
            console.log("Invalid UUID format for organizationId:", organizationId);
            res.status(400).json({ 
                success: false, 
                message: "Organization ID is not a valid UUID format. Token may contain incorrect organization format." 
            });
            return;
        }
        
        // Use the userId from the token as the organizerId (ensure it's a valid UUID)
        const organizerId = req.user.userId;
        console.log("Organizer ID from token:", organizerId); // Debug the value
        
        // Validate UUID format for organizerId
        if (!UUID_REGEX.test(organizerId)) {
            console.log("Invalid UUID format for organizerId:", organizerId);
            res.status(400).json({ 
                success: false, 
                message: "User ID is not a valid UUID format. Token may contain incorrect user ID format." 
            });
            return;
        }

        // Check if the organizationId exists in the database
        try {
            const organizationExists = await VenueBookingRepository.getOrganizationRepository().findOne({
                where: { organizationId },
            });
            
            if (!organizationExists) {
                console.log("Organization not found:", organizationId);
                res.status(404).json({ success: false, message: "Organization not found." });
                return;
            }
        } catch (dbError) {
            console.error("Database error checking organization:", dbError);
            res.status(500).json({ 
                success: false, 
                message: "Error validating organization. Please check organization ID format." 
            });
            return;
        }

        // Validate required fields from the request body
        if (!bookingData.eventId || !bookingData.venueId || 
            !bookingData.startDate || !bookingData.endDate || !bookingData.startTime || !bookingData.endTime) {
            res.status(400).json({ success: false, message: "Missing required booking fields." });
            return;
        }

        // Validate UUID format for eventId
        if (!UUID_REGEX.test(bookingData.eventId)) {
            res.status(400).json({ success: false, message: "Event ID is not a valid UUID format." });
            return;
        }

        // Validate UUID format for venueId
        if (!UUID_REGEX.test(bookingData.venueId)) {
            res.status(400).json({ success: false, message: "Venue ID is not a valid UUID format." });
            return;
        }

        // Validate dates
        const startDate = new Date(bookingData.startDate);
        const endDate = new Date(bookingData.endDate);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            res.status(400).json({ success: false, message: "Invalid date format." });
            return;
        }

        if (startDate > endDate) {
            res.status(400).json({ success: false, message: "Start date cannot be after end date." });
            return;
        }

        // Validate organizer exists and belongs to the organization
        try {
            const organizerExists = await VenueBookingRepository.getUserRepository().findOne({
                where: { userId: organizerId },
                relations: ["organizations"],
            });

            if (!organizerExists) {
                res.status(400).json({ success: false, message: "User in token does not exist in the database." });
                return;
            }

            const userBelongsToOrg = organizerExists.organizations.some(
                (org: { organizationId: string }) => org.organizationId === organizationId
            );
            
            if (!userBelongsToOrg) {
                res.status(403).json({ success: false, message: "Forbidden: User is not part of the specified organization." });
                return;
            }
        } catch (dbError) {
            console.error("Database error checking user:", dbError);
            res.status(500).json({ 
                success: false, 
                message: "Error validating user. Please check user ID format." 
            });
            return;
        }

        // Set default approval status if not provided
        bookingData.approvalStatus = bookingData.approvalStatus || "pending";

        // Create booking with organizationId and organizerId from token
        try {
            const result = await VenueBookingRepository.createBooking({ 
                ...bookingData, 
                organizationId, 
                organizerId
            });

            if (result.success && result.data) {
                res.status(201).json({ success: true, message: "Event booking created successfully.", data: result.data });
            } else {
                res.status(500).json({ success: false, message: result.message || "Failed to create event booking." });
            }
        } catch (createError) {
            console.error("Error creating booking:", createError);
            res.status(500).json({ 
                success: false, 
                message: "Failed to create booking. Database error occurred." 
            });
        }
    } catch (error) {
        console.error("Error in createVenueBooking:", error);
        res.status(500).json({ success: false, message: "Internal Server Error." });
    }
}

  /**
   * Get all event bookings
   * @route GET /api/bookings
   * @access Private (Admins)
   */
  static async getAllVenueBookings(req: Request, res: Response): Promise<void> {
    try {
      const result = await VenueBookingRepository.getAllBookings();

      if (result.success && result.data) {
        if (result.data.length === 0) {
          res.status(404).json({ 
            success: false, 
            message: 'Not Found: No event bookings available.' 
          });
        } else {
          res.status(200).json({ 
            success: true, 
            message: 'Event bookings retrieved successfully.', 
            data: result.data 
          });
        }
      } else {
        res.status(500).json({ 
          success: false, 
          message: result.message || 'Internal Server Error: Failed to retrieve event bookings.' 
        });
      }
    } catch (error) {
      console.error('Error in getAllVenueBookings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error: An unexpected error occurred.' 
      });
    }
  }

  /**
   * Get event booking by ID
   * @route GET /api/bookings/:id
   * @access Private (Booking Owner, Event Organizer, Admins)
   */
  static async getVenueBookingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ 
          success: false, 
          message: 'Bad Request: Booking ID is required.' 
        });
        return;
      }

      const result = await VenueBookingRepository.getBookingById(id);

      if (result.success && result.data) {
        res.status(200).json({ 
          success: true, 
          message: 'Event booking retrieved successfully.', 
          data: result.data 
        });
      } else if (!result.success && result.message === 'Booking not found') {
        res.status(404).json({ 
          success: false, 
          message: 'Not Found: Event booking not found.' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: result.message || 'Internal Server Error: Failed to retrieve event booking.' 
        });
      }
    } catch (error) {
      console.error('Error in getVenueBookingById:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error: An unexpected error occurred.' 
      });
    }
  }

  /**
   * Update event booking
   * @route PUT /api/bookings/:id
   * @access Private (Booking Owner, Event Organizer, Admins)
   */
  static async updateVenueBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates: Partial<VenueBookingInterface> = req.body;

      if (!id) {
        res.status(400).json({ 
          success: false, 
          message: 'Bad Request: Booking ID is required for update.' 
        });
        return;
      }
      
      if (Object.keys(updates).length === 0) {
        res.status(400).json({ 
          success: false, 
          message: 'Bad Request: No update data provided.' 
        });
        return;
      }

      // Validate dates if provided
      if (updates.startDate) {
        updates.startDate = new Date(updates.startDate);
        if (isNaN(updates.startDate.getTime())) {
          res.status(400).json({ 
            success: false, 
            message: 'Bad Request: Invalid start date format.' 
          });
          return;
        }
      }
      
      if (updates.endDate) {
        updates.endDate = new Date(updates.endDate);
        if (isNaN(updates.endDate.getTime())) {
          res.status(400).json({ 
            success: false, 
            message: 'Bad Request: Invalid end date format.' 
          });
          return;
        }
      }

      // Validate approval status if provided
      if (updates.approvalStatus && 
          !['pending', 'approved', 'rejected'].includes(updates.approvalStatus)) {
        res.status(400).json({ 
          success: false, 
          message: 'Bad Request: Invalid approval status provided.' 
        });
        return;
      }

      const result = await VenueBookingRepository.updateBooking(id, updates);

      if (result.success && result.data) {
        res.status(200).json({ 
          success: true, 
          message: 'Event booking updated successfully.', 
          data: result.data 
        });
      } else if (!result.success && result.message === 'Booking not found') {
        res.status(404).json({ 
          success: false, 
          message: 'Not Found: Event booking not found.' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: result.message || 'Internal Server Error: Failed to update event booking.' 
        });
      }
    } catch (error) {
      console.error('Error in updateVenueBooking:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error: An unexpected error occurred.' 
      });
    }
  }

  /**
   * Update event booking status
   * @route PATCH /api/bookings/:id/status
   * @access Private (Event Organizer, Admins)
   */
  static async updateVenueBookingStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { approvalStatus } = req.body;

      if (!id || !approvalStatus) {
        res.status(400).json({ 
          success: false, 
          message: 'Bad Request: Booking ID and approval status are required.' 
        });
        return;
      }

      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(approvalStatus)) {
        res.status(400).json({ 
          success: false, 
          message: 'Bad Request: Invalid approval status provided.' 
        });
        return;
      }

      const result = await VenueBookingRepository.updateBookingStatus(id, approvalStatus as 'pending' | 'approved' | 'rejected');

      if (result.success && result.data) {
        res.status(200).json({ 
          success: true, 
          message: 'Event booking status updated successfully.', 
          data: result.data 
        });
      } else if (!result.success && result.message === 'Booking not found') {
        res.status(404).json({ 
          success: false, 
          message: 'Not Found: Event booking not found.' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: result.message || 'Internal Server Error: Failed to update event booking status.' 
        });
      }
    } catch (error) {
      console.error('Error in updateVenueBookingStatus:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error: An unexpected error occurred.' 
      });
    }
  }

  /**
   * Delete an event booking
   * @route DELETE /api/bookings/:id
   * @access Private (Booking Owner, Event Organizer, Admins)
   */
  static async deleteVenueBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ 
          success: false, 
          message: 'Bad Request: Booking ID is required for deletion.' 
        });
        return;
      }

      const result = await VenueBookingRepository.deleteBooking(id);

      if (result.success) {
        res.status(204).send(); // 204 No Content (successful deletion, no body to return)
      } else if (!result.success && result.message === 'Booking not found') {
        res.status(404).json({ 
          success: false, 
          message: 'Not Found: Event booking not found.' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: result.message || 'Internal Server Error: Failed to delete event booking.' 
        });
      }
    } catch (error) {
      console.error('Error in deleteVenueBooking:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error: An unexpected error occurred.' 
      });
    }
  }

  /**
   * Get bookings by event ID
   * @route GET /api/events/:eventId/bookings
   * @access Private (Event Organizer, Admins)
   */
  static async getBookingsByEventId(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;

      if (!eventId) {
        res.status(400).json({ 
          success: false, 
          message: 'Bad Request: Event ID is required.' 
        });
        return;
      }

      const result = await VenueBookingRepository.getBookingsByEventId(eventId);

      if (result.success && result.data) {
        if (result.data.length === 0) {
          res.status(404).json({ 
            success: false, 
            message: 'Not Found: No bookings found for this event.' 
          });
        } else {
          res.status(200).json({ 
            success: true, 
            message: 'Bookings retrieved successfully for this event.', 
            data: result.data 
          });
        }
      } else {
        res.status(500).json({ 
          success: false, 
          message: result.message || 'Internal Server Error: Failed to retrieve bookings for event.' 
        });
      }
    } catch (error) {
      console.error('Error in getBookingsByEventId:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error: An unexpected error occurred.' 
      });
    }
  }

  /**
   * Get bookings by venue ID
   * @route GET /api/venues/:venueId/bookings
   * @access Private (Venue Owner, Admins)
   */
  static async getBookingsByVenueId(req: Request, res: Response): Promise<void> {
    try {
      const { venueId } = req.params;

      if (!venueId) {
        res.status(400).json({ 
          success: false, 
          message: 'Bad Request: Venue ID is required.' 
        });
        return;
      }

      const result = await VenueBookingRepository.getBookingsByVenueId(venueId);

      if (result.success && result.data) {
        if (result.data.length === 0) {
          res.status(404).json({ 
            success: false, 
            message: 'Not Found: No bookings found for this venue.' 
          });
        } else {
          res.status(200).json({ 
            success: true, 
            message: 'Bookings retrieved successfully for this venue.', 
            data: result.data 
          });
        }
      } else {
        res.status(500).json({ 
          success: false, 
          message: result.message || 'Internal Server Error: Failed to retrieve bookings for venue.' 
        });
      }
    } catch (error) {
      console.error('Error in getBookingsByVenueId:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error: An unexpected error occurred.' 
      });
    }
  }

static async getBookingsByOrganizerId(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    // Ensure the user is authenticated
    if (!req.user || !req.user.userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized: Organizer authentication is required.',
      });
      return;
    }

    const organizerId = req.user.userId; // Extract userId from the token
    console.log("Organizer ID from token:", organizerId); // Debug the value

    // Call repository method with the organizerId
    const result = await VenueBookingRepository.getBookingsByOrganizerId(organizerId);
    
    if (result.success && result.data) {
      if (result.data.length === 0) {
        res.status(404).json({ 
          success: false, 
          message: 'Not Found: No bookings found for this organizer.' 
        });
      } else {
        res.status(200).json({ 
          success: true, 
          message: 'Bookings retrieved successfully for this organizer.', 
          data: result.data 
        });
      }
    } else {
      res.status(500).json({ 
        success: false, 
        message: result.message || 'Internal Server Error: Failed to retrieve bookings for organizer.' 
      });
    }
  } catch (error) {
    console.error('Error in getBookingsByOrganizerId:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: An unexpected error occurred.',
    });
  }
}


  /**
   * Get bookings by organization ID
   * @route GET /api/organizations/:organizationId/bookings
   * @access Private (Organization Members, Admins)
   */
  static async getBookingsByOrganizationId(req: Request, res: Response): Promise<void> {
    try {
      const { organizationId } = req.params;

      if (!organizationId) {
        res.status(400).json({ 
          success: false, 
          message: 'Bad Request: Organization ID is required.' 
        });
        return;
      }

      const result = await VenueBookingRepository.getBookingsByOrganizationId(organizationId);

      if (result.success && result.data) {
        if (result.data.length === 0) {
          res.status(404).json({ 
            success: false, 
            message: 'Not Found: No bookings found for this organization.' 
          });
        } else {
          res.status(200).json({ 
            success: true, 
            message: 'Bookings retrieved successfully for this organization.', 
            data: result.data 
          });
        }
      } else {
        res.status(500).json({ 
          success: false, 
          message: result.message || 'Internal Server Error: Failed to retrieve bookings for organization.' 
        });
      }
    } catch (error) {
      console.error('Error in getBookingsByOrganizationId:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error: An unexpected error occurred.' 
      });
    }
  }

  /**
   * Get bookings by approval status
   * @route GET /api/bookings/status/:status
   * @access Private (Admins)
   */
  static async getBookingsByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;

      if (!status) {
        res.status(400).json({ 
          success: false, 
          message: 'Bad Request: Status is required.' 
        });
        return;
      }

      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ 
          success: false, 
          message: 'Bad Request: Invalid status provided.' 
        });
        return;
      }

      const result = await VenueBookingRepository.getBookingsByStatus(status as 'pending' | 'approved' | 'rejected');

      if (result.success && result.data) {
        if (result.data.length === 0) {
          res.status(404).json({ 
            success: false, 
            message: `Not Found: No bookings found with status: ${status}.` 
          });
        } else {
          res.status(200).json({ 
            success: true, 
            message: `Bookings with status '${status}' retrieved successfully.`, 
            data: result.data 
          });
        }
      } else {
        res.status(500).json({ 
          success: false, 
          message: result.message || 'Internal Server Error: Failed to retrieve bookings by status.' 
        });
      }
    } catch (error) {
      console.error('Error in getBookingsByStatus:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error: An unexpected error occurred.' 
      });
    }
  }

 /**
 * Get bookings by date range with eager loading
 * @route GET /api/bookings/date-range
 * @access Private (Admins)
 */
static async getBookingsByDateRange(req: Request, res: Response): Promise<void> {
    try {
        const { startDate, endDate, filterType, rangeStart, rangeEnd, minStart, minEnd } = req.query;

        // Validate input
        if (!startDate || !endDate) {
            res.status(400).json({ success: false, message: "Bad Request: Start date and end date are required." });
            return;
        }

        const parsedStartDate = new Date(startDate as string);
        const parsedEndDate = new Date(endDate as string);

        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
            res.status(400).json({ success: false, message: "Bad Request: Invalid date format." });
            return;
        }

        if (parsedStartDate > parsedEndDate) {
            res.status(400).json({ success: false, message: "Bad Request: Start date cannot be after end date." });
            return;
        }

        const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
        let query = bookingRepo.createQueryBuilder("booking")
            .leftJoinAndSelect("booking.event", "event")
            .leftJoinAndSelect("booking.venue", "venue")
            .leftJoinAndSelect("booking.user", "user")
            .leftJoinAndSelect("booking.organization", "organization")
            .where("booking.startDate >= :startDate", { startDate: parsedStartDate })
            .andWhere("booking.endDate <= :endDate", { endDate: parsedEndDate });

        // Apply correct filtering based on user selection
        if (filterType === "minutes" && minStart && minEnd) {
            query.andWhere("EXTRACT(MINUTE FROM booking.startTime) BETWEEN :minStart AND :minEnd", { minStart, minEnd });
        }
        if (filterType === "hours" && rangeStart && rangeEnd) {
            query.andWhere("EXTRACT(HOUR FROM booking.startTime) BETWEEN :rangeStart AND :rangeEnd", { rangeStart, rangeEnd });
        }
        if (filterType === "days" && rangeStart && rangeEnd) {
            query.andWhere("EXTRACT(DAY FROM booking.startDate) BETWEEN :rangeStart AND :rangeEnd", { rangeStart, rangeEnd });
        }
        // If "all" is selected, no extra filtering is applied

        const bookings = await query.getMany();

        if (!bookings.length) {
            res.status(404).json({ success: false, message: "Not Found: No bookings found for the selected filter." });
            return;
        }

        res.status(200).json({ success: true, message: "Bookings retrieved successfully.", data: bookings });
    } catch (error) {
        console.error("Error fetching bookings by date range:", error);
        res.status(500).json({ success: false, message: "Internal Server Error: An unexpected error occurred." });
    }
}





  /**
   * Handle Method Not Allowed
   * @route Any unsupported HTTP method
   * @access Public
   */
  static async methodNotAllowed(req: Request, res: Response): Promise<void> {
    res.status(405).json({ 
      success: false, 
      message: 'Method Not Allowed: This HTTP method is not supported for this endpoint.' 
    });
  }

  /**
   * Handle Unauthorized
   * @route Any route requiring authentication
   * @access Public
   */
  static async unauthorized(req: Request, res: Response): Promise<void> {
    res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: Authentication is required or has failed.' 
    });
  }

  /**
   * Handle Forbidden
   * @route Any route requiring specific permissions
   * @access Private (Authenticated Users)
   */
  static async forbidden(req: Request, res: Response): Promise<void> {
    res.status(403).json({ 
      success: false, 
      message: 'Forbidden: You do not have permission to perform this action.' 
    });
  }

/**
   * Check for duplicate bookings in a specific time range
   * @route GET /api/bookings/check-duplicates
   * @access Private (Authenticated Users)
   */

  
}

export { VenueBookingController };