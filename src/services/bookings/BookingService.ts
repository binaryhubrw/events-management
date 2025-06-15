import {VenueBookingInterface  } from "../../interfaces/VenueBookingInterface";
import { VenueBookingRepository } from "../../repositories/VenueBookingRepository";

export async function checkConflict(
  bookingData: VenueBookingInterface
): Promise<{ success: boolean; message?: string }> {
  try {
    const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(bookingData.endDate);
    const startTimeParts = bookingData.startTime.split(":");
    const endTimeParts = bookingData.endTime.split(":");

    const startHour = parseInt(startTimeParts[0]);
    const startMinute = parseInt(startTimeParts[1]);
    const endHour = parseInt(endTimeParts[0]);
    const endMinute = parseInt(endTimeParts[1]);

    // Validate time format and ranges
    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
      return { success: false, message: "Invalid time format: Start time and end time must be in HH:mm format." };
    }
    if (startDate > endDate) {
      return { success: false, message: "Invalid date range: Start date cannot be after end date." };
    }
    if (startDate.getTime() === endDate.getTime() && (startHour > endHour || (startHour === endHour && startMinute >= endMinute))) {
      return { success: false, message: "Invalid time range: Start time must be before end time on the same day." };
    }

    // Convert to total minutes for easier comparison (from midnight)
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    // Check if booking with same details already exists
    const existingBooking = await bookingRepo.createQueryBuilder("booking")
      .where("booking.venueVenueId = :venueId", { venueId: bookingData.venueId })
      .andWhere("booking.eventEventId = :eventId", { eventId: bookingData.eventId })
      .andWhere("booking.startDate = :startDate", { startDate: bookingData.startDate })
      .andWhere("booking.startTime = :startTime AND booking.endTime = :endTime", 
               { startTime: bookingData.startTime, endTime: bookingData.endTime })
      .getOne();

    if (existingBooking) {
      return { success: false, message: "Booking already exists with the same venue, event, date, and time." };
    }

    // Check for time conflicts with existing bookings
    // A conflict occurs when:
    // 1. The dates overlap (startDate ≤ existingEndDate AND endDate ≥ existingStartDate)
    // 2. The times overlap (startTime < existingEndTime AND endTime > existingStartTime)
    const conflictingBookings = await bookingRepo.createQueryBuilder("booking")
      .where("booking.venueVenueId = :venueId", { venueId: bookingData.venueId })
      .andWhere("(booking.startDate <= :endDate AND booking.endDate >= :startDate)", 
               { startDate: startDate.toISOString().split('T')[0], 
                 endDate: endDate.toISOString().split('T')[0] })
      .getMany();

    // For each potentially conflicting booking by date, check if the times also conflict
    for (const booking of conflictingBookings) {
      const existingStartTimeParts = booking.startTime.split(":");
      const existingEndTimeParts = booking.endTime.split(":");
      
      const existingStartTotalMinutes = 
        parseInt(existingStartTimeParts[0]) * 60 + parseInt(existingStartTimeParts[1]);
      const existingEndTotalMinutes = 
        parseInt(existingEndTimeParts[0]) * 60 + parseInt(existingEndTimeParts[1]);
      
      // Check if time periods overlap
      if (startTotalMinutes < existingEndTotalMinutes && 
          endTotalMinutes > existingStartTotalMinutes) {
        return {
          success: false,
          message: `Time conflict detected with existing booking from ${booking.startTime} to ${booking.endTime}. Please choose another time slot.`
        };
      }
      
      // Check if the new booking starts too soon after an existing booking (buffer time check)
      const bufferTimeMinutes = 30; // Using 30 minutes as buffer
      if (existingEndTotalMinutes <= startTotalMinutes && 
          startTotalMinutes < existingEndTotalMinutes + bufferTimeMinutes) {
        return {
          success: false,
          message: `Your booking starts too soon after an existing booking that ends at ${booking.endTime}. Please allow at least 30 minutes between bookings.`
        };
      }
      
      // Check if the new booking ends too close to the start of another booking
      if (endTotalMinutes <= existingStartTotalMinutes && 
          existingStartTotalMinutes < endTotalMinutes + bufferTimeMinutes) {
        return {
          success: false,
          message: `Your booking ends too close to another booking that starts at ${booking.startTime}. Please allow at least 30 minutes between bookings.`
        };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error checking conflicts:", error);
    return { success: false, message: "Failed to check booking conflicts." };
  }
}