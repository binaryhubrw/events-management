"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckAbsenceService = void 0;
exports.validateBooking = validateBooking;
const Database_1 = require("../../config/Database");
const VenueBooking_1 = require("../../models/VenueBooking");
const typeorm_1 = require("typeorm");
const BookingService_1 = require("./BookingService");
/**
 * Service to check availability of time slots
 */
class CheckAbsenceService {
    /**
     * Check available days, hours, and minutes for a specific venue.
     * @param req - Authenticated request containing user token.
     * @param venueId - The venue ID to check availability.
     * @param startDate - The start date range.
     * @param endDate - The end date range.
     * @returns List of available time slots, free days, and detailed gaps.
     */
    static getAvailableSlots(req, venueId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Ensure user is authenticated
                const user = req.user;
                if (!user) {
                    return { success: false, message: "Unauthorized access. User token is required." };
                }
                console.log(`Checking availability for User: ${user.userId}, Organization: ${user.organizationId}`);
                const bookingRepo = Database_1.AppDataSource.getRepository(VenueBooking_1.EventBooking);
                // Fetch booked slots for the venue within the date range
                const bookedSlots = yield bookingRepo.find({
                    where: {
                        venue: { venueId: venueId },
                        startDate: (0, typeorm_1.Between)(startDate, endDate),
                    },
                    order: { startDate: "ASC", startTime: "ASC" },
                });
                const availableDays = [];
                const availableHours = [];
                const availableMinutes = [];
                let currentDate = new Date(startDate);
                while (currentDate <= endDate) {
                    const currentDateStr = currentDate.toISOString().slice(0, 10);
                    const dailyBookings = bookedSlots.filter((booking) => booking.startDate.toISOString().slice(0, 10) === currentDateStr);
                    if (dailyBookings.length === 0) {
                        availableDays.push(currentDateStr); // Mark as fully available
                    }
                    else {
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
            }
            catch (error) {
                console.error("Error checking available slots:", error);
                return { success: false, message: "Failed to check booking availability." };
            }
        });
    }
}
exports.CheckAbsenceService = CheckAbsenceService;
/**
 * Enhanced booking validation service that checks both conflicts and availability
 */
function validateBooking(req, bookingData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Step 1: Check if the requested time is available
            const availabilityCheck = yield checkAvailability(req, bookingData);
            if (!availabilityCheck.success) {
                return availabilityCheck;
            }
            // Step 2: Check for conflicts with existing bookings
            const conflictCheck = yield (0, BookingService_1.checkConflict)(bookingData);
            if (!conflictCheck.success) {
                return conflictCheck;
            }
            return { success: true, message: "Booking is valid and available." };
        }
        catch (error) {
            console.error("Error validating booking:", error);
            return { success: false, message: "Failed to validate booking." };
        }
    });
}
/**
 * Check if the requested booking time is within available slots
 */
function checkAvailability(req, bookingData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const startDate = new Date(bookingData.startDate);
            const endDate = new Date(bookingData.endDate);
            const requestedDate = startDate.toISOString().slice(0, 10);
            const requestedStartTime = bookingData.startTime;
            const requestedEndTime = bookingData.endTime;
            // Get available slots for the venue
            const availableSlotsResult = yield CheckAbsenceService.getAvailableSlots(req, bookingData.venueId, startDate, endDate);
            if ('success' in availableSlotsResult && !availableSlotsResult.success) {
                return availableSlotsResult;
            }
            const { availableDays, availableHours } = availableSlotsResult;
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
        }
        catch (error) {
            console.error("Error checking availability:", error);
            return { success: false, message: "Failed to check availability." };
        }
    });
}
