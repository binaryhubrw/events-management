import { VenueBookingInterface } from "../../interfaces/VenueBookingInterface";
import { AppDataSource } from "../../config/Database";
import { VenueBooking } from "../../models/VenueBooking";
import { Between } from "typeorm";
import { AuthenticatedRequest } from "../../middlewares/AuthMiddleware";
import { checkConflict } from "./BookingService";

/**
 * Service to check availability of time slots
 */
export class CheckAbsenceService {
  /**
   * Check available days, hours, and minutes for a specific venue.
   * @param req - Authenticated request containing user token.
   * @param venueId - The venue ID to check availability.
   * @param startDate - The start date range.
   * @param endDate - The end date range.
   * @returns List of available time slots, free days, and detailed gaps.
   */
  static async getAvailableSlots(
    req: AuthenticatedRequest,
    venueId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ availableDays: string[], availableHours: string[], availableMinutes: string[] } | { success: false; message: string }> {
    try {
      // Ensure user is authenticated
      const user = req.user;
      if (!user) {
        return { success: false, message: "Unauthorized access. User token is required." };
      }
      
      console.log(`Checking availability for User: ${user.userId}, Organization: ${user.organizationId}`);
      
      const bookingRepo = AppDataSource.getRepository(VenueBooking);
      
      // Fetch booked slots for the venue within the date range
      const bookedSlots = await bookingRepo.find({
        where: {
          venue: { venueId: venueId },
          startDate: Between(startDate, endDate),
        },
        order: { startDate: "ASC", startTime: "ASC" },
      });
      
      const availableDays: string[] = [];
      const availableHours: string[] = [];
      const availableMinutes: string[] = [];
      
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const currentDateStr = currentDate.toISOString().slice(0, 10);
        const dailyBookings = bookedSlots.filter(
          (booking) => booking.startDate.toISOString().slice(0, 10) === currentDateStr
        );
        
        if (dailyBookings.length === 0) {
          availableDays.push(currentDateStr); // Mark as fully available
        } else {
          let previousEndTime = "00:00"; // Start of the day
          
          // Sort bookings by start time
          dailyBookings.sort((a, b) => a.startTime.localeCompare(b.startTime));
          
          for (const booking of dailyBookings) {
            const { startTime } = booking;
            
            if (previousEndTime < startTime) {
              availableHours.push(`${previousEndTime} - ${startTime} on ${currentDateStr}`);
              availableMinutes.push(`${previousEndTime} - ${startTime} minutes`);
            }
            
            previousEndTime = booking.endTime; // Update latest end time
          }
          
          // Check for availability after the last booking
          if (previousEndTime < "23:59") {
            availableHours.push(`${previousEndTime} - 23:59 on ${currentDateStr}`);
            availableMinutes.push(`${previousEndTime} - 23:59 minutes`);
          }
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return { availableDays, availableHours, availableMinutes };
    } catch (error) {
      console.error("Error checking available slots:", error);
      return { success: false, message: "Failed to check booking availability." };
    }
  }
}

/**
 * Enhanced booking validation service that checks both conflicts and availability
 */
export async function validateBooking(
  req: AuthenticatedRequest,
  bookingData: VenueBookingInterface
): Promise<{ success: boolean; message?: string }> {
  try {
    // Step 1: Check if the requested time is available
    const availabilityCheck = await checkAvailability(req, bookingData);
    if (!availabilityCheck.success) {
      return availabilityCheck;
    }
    
    // Step 2: Check for conflicts with existing bookings
    const conflictCheck = await checkConflict(bookingData);
    if (!conflictCheck.success) {
      return conflictCheck;
    }
    
    return { success: true, message: "Booking is valid and available." };
  } catch (error) {
    console.error("Error validating booking:", error);
    return { success: false, message: "Failed to validate booking." };
  }
}

/**
 * Check if the requested booking time is within available slots
 */
async function checkAvailability(
  req: AuthenticatedRequest,
  bookingData: VenueBookingInterface
): Promise<{ success: boolean; message?: string }> {
  try {
    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(bookingData.endDate);
    const requestedDate = startDate.toISOString().slice(0, 10);
    const requestedStartTime = bookingData.startTime;
    const requestedEndTime = bookingData.endTime;
    
    // Get available slots for the venue
    const availableSlotsResult = await CheckAbsenceService.getAvailableSlots(
      req,
      bookingData.venueId,
      startDate,
      endDate
    );
    
    if ('success' in availableSlotsResult && !availableSlotsResult.success) {
      return availableSlotsResult;
    }
    
    const { availableDays, availableHours } = availableSlotsResult as {
      availableDays: string[];
      availableHours: string[];
      availableMinutes: string[];
    };
    
    // Check if the day is completely available
    if (availableDays.includes(requestedDate)) {
      return { success: true };
    }
    
    // Check if the requested time range falls within available hours
    let isAvailable = false;
    
    for (const timeSlot of availableHours) {
      if (timeSlot.includes(`on ${requestedDate}`)) {
        const timeRange = timeSlot.split(' on ')[0];
        const [availableStart, availableEnd] = timeRange.split(' - ');
        
        // Check if requested time is within this available slot
        if (requestedStartTime >= availableStart && requestedEndTime <= availableEnd) {
          isAvailable = true;
          break;
        }
      }
    }
    
    if (!isAvailable) {
      // Find the nearest available time slot for a helpful message
      let nearestSlot = "";
      for (const timeSlot of availableHours) {
        if (timeSlot.includes(`on ${requestedDate}`)) {
          nearestSlot = timeSlot.split(' on ')[0];
          break;
        }
      }
      
      const message = nearestSlot 
        ? `The requested time (${requestedStartTime} - ${requestedEndTime}) is not available. The nearest available time slot on ${requestedDate} is ${nearestSlot}.`
        : `The requested time (${requestedStartTime} - ${requestedEndTime}) is not available on ${requestedDate}.`;
      
      return { success: false, message };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error checking availability:", error);
    return { success: false, message: "Failed to check availability." };
  }
}
