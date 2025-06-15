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
exports.VenueBookingRepository = void 0;
const VenueBooking_1 = require("../models/VenueBooking");
const Database_1 = require("../config/Database");
const Event_1 = require("../models/Event");
const Organization_1 = require("../models/Organization");
class VenueBookingRepository {
    static checkDuplicateBookings(arg0, parsedStartDate, parsedEndDate, arg3, arg4, arg5) {
        throw new Error('Method not implemented.');
    }
    /**
     * Create a new event booking
     */
    /**
   * Create a new event booking
   */
    static createBooking(bookingData) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const event = yield eventRepo.findOne({ where: { eventId: bookingData.eventId } });
                if (!event)
                    return { success: false, message: "Event does not exist." };
                const venue = yield venueRepo.findOne({ where: { venueId: bookingData.venueId } });
                if (!venue)
                    return { success: false, message: "Venue does not exist." };
                const user = yield userRepo.findOne({ where: { userId: bookingData.organizerId } });
                if (!user)
                    return { success: false, message: "Organizer does not exist." };
                const organization = yield orgRepo.findOne({ where: { organizationId: bookingData.organizationId } });
                if (!organization)
                    return { success: false, message: "Organization does not exist." };
                // Set default approval status if not provided
                bookingData.approvalStatus = bookingData.approvalStatus || "pending";
                // Create the booking entity with proper relation objects
                const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
                const newBooking = bookingRepo.create({
                    event: event, // Use the full event entity
                    venue: venue, // Use the full venue entity
                    user: user, // Use the full user entity
                    organization: organization, // Use the full organization entity
                    startDate: bookingData.startDate,
                    endDate: bookingData.endDate,
                    startTime: bookingData.startTime,
                    endTime: bookingData.endTime,
                    approvalStatus: bookingData.approvalStatus, // Ensuring enum compatibility
                });
                // Save the booking with all relationships properly set
                const savedBooking = yield bookingRepo.save(newBooking);
                return { success: true, data: savedBooking };
            }
            catch (error) {
                console.error("Error creating booking:", error);
                return { success: false, message: `Failed to create booking: ${error.message || 'Unknown error'}` };
            }
        });
    }
    static getOrganizationRepository() {
        if (!VenueBookingRepository.organizationRepository) {
            VenueBookingRepository.organizationRepository = Database_1.AppDataSource.getRepository(Organization_1.Organization);
        }
        return VenueBookingRepository.organizationRepository;
    }
    static getVenueBookingRepository() {
        if (!VenueBookingRepository.VenueBookingRepository) {
            if (!Database_1.AppDataSource.isInitialized) {
                throw new Error('Database not initialized.');
            }
            VenueBookingRepository.VenueBookingRepository = Database_1.AppDataSource.getRepository(VenueBooking_1.EventBooking);
        }
        return VenueBookingRepository.VenueBookingRepository;
    }
    static getEventRepository() {
        if (!VenueBookingRepository.eventRepository) {
            VenueBookingRepository.eventRepository = Database_1.AppDataSource.getRepository(Event_1.Event);
        }
        return VenueBookingRepository.eventRepository;
    }
    static getUserRepository() {
        if (!VenueBookingRepository.userRepository) {
            VenueBookingRepository.userRepository = Database_1.AppDataSource.getRepository("User");
        }
        return VenueBookingRepository.userRepository;
    }
    static getVenueRepository() {
        if (!VenueBookingRepository.venueRepository) {
            VenueBookingRepository.venueRepository = Database_1.AppDataSource.getRepository("Venue");
        }
        return VenueBookingRepository.venueRepository;
    }
    /**
     * Get all bookings
     */
    static getAllBookings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
                const bookings = yield bookingRepo.find({
                    relations: ["event", "venue", "user", "organization"]
                });
                return {
                    success: true,
                    data: bookings,
                    message: bookings.length ? undefined : "No bookings found"
                };
            }
            catch (error) {
                console.error("Error fetching all bookings:", error);
                return { success: false, message: "Failed to get all bookings" };
            }
        });
    }
    /**
     * Get booking by ID
     */
    static getBookingById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!id) {
                    return { success: false, message: "Booking ID is required" };
                }
                const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
                const booking = yield bookingRepo.findOne({
                    where: { bookingId: id },
                    relations: ["event", "venue", "user", "organization"]
                });
                if (!booking) {
                    return { success: false, message: "Booking not found" };
                }
                return { success: true, data: booking };
            }
            catch (error) {
                console.error("Error fetching booking by ID:", error);
                return { success: false, message: "Failed to get booking by ID" };
            }
        });
    }
    /**
     * Update booking
     */
    static updateBooking(id, bookingData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!id) {
                    return { success: false, message: "Booking ID is required" };
                }
                const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
                const existingBooking = yield bookingRepo.findOne({
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
                }
                else if (bookingData.startDate) {
                    const startDate = new Date(bookingData.startDate);
                    if (isNaN(startDate.getTime())) {
                        return { success: false, message: "Invalid start date format" };
                    }
                    if (startDate > existingBooking.endDate) {
                        return { success: false, message: "Start date cannot be after end date" };
                    }
                    bookingData.startDate = startDate;
                }
                else if (bookingData.endDate) {
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
                const updatedBooking = yield bookingRepo.save(existingBooking);
                return { success: true, data: updatedBooking };
            }
            catch (error) {
                console.error("Error updating booking:", error);
                return { success: false, message: "Failed to update booking" };
            }
        });
    }
    /**
     * Update booking status
     */
    static updateBookingStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!id) {
                    return { success: false, message: "Booking ID is required" };
                }
                // Validate status
                if (!['pending', 'approved', 'rejected'].includes(status)) {
                    return { success: false, message: "Invalid approval status" };
                }
                const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
                const existingBooking = yield bookingRepo.findOne({
                    where: { bookingId: id },
                    relations: ["event", "venue", "user", "organization"]
                });
                if (!existingBooking) {
                    return { success: false, message: "Booking not found" };
                }
                existingBooking.approvalStatus = status; // Cast to ApprovalStatus if imported, e.g. as ApprovalStatus
                const updatedBooking = yield bookingRepo.save(existingBooking);
                return { success: true, data: updatedBooking };
            }
            catch (error) {
                console.error("Error updating booking status:", error);
                return { success: false, message: "Failed to update booking status" };
            }
        });
    }
    /**
     * Delete booking
     */
    static deleteBooking(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!id) {
                    return { success: false, message: "Booking ID is required" };
                }
                const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
                const result = yield bookingRepo.delete(id);
                if (result.affected === 0) {
                    return { success: false, message: "Booking not found" };
                }
                return { success: true, message: "Booking deleted successfully" };
            }
            catch (error) {
                console.error("Error deleting booking:", error);
                return { success: false, message: "Failed to delete booking" };
            }
        });
    }
    /**
     * Get bookings by event ID
     */
    static getBookingsByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!eventId) {
                    return { success: false, message: "Event ID is required" };
                }
                // Check if event exists
                const eventRepo = VenueBookingRepository.getEventRepository();
                const eventExists = yield eventRepo.findOne({
                    where: { eventId }
                });
                if (!eventExists) {
                    return { success: false, message: "Event does not exist" };
                }
                const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
                const bookings = yield bookingRepo.find({
                    where: { event: { eventId } },
                    relations: ["event", "venue", "user", "organization"]
                });
                return {
                    success: true,
                    data: bookings,
                    message: bookings.length ? undefined : "No bookings found for this event"
                };
            }
            catch (error) {
                console.error("Error fetching bookings by event ID:", error);
                return { success: false, message: "Failed to get bookings by event ID" };
            }
        });
    }
    /**
     * Get bookings by venue ID
     */
    static getBookingsByVenueId(venueId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!venueId) {
                    return { success: false, message: "Venue ID is required" };
                }
                const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
                const bookings = yield bookingRepo.find({
                    where: { venue: { venueId } },
                    relations: ["event", "venue", "user", "organization"]
                });
                return {
                    success: true,
                    data: bookings,
                    message: bookings.length ? undefined : "No bookings found for this venue"
                };
            }
            catch (error) {
                console.error("Error fetching bookings by venue ID:", error);
                return { success: false, message: "Failed to get bookings by venue ID" };
            }
        });
    }
    // Add this import at the top of your file:
    // import { Response } from "express";
    static getBookingsByOrganizerId(organizerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!organizerId) {
                    return { success: false, message: "Organizer ID is required" };
                }
                const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
                const bookings = yield bookingRepo.find({
                    where: { user: { userId: organizerId } }, // Use the correct relation for organizer
                    relations: ["event", "venue", "user", "organization"]
                });
                return {
                    success: true,
                    data: bookings,
                    message: bookings.length ? undefined : "No bookings found for this organizer"
                };
            }
            catch (error) {
                console.error("Error fetching bookings by organizer ID:", error);
                return { success: false, message: "Failed to get bookings by organizer ID" };
            }
        });
    }
    /**
     * Get bookings by organization ID
     */
    static getBookingsByOrganizationId(organizationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!organizationId) {
                    return { success: false, message: "Organization ID is required" };
                }
                const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
                const bookings = yield bookingRepo.find({
                    where: { organization: { organizationId } },
                    relations: ["event", "venue", "user", "organization"]
                });
                return {
                    success: true,
                    data: bookings,
                    message: bookings.length ? undefined : "No bookings found for this organization"
                };
            }
            catch (error) {
                console.error("Error fetching bookings by organization ID:", error);
                return { success: false, message: "Failed to get bookings by organization ID" };
            }
        });
    }
    /**
     * Get bookings by approval status
     */
    static getBookingsByStatus(approvalStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate status
                if (!['pending', 'approved', 'rejected'].includes(approvalStatus)) {
                    return { success: false, message: "Invalid approval status" };
                }
                const bookingRepo = VenueBookingRepository.getVenueBookingRepository();
                const bookings = yield bookingRepo.find({
                    where: { approvalStatus: approvalStatus },
                    relations: ["event", "venue", "user", "organization"]
                });
                return {
                    success: true,
                    data: bookings,
                    message: bookings.length ? undefined : `No bookings found with status: ${approvalStatus}`
                };
            }
            catch (error) {
                console.error("Error fetching bookings by status:", error);
                return { success: false, message: "Failed to get bookings by status" };
            }
        });
    }
    /**
     * Get bookings by date range
     */
    static getBookingsByDateRange(startDate, endDate, filterOptions) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const bookings = yield query.getMany();
                return {
                    success: true,
                    data: bookings,
                    message: bookings.length ? undefined : "No bookings found in this date range"
                };
            }
            catch (error) {
                console.error("Error fetching bookings by date range:", error);
                return { success: false, message: "Failed to get bookings by date range" };
            }
        });
    }
    /**
     * Helper method to convert time string (HH:MM or HH:MM:SS) to minutes
     */
    static timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }
}
exports.VenueBookingRepository = VenueBookingRepository;
