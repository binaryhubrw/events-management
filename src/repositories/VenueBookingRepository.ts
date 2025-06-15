import { AppDataSource } from "../config/Database";
import { Repository } from "typeorm";
import { Event } from "../models/Event";
import { Organization } from "../models/Organization";
import { VenueBookingInterface } from "../interfaces/VenueBookingInterface";
import { VenueBooking } from "../models/VenueBooking";

class VenueBookingRepository {
    static checkDuplicateBookings(arg0: string, parsedStartDate: Date, parsedEndDate: Date, arg3: string, arg4: string, arg5: string) {
        throw new Error('Method not implemented.');
    }
  static VenueBookingRepository: Repository<VenueBooking>;
   static eventRepository: Repository<Event>;
   static organizationRepository: Repository<Organization>;
    /**
     * Create a new event booking
     */
  /**
 * Create a new event booking
 */
static async createBooking(bookingData: VenueBookingInterface): Promise<{ success: boolean; message?: string; data?: VenueBooking }> {
    try {
        // Validate required fields
        if (!bookingData.eventId || !bookingData.venueId || !bookingData.organizerId || 
            !bookingData.organizationId || !bookingData.startDate || !bookingData.endDate || 
            !bookingData.startTime || !bookingData.endTime) {
            return { success: false, message: "Missing required booking fields." };
        }

        // Initialize repositories
        const eventRepo = VenueBookingRepository.getEventRepository();
        const venueRepo = VenueBookingRepository.getVenueRepository();
        const userRepo = VenueBookingRepository.getUserRepository();
        const orgRepo = VenueBookingRepository.getOrganizationRepository();

        // Fetch the related entities to properly associate them
        const event = await eventRepo.findOne({ where: { eventId: bookingData.eventId } });
        if (!event) return { success: false, message: "Event does not exist." };

        const venue = await venueRepo.findOne({ where: { venueId: bookingData.venueId } });
        if (!venue) return { success: false, message: "Venue does not exist." };

        const user = await userRepo.findOne({ where: { userId: bookingData.organizerId } });
        if (!user) return { success: false, message: "Organizer does not exist." };

        const organization = await orgRepo.findOne({ where: { organizationId: bookingData.organizationId } });
        if (!organization) return { success: false, message: "Organization does not exist." };

        // Set default approval status if not provided
        bookingData.approvalStatus = bookingData.approvalStatus || "pending";

        // Create the booking entity with proper relation objects
        const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
        const newBooking = bookingRepo.create({
            event: event,               // Use the full event entity
            venue: venue,               // Use the full venue entity
            user: user,                 // Use the full user entity
            organization: organization, // Use the full organization entity
            startDate: bookingData.startDate,
            endDate: bookingData.endDate,
            startTime: bookingData.startTime,
            endTime: bookingData.endTime,
            approvalStatus: bookingData.approvalStatus as any, // Ensuring enum compatibility
        });

        // Save the booking with all relationships properly set
        const savedBooking = await bookingRepo.save(newBooking);

        return { success: true, data: savedBooking };
    } catch (error:any) {
        console.error("Error creating booking:", error);
        return { success: false, message: `Failed to create booking: ${error.message || 'Unknown error'}` };
    }
}

   

   static getOrganizationRepository(): Repository<Organization> {

    if (!VenueBookingRepository.organizationRepository) {

      VenueBookingRepository.organizationRepository = AppDataSource.getRepository(Organization);
    }
    return VenueBookingRepository.organizationRepository;
  }

    

   static getVenueBookingRepository(): Repository<VenueBooking> {
    if (!VenueBookingRepository.VenueBookingRepository) {
      if (!AppDataSource.isInitialized) {
        throw new Error('Database not initialized.');
      }
      VenueBookingRepository.VenueBookingRepository = AppDataSource.getRepository(VenueBooking);
    }
    return VenueBookingRepository.VenueBookingRepository;
  }


     static getEventRepository(): Repository<Event> {
        if (!VenueBookingRepository.eventRepository) {
            VenueBookingRepository.eventRepository = AppDataSource.getRepository(Event);
        }
        return VenueBookingRepository.eventRepository;
    }


     static userRepository: Repository<any>;

    static getUserRepository(): Repository<any> {
        if (!VenueBookingRepository.userRepository) {
            VenueBookingRepository.userRepository = AppDataSource.getRepository("User");
        }
        return VenueBookingRepository.userRepository;
    }
     static venueRepository: Repository<any>;

    static getVenueRepository(): Repository<any> {
        if (!VenueBookingRepository.venueRepository) {
            VenueBookingRepository.venueRepository = AppDataSource.getRepository("Venue");
        }
        return VenueBookingRepository.venueRepository;
    }


    /**
     * Get all bookings
     */
    static async getAllBookings(): Promise<{ success: boolean; message?: string; data?: VenueBooking[] }> {
        try {
            const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
            const bookings = await bookingRepo.find({
                relations: ["event", "venue", "user", "organization"]
            });
            
            return { 
                success: true, 
                data: bookings,
                message: bookings.length ? undefined : "No bookings found" 
            };
        } catch (error) {
            console.error("Error fetching all bookings:", error);
            return { success: false, message: "Failed to get all bookings" };
        }
    }

    /**
     * Get booking by ID
     */
    static async getBookingById(id: string): Promise<{ success: boolean; message?: string; data?: VenueBooking }> {
        try {
            if (!id) {
                return { success: false, message: "Booking ID is required" };
            }

            const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
            const booking = await bookingRepo.findOne({
                where: { bookingId: id },
                relations: ["event", "venue", "user", "organization"]
            });
            
            if (!booking) {
                return { success: false, message: "Booking not found" };
            }
            
            return { success: true, data: booking };
        } catch (error) {
            console.error("Error fetching booking by ID:", error);
            return { success: false, message: "Failed to get booking by ID" };
        }
    }

    /**
     * Update booking
     */
    static async updateBooking(id: string, bookingData: Partial<VenueBookingInterface>): Promise<{ success: boolean; message?: string; data?: VenueBooking }> {
        try {
            if (!id) {
                return { success: false, message: "Booking ID is required" };
            }

            const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
            const existingBooking = await bookingRepo.findOne({
                where: { bookingId: id },
                relations: ["event", "venue", "user", "organization"]
            });

            if (!existingBooking) {
                return { success: false, message: "Booking not found" };
            }

            // Validate dates if provided
            if (bookingData.startDate && bookingData.endDate) {
                const startDate = new Date(bookingData.startDate);
                const endDate = new Date(bookingData.endDate);
                
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    return { success: false, message: "Invalid date format" };
                }
                
                if (startDate > endDate) {
                    return { success: false, message: "Start date cannot be after end date" };
                }
                
                bookingData.startDate = startDate;
                bookingData.endDate = endDate;
            } else if (bookingData.startDate) {
                const startDate = new Date(bookingData.startDate);
                
                if (isNaN(startDate.getTime())) {
                    return { success: false, message: "Invalid start date format" };
                }
                
                if (startDate > existingBooking.endDate) {
                    return { success: false, message: "Start date cannot be after end date" };
                }
                
                bookingData.startDate = startDate;
            } else if (bookingData.endDate) {
                const endDate = new Date(bookingData.endDate);
                
                if (isNaN(endDate.getTime())) {
                    return { success: false, message: "Invalid end date format" };
                }
                
                if (existingBooking.startDate > endDate) {
                    return { success: false, message: "Start date cannot be after end date" };
                }
                
                bookingData.endDate = endDate;
            }

            // Validate approval status if provided
            if (bookingData.approvalStatus && 
                !['pending', 'approved', 'rejected'].includes(bookingData.approvalStatus)) {
                return { success: false, message: "Invalid approval status" };
            }

            // Merge partial updates into the existing booking
            Object.assign(existingBooking, bookingData);
            const updatedBooking = await bookingRepo.save(existingBooking);
            
            return { success: true, data: updatedBooking };
        } catch (error) {
            console.error("Error updating booking:", error);
            return { success: false, message: "Failed to update booking" };
        }
    }

    /**
     * Update booking status
     */
    static async updateBookingStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<{ success: boolean; message?: string; data?: VenueBooking }> {
        try {
            if (!id) {
                return { success: false, message: "Booking ID is required" };
            }

            // Validate status
            if (!['pending', 'approved', 'rejected'].includes(status)) {
                return { success: false, message: "Invalid approval status" };
            }

            const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
            const existingBooking = await bookingRepo.findOne({
                where: { bookingId: id },
                relations: ["event", "venue", "user", "organization"]
            });

            if (!existingBooking) {
                return { success: false, message: "Booking not found" };
            }

            existingBooking.approvalStatus = status as any; // Cast to ApprovalStatus if imported, e.g. as ApprovalStatus
            const updatedBooking = await bookingRepo.save(existingBooking);
            
            return { success: true, data: updatedBooking };
        } catch (error) {
            console.error("Error updating booking status:", error);
            return { success: false, message: "Failed to update booking status" };
        }
    }

    /**
     * Delete booking
     */
    static async deleteBooking(id: string): Promise<{ success: boolean; message?: string }> {
        try {
            if (!id) {
                return { success: false, message: "Booking ID is required" };
            }

            const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
            const result = await bookingRepo.delete(id);
            
            if (result.affected === 0) {
                return { success: false, message: "Booking not found" };
            }
            
            return { success: true, message: "Booking deleted successfully" };
        } catch (error) {
            console.error("Error deleting booking:", error);
            return { success: false, message: "Failed to delete booking" };
        }
    }

    /**
     * Get bookings by event ID
     */
    static async getBookingsByEventId(eventId: string): Promise<{ success: boolean; message?: string; data?: VenueBooking[] }> {
        try {
            if (!eventId) {
                return { success: false, message: "Event ID is required" };
            }

            // Check if event exists
            const eventRepo = VenueBookingRepository.getEventRepository();
            const eventExists = await eventRepo.findOne({
                where: { eventId }
            });
            
            if (!eventExists) {
                return { success: false, message: "Event does not exist" };
            }

            const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
            const bookings = await bookingRepo.find({
                where: { event: { eventId } },
                relations: ["event", "venue", "user", "organization"]
            });
            
            return { 
                success: true, 
                data: bookings,
                message: bookings.length ? undefined : "No bookings found for this event" 
            };
        } catch (error) {
            console.error("Error fetching bookings by event ID:", error);
            return { success: false, message: "Failed to get bookings by event ID" };
        }
    }

    /**
     * Get bookings by venue ID
     */
    static async getBookingsByVenueId(venueId: string): Promise<{ success: boolean; message?: string; data?: VenueBooking[] }> {
        try {
            if (!venueId) {
                return { success: false, message: "Venue ID is required" };
            }

            const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
            const bookings = await bookingRepo.find({
                where: { venue: { venueId } },
                relations: ["event", "venue", "user", "organization"]
            });
            
            return { 
                success: true, 
                data: bookings,
                message: bookings.length ? undefined : "No bookings found for this venue" 
            };
        } catch (error) {
            console.error("Error fetching bookings by venue ID:", error);
            return { success: false, message: "Failed to get bookings by venue ID" };
        }
    }

    // Add this import at the top of your file:
    // import { Response } from "express";
 static async getBookingsByOrganizerId(organizerId: string): Promise<{ success: boolean; message?: string; data?: VenueBooking[] }> {
  try {
    if (!organizerId) {
      return { success: false, message: "Organizer ID is required" };
    }

    const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
    const bookings = await bookingRepo.find({
      where: { user: { userId: organizerId } }, // Use the correct relation for organizer
      relations: ["event", "venue", "user", "organization"]
    });
    
    return { 
      success: true, 
      data: bookings,
      message: bookings.length ? undefined : "No bookings found for this organizer" 
    };
  } catch (error) {
    console.error("Error fetching bookings by organizer ID:", error);
    return { success: false, message: "Failed to get bookings by organizer ID" };
  }
}

    /**
     * Get bookings by organization ID
     */
    static async getBookingsByOrganizationId(organizationId: string): Promise<{ success: boolean; message?: string; data?: VenueBooking[] }> {
        try {
            if (!organizationId) {
                return { success: false, message: "Organization ID is required" };
            }

            const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
        const bookings = await bookingRepo.find({
            where: { organization: { organizationId } },
            relations: ["event", "venue", "user", "organization"]
        });

            
            return { 
                success: true, 
                data: bookings,
                message: bookings.length ? undefined : "No bookings found for this organization" 
            };
        } catch (error) {
            console.error("Error fetching bookings by organization ID:", error);
            return { success: false, message: "Failed to get bookings by organization ID" };
        }
    }

    /**
     * Get bookings by approval status
     */
    static async getBookingsByStatus(approvalStatus: 'pending' | 'approved' | 'rejected'): Promise<{ success: boolean; message?: string; data?: VenueBooking[] }> {
        try {
            // Validate status
            if (!['pending', 'approved', 'rejected'].includes(approvalStatus)) {
                return { success: false, message: "Invalid approval status" };
            }

            const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
            const bookings = await bookingRepo.find({
                where: { approvalStatus: approvalStatus as any },
                relations: ["event", "venue", "user", "organization"]
            });
            
            return { 
                success: true, 
                data: bookings,
                message: bookings.length ? undefined : `No bookings found with status: ${approvalStatus}` 
            };
        } catch (error) {
            console.error("Error fetching bookings by status:", error);
            return { success: false, message: "Failed to get bookings by status" };
        }
    }

    /**
     * Get bookings by date range
     */
static async getBookingsByDateRange(
    startDate: Date, 
    endDate: Date, 
    filterOptions: ("min" | "hours" | "days" | "all")[]
): Promise<{ success: boolean; message?: string; data?: VenueBooking[] }> {
    try {
        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return { success: false, message: "Invalid date format" };
        }
        
        if (startDate > endDate) {
            return { success: false, message: "Start date cannot be after end date" };
        }

        const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
        let query = bookingRepo.createQueryBuilder("booking")
            .leftJoinAndSelect("booking.event", "event")
            .leftJoinAndSelect("booking.venue", "venue")
            .leftJoinAndSelect("booking.user", "user")
            .leftJoinAndSelect("booking.organization", "organization")
            .where("booking.startDate >= :startDate", { startDate })
            .andWhere("booking.endDate <= :endDate", { endDate });

        // Apply filter based on user selection
        if (filterOptions.includes("min")) {
            query.andWhere("EXTRACT(MINUTE FROM booking.startTime) >= 0");
        }
        if (filterOptions.includes("hours")) {
            query.andWhere("EXTRACT(HOUR FROM booking.startTime) >= 0");
        }
        if (filterOptions.includes("days")) {
            query.andWhere("EXTRACT(DAY FROM booking.startDate) >= 0");
        }

        const bookings = await query.getMany();

        return { 
            success: true, 
            data: bookings,
            message: bookings.length ? undefined : "No bookings found in this date range"
        };
    } catch (error) {
        console.error("Error fetching bookings by date range:", error);
        return { success: false, message: "Failed to get bookings by date range" };
    }
}
    
 
  /**
   * Helper method to convert time string (HH:MM or HH:MM:SS) to minutes
   */
  private static timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

}


export { VenueBookingRepository };