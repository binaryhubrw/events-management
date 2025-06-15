"use strict";
// Fixed version of RegistrationRepository.ts with all ticketType -> ticketTypes corrections
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
exports.RegistrationRepository = void 0;
const typeorm_1 = require("typeorm");
const Database_1 = require("../config/Database");
const Registration_1 = require("../models/Registration");
const TicketType_1 = require("../models/TicketType");
const ValidationRegistrationService_1 = require("../services/registrations/ValidationRegistrationService");
const class_validator_1 = require("class-validator");
const Venue_1 = require("../models/Venue");
const User_1 = require("../models/User");
class RegistrationRepository {
    static create(registrationData) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Validate external IDs (existence in DB) using ValidationService
            const validationServiceResult = yield ValidationRegistrationService_1.ValidationService.validateRegistrationIds(registrationData);
            if (!validationServiceResult.valid) {
                return { success: false, message: validationServiceResult.message };
            }
            try {
                const entityData = Object.assign({}, registrationData);
                // Map relation IDs to partial entities for TypeORM's .create()
                if (registrationData.event && registrationData.event.eventId) {
                    entityData.event = { eventId: registrationData.event.eventId };
                }
                if (registrationData.user && registrationData.user.userId) {
                    entityData.user = { userId: registrationData.user.userId };
                }
                if (registrationData.buyer && registrationData.buyer.userId) {
                    entityData.buyer = { userId: registrationData.buyer.userId };
                }
                if (registrationData.venue && registrationData.venue.venueId) {
                    entityData.venue = { venueId: registrationData.venue.venueId };
                }
                // --- CRITICAL CHANGE FOR MANY-TO-MANY TICKET TYPES ---
                if (registrationData.ticketTypes && registrationData.ticketTypes.length > 0) {
                    const ticketTypeIds = registrationData.ticketTypes.map((tt) => tt.ticketTypeId);
                    const foundTicketTypes = yield this.ticketTypeRepository.find({
                        where: { ticketTypeId: (0, typeorm_1.In)(ticketTypeIds) },
                    });
                    entityData.ticketTypes = foundTicketTypes;
                }
                else {
                    entityData.ticketTypes = [];
                }
                // --- END CRITICAL CHANGE ---
                const newRegistration = this.repository.create(entityData);
                // 2. Perform class-validator validation on the new entity instance
                const errors = yield (0, class_validator_1.validate)(newRegistration);
                if (errors.length > 0) {
                    const errorMessages = errors.flatMap((error) => Object.values(error.constraints || {}));
                    return { success: false, message: "Input validation failed: " + errorMessages.join(", ") };
                }
                const savedRegistration = yield this.repository.save(newRegistration);
                // Handle case where save might return an array (shouldn't happen here, but for type safety)
                const registrationObj = Array.isArray(savedRegistration) ? savedRegistration[0] : savedRegistration;
                if (!registrationObj || !registrationObj.registrationId) {
                    return { success: false, message: "Failed to retrieve registration ID after save." };
                }
                const fetchedRegistration = yield this.repository.findOne({
                    where: { registrationId: registrationObj.registrationId },
                    relations: ["event", "user", "buyer", "venue", "ticketTypes"], // Correctly using 'ticketTypes' (plural)
                });
                if (!fetchedRegistration) {
                    return { success: false, message: "Failed to retrieve saved registration with relations." };
                }
                return { success: true, data: fetchedRegistration, message: "Registration created successfully." };
            }
            catch (error) {
                console.error("Error creating registration in repository:", error);
                if (error.code === "23505") {
                    return { success: false, message: "Failed to create registration: A similar entry already exists." };
                }
                if (error.code === "23503") {
                    return {
                        success: false,
                        message: "Failed to create registration: A referenced entity (e.g., Event, User, TicketType) does not exist or relation is incorrect.",
                    };
                }
                return { success: false, message: `Failed to create registration: ${error.message || "Unknown error"}` };
            }
        });
    }
    // Find All Registrations
    static findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const registrations = yield this.repository.find({
                    relations: ["event", "user", "buyer", "ticketTypes", "venue"], // Correctly using 'ticketTypes' (plural)
                });
                return { success: true, data: registrations };
            }
            catch (error) {
                return { success: false, message: "Failed to fetch registrations." };
            }
        });
    }
    // Find Registration by ID
    static findById(registrationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!registrationId) {
                return { success: false, message: "Registration ID is required." };
            }
            try {
                const registration = yield this.repository.findOne({
                    where: { registrationId },
                    relations: ["event", "user", "buyer", "ticketTypes", "venue"], // Correctly using 'ticketTypes' (plural)
                });
                if (!registration) {
                    return { success: false, message: "Registration not found." };
                }
                return { success: true, data: registration };
            }
            catch (error) {
                return { success: false, message: "Failed to find registration." };
            }
        });
    }
    // Update Registration (With Validation)
    static update(registrationId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!registrationId) {
                return { success: false, message: "Registration ID is required." };
            }
            // Validate external IDs (existence in DB) using ValidationService
            const validation = yield ValidationRegistrationService_1.ValidationService.validateRegistrationIds(updateData);
            if (!validation.valid) {
                return { success: false, message: (_a = validation.errors) === null || _a === void 0 ? void 0 : _a.join(", ") };
            }
            try {
                const registration = yield this.repository.findOne({ where: { registrationId } });
                if (!registration) {
                    return { success: false, message: "Registration not found." };
                }
                // Map updateData to match Registration entity structure
                const entityData = Object.assign({}, updateData);
                if (updateData.event && typeof updateData.event === "object" && "eventId" in updateData.event) {
                    entityData.event = { eventId: updateData.event.eventId };
                }
                if (updateData.user && typeof updateData.user === "object" && "userId" in updateData.user) {
                    entityData.user = { userId: updateData.user.userId };
                }
                if (updateData.buyer && typeof updateData.buyer === "object" && "userId" in updateData.buyer) {
                    entityData.buyer = { userId: updateData.buyer.userId };
                }
                // FIXED: Changed from ticketTypes (singular object) to ticketTypes (array of objects)
                if (updateData.ticketTypes && Array.isArray(updateData.ticketTypes)) {
                    const ticketTypeIds = updateData.ticketTypes.map((tt) => typeof tt === "object" && "ticketTypeId" in tt ? tt.ticketTypeId : tt);
                    const foundTicketTypes = yield this.ticketTypeRepository.find({
                        where: { ticketTypeId: (0, typeorm_1.In)(ticketTypeIds) },
                    });
                    entityData.ticketTypes = foundTicketTypes;
                }
                if (updateData.venue && typeof updateData.venue === "object" && "venueId" in updateData.venue) {
                    entityData.venue = { venueId: updateData.venue.venueId };
                }
                this.repository.merge(registration, entityData);
                const updatedRegistration = yield this.repository.save(registration);
                return { success: true, data: updatedRegistration, message: "Registration updated successfully." };
            }
            catch (error) {
                return { success: false, message: "Failed to update registration." };
            }
        });
    }
    // Delete Registration
    static delete(registrationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!registrationId) {
                return { success: false, message: "Registration ID is required." };
            }
            try {
                const deleteResult = yield this.repository.delete(registrationId);
                if (deleteResult.affected === 0) {
                    return { success: false, message: "Registration not found or already deleted." };
                }
                return { success: true, message: "Registration deleted successfully." };
            }
            catch (error) {
                return { success: false, message: "Failed to delete registration." };
            }
        });
    }
    // Event-Specific Operations
    static findByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!eventId) {
                return { success: false, message: "Event ID is required." };
            }
            try {
                const registrations = yield this.repository.find({
                    where: { event: { eventId } },
                    relations: ["user", "buyer", "ticketTypes", "venue"], // FIXED: Changed from ticketType to ticketTypes
                });
                return { success: true, data: registrations };
            }
            catch (error) {
                return { success: false, message: "Failed to fetch registrations for this event." };
            }
        });
    }
    static getEventRegistrationStats(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!eventId) {
                return { success: false, message: "Event ID is required." };
            }
            try {
                // Get total registrations
                const totalRegistrations = yield this.repository.count({
                    where: { event: { eventId } },
                });
                // Get total tickets
                const ticketsResult = yield this.repository
                    .createQueryBuilder("registration")
                    .select("SUM(registration.noOfTickets)", "totalTickets")
                    .where("registration.event.eventId = :eventId", { eventId })
                    .getRawOne();
                // FIXED: Updated query to use ticketTypes (plural) and join table
                const ticketTypeStats = yield this.repository
                    .createQueryBuilder("registration")
                    .select("ticketType.ticketTypeId", "ticketTypeId")
                    .addSelect("ticketType.ticketName", "ticketName")
                    .addSelect("COUNT(registration.registrationId)", "count")
                    .addSelect("SUM(registration.noOfTickets)", "tickets")
                    .innerJoin("registration.ticketTypes", "ticketTypes") // FIXED: Changed from ticketType to ticketTypes
                    .where("registration.event.eventId = :eventId", { eventId })
                    .groupBy("ticketType.ticketTypeId")
                    .addGroupBy("ticketType.ticketName")
                    .getRawMany();
                // Get attendance stats
                const attendanceStats = yield this.repository
                    .createQueryBuilder("registration")
                    .select("COUNT(CASE WHEN registration.attended = true THEN 1 END)", "attended")
                    .addSelect("COUNT(CASE WHEN registration.attended = false THEN 1 END)", "notAttended")
                    .where("registration.event.eventId = :eventId", { eventId })
                    .getRawOne();
                const stats = {
                    totalRegistrations,
                    totalTickets: ticketsResult.totalTickets || 0,
                    ticketTypeStats,
                    attendanceStats,
                };
                return { success: true, data: stats };
            }
            catch (error) {
                return { success: false, message: "Failed to fetch registration statistics for this event." };
            }
        });
    }
    static countRegistrationsByEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!eventId) {
                return { success: false, message: "Event ID is required." };
            }
            try {
                const count = yield this.repository.count({
                    where: { event: { eventId } },
                });
                return { success: true, data: count };
            }
            catch (error) {
                return { success: false, message: "Failed to count registrations for this event." };
            }
        });
    }
    // User-Specific Operations
    static findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId) {
                return { success: false, message: "User ID is required." };
            }
            try {
                const registrations = yield this.repository.find({
                    where: { user: { userId } },
                    relations: ["event", "ticketTypes", "venue"], // FIXED: Changed from ticketType to ticketTypes
                });
                return { success: true, data: registrations };
            }
            catch (error) {
                return { success: false, message: "Failed to fetch registrations for this user." };
            }
        });
    }
    static findUpcomingByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId) {
                return { success: false, message: "User ID is required." };
            }
            try {
                const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
                // Need to join with Event to get event date for comparison
                const registrations = yield this.repository
                    .createQueryBuilder("registration")
                    .innerJoinAndSelect("registration.event", "event")
                    .innerJoinAndSelect("registration.ticketTypes", "ticketTypes") // FIXED: Changed from ticketType to ticketTypes
                    .innerJoinAndSelect("registration.venue", "venue")
                    .where("registration.user.userId = :userId", { userId })
                    .andWhere("event.startDate >= :currentDate", { currentDate })
                    .getMany();
                return { success: true, data: registrations };
            }
            catch (error) {
                return { success: false, message: "Failed to fetch upcoming registrations for this user." };
            }
        });
    }
    static findHistoryByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId) {
                return { success: false, message: "User ID is required." };
            }
            try {
                const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
                // Need to join with Event to get event date for comparison
                const registrations = yield this.repository
                    .createQueryBuilder("registration")
                    .innerJoinAndSelect("registration.event", "event")
                    .innerJoinAndSelect("registration.ticketTypes", "ticketTypes") // FIXED: Changed from ticketType to ticketTypes
                    .innerJoinAndSelect("registration.venue", "venue")
                    .where("registration.user.userId = :userId", { userId })
                    .andWhere("event.startDate < :currentDate", { currentDate })
                    .getMany();
                return { success: true, data: registrations };
            }
            catch (error) {
                return { success: false, message: "Failed to fetch registration history for this user." };
            }
        });
    }
    // QR Code Operations
    static findByQrCode(qrCode) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!qrCode) {
                return { success: false, message: "QR code is required." };
            }
            try {
                const registration = yield this.repository.findOne({
                    where: { qrCode },
                    relations: ["event", "user", "buyer", "ticketTypes", "venue"], // FIXED: Changed from ticketType to ticketTypes
                });
                if (!registration) {
                    return { success: false, message: "Registration not found with this QR code." };
                }
                return { success: true, data: registration };
            }
            catch (error) {
                return { success: false, message: "Failed to find registration by QR code." };
            }
        });
    }
    static updateQrCode(registrationId, qrCode) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!registrationId) {
                return { success: false, message: "Registration ID is required." };
            }
            if (!qrCode) {
                return { success: false, message: "QR code is required." };
            }
            try {
                const updateResult = yield this.repository.update(registrationId, { qrCode });
                if (updateResult.affected === 0) {
                    return { success: false, message: "Registration not found or QR code not updated." };
                }
                return { success: true, message: "QR code updated successfully." };
            }
            catch (error) {
                return { success: false, message: "Failed to update QR code." };
            }
        });
    }
    // Attendance Operations
    static updateAttendance(registrationId, attended, checkDate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!registrationId) {
                return { success: false, message: "Registration ID is required." };
            }
            try {
                const updateData = { attended };
                if (checkDate) {
                    updateData.checkDate = checkDate;
                }
                else if (attended) {
                    // If marking as attended and no check date provided, use current date
                    updateData.checkDate = new Date().toISOString().split("T")[0];
                }
                const updateResult = yield this.repository.update(registrationId, updateData);
                if (updateResult.affected === 0) {
                    return { success: false, message: "Registration not found or attendance not updated." };
                }
                return { success: true, message: "Attendance updated successfully." };
            }
            catch (error) {
                return { success: false, message: "Failed to update attendance." };
            }
        });
    }
    static findAttendanceByEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!eventId) {
                return { success: false, message: "Event ID is required." };
            }
            try {
                const registrations = yield this.repository.find({
                    where: {
                        event: { eventId },
                        attended: true,
                    },
                    relations: ["user", "ticketTypes"], // FIXED: Changed from ticketType to ticketTypes
                });
                return { success: true, data: registrations };
            }
            catch (error) {
                return { success: false, message: "Failed to fetch attendance for this event." };
            }
        });
    }
    static bulkCheckIn(registrationIds, checkDate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!registrationIds || registrationIds.length === 0) {
                return { success: false, message: "Registration IDs are required." };
            }
            try {
                const date = checkDate || new Date().toISOString().split("T")[0];
                // Use transaction to ensure all updates succeed or fail together
                yield Database_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                    const promises = registrationIds.map((id) => transactionalEntityManager.update(Registration_1.Registration, id, {
                        attended: true,
                        checkDate: date,
                    }));
                    yield Promise.all(promises);
                }));
                return { success: true, message: "Bulk check-in completed successfully." };
            }
            catch (error) {
                return { success: false, message: "Failed to perform bulk check-in." };
            }
        });
    }
    // Payment Operations
    static updatePaymentStatus(registrationId, paymentStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!registrationId) {
                return { success: false, message: "Registration ID is required." };
            }
            if (!paymentStatus) {
                return { success: false, message: "Payment status is required." };
            }
            try {
                const updateResult = yield this.repository.update(registrationId, { paymentStatus });
                if (updateResult.affected === 0) {
                    return { success: false, message: "Registration not found or payment status not updated." };
                }
                return { success: true, message: "Payment status updated successfully." };
            }
            catch (error) {
                return { success: false, message: "Failed to update payment status." };
            }
        });
    }
    static findByPaymentStatus(paymentStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!paymentStatus) {
                return { success: false, message: "Payment status is required." };
            }
            try {
                const registrations = yield this.repository.find({
                    where: { paymentStatus },
                    relations: ["event", "user", "buyer", "ticketTypes", "venue"], // FIXED: Changed from ticketType to ticketTypes
                });
                return { success: true, data: registrations };
            }
            catch (error) {
                return { success: false, message: "Failed to fetch registrations by payment status." };
            }
        });
    }
    // Venue Operations
    static findByVenueId(venueId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!venueId) {
                return { success: false, message: "Venue ID is required." };
            }
            try {
                const registrations = yield this.repository.find({
                    where: { venue: { venueId } },
                    relations: ["event", "user", "ticketTypes"], // FIXED: Changed from ticketType to ticketTypes
                });
                return { success: true, data: registrations };
            }
            catch (error) {
                return { success: false, message: "Failed to fetch registrations for this venue." };
            }
        });
    }
    static getVenueCapacityInfo(venueId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!venueId) {
                return { success: false, message: "Venue ID is required." };
            }
            try {
                // Get venue capacity
                const venueRepository = Database_1.AppDataSource.getRepository(Venue_1.Venue);
                const venue = yield venueRepository.findOne({ where: { venueId } });
                if (!venue) {
                    return { success: false, message: "Venue not found." };
                }
                // Get total registrations for this venue
                const registrationsCount = yield this.repository.count({
                    where: { venue: { venueId } },
                });
                // Get total tickets for this venue
                const ticketsResult = yield this.repository
                    .createQueryBuilder("registration")
                    .select("SUM(registration.noOfTickets)", "totalTickets")
                    .where("registration.venue.venueId = :venueId", { venueId })
                    .getRawOne();
                const totalTickets = ticketsResult.totalTickets || 0;
                // Get registrations by event for this venue
                const eventStats = yield this.repository
                    .createQueryBuilder("registration")
                    .select("event.eventId", "eventId")
                    .addSelect("event.eventTitle", "eventTitle")
                    .addSelect("COUNT(registration.registrationId)", "registrationsCount")
                    .addSelect("SUM(registration.noOfTickets)", "ticketsCount")
                    .leftJoin("registration.event", "event")
                    .where("registration.venue.venueId = :venueId", { venueId })
                    .groupBy("event.eventId")
                    .addGroupBy("event.eventTitle")
                    .getRawMany();
                const capacityInfo = {
                    venueId,
                    venueName: venue.venueName,
                    capacity: venue.capacity,
                    totalRegistrations: registrationsCount,
                    totalTickets,
                    remainingCapacity: venue.capacity - totalTickets,
                    utilizationPercentage: (totalTickets / venue.capacity) * 100,
                    eventBreakdown: eventStats,
                };
                return { success: true, data: capacityInfo };
            }
            catch (error) {
                return { success: false, message: "Failed to fetch venue capacity information." };
            }
        });
    }
    // Bulk Operations
    static createBulk(registrationsData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!registrationsData || registrationsData.length === 0) {
                return { success: false, message: "Registration data is required." };
            }
            try {
                // Use transaction to ensure all creations succeed or fail together
                const savedRegistrations = yield Database_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                    const registrationRepository = transactionalEntityManager.getRepository(Registration_1.Registration);
                    const ticketTypeRepository = transactionalEntityManager.getRepository(TicketType_1.TicketType);
                    // Process each registration
                    const registrationsToSave = [];
                    for (const data of registrationsData) {
                        // Map data to match Registration entity structure
                        const entityData = Object.assign({}, data);
                        if (data.event && typeof data.event === "object" && "eventId" in data.event) {
                            entityData.event = { eventId: data.event.eventId };
                        }
                        if (data.user && typeof data.user === "object" && "userId" in data.user) {
                            entityData.user = { userId: data.user.userId };
                        }
                        if (data.buyer && typeof data.buyer === "object" && "userId" in data.buyer) {
                            entityData.buyer = { userId: data.buyer.userId };
                        }
                        // FIXED: Handle ticketTypes as array for many-to-many
                        if (data.ticketTypes && Array.isArray(data.ticketTypes)) {
                            const ticketTypeIds = data.ticketTypes.map((tt) => typeof tt === "object" && "ticketTypeId" in tt ? tt.ticketTypeId : tt);
                            const foundTicketTypes = yield ticketTypeRepository.find({
                                where: { ticketTypeId: (0, typeorm_1.In)(ticketTypeIds) },
                            });
                            entityData.ticketTypes = foundTicketTypes;
                        }
                        else {
                            entityData.ticketTypes = [];
                        }
                        if (data.venue && typeof data.venue === "object" && "venueId" in data.venue) {
                            entityData.venue = { venueId: data.venue.venueId };
                        }
                        registrationsToSave.push(registrationRepository.create(entityData));
                    }
                    // Save all registrations
                    return yield registrationRepository.save(registrationsToSave.flat());
                }));
                return { success: true, data: savedRegistrations, message: "Bulk registrations created successfully." };
            }
            catch (error) {
                return { success: false, message: "Failed to create bulk registrations." };
            }
        });
    }
    static findPending() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const registrations = yield this.repository.find({
                    where: { paymentStatus: "pending" },
                    relations: ["event", "user", "buyer", "ticketTypes", "venue"], // FIXED: Changed from ticketType to ticketTypes
                });
                return { success: true, data: registrations };
            }
            catch (error) {
                return { success: false, message: "Failed to fetch pending registrations." };
            }
        });
    }
    // Transfer Operations
    static transferTicket(registrationId, newUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!registrationId) {
                return { success: false, message: "Registration ID is required." };
            }
            if (!newUserId) {
                return { success: false, message: "New user ID is required." };
            }
            try {
                // Check if registration exists
                const registration = yield this.repository.findOne({ where: { registrationId } });
                if (!registration) {
                    return { success: false, message: "Registration not found." };
                }
                // Check if new user exists
                const userRepository = Database_1.AppDataSource.getRepository(User_1.User);
                const newUser = yield userRepository.findOne({ where: { userId: newUserId } });
                if (!newUser) {
                    return { success: false, message: "New user not found." };
                }
                // Update the user ID for the registration
                const updateResult = yield this.repository.update(registrationId, {
                    user: { userId: newUserId },
                });
                if (updateResult.affected === 0) {
                    return { success: false, message: "Failed to transfer ticket." };
                }
                return { success: true, message: "Ticket transferred successfully." };
            }
            catch (error) {
                return { success: false, message: "Failed to transfer ticket." };
            }
        });
    }
    // Export Operations
    static getRegistrationsForExport(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!eventId) {
                return { success: false, message: "Event ID is required." };
            }
            try {
                const registrations = yield this.repository.find({
                    where: { event: { eventId } },
                    relations: ["user", "buyer", "ticketTypes", "venue"], // FIXED: Changed from ticketType to ticketTypes
                    order: { registrationDate: "DESC" },
                });
                return { success: true, data: registrations };
            }
            catch (error) {
                return { success: false, message: "Failed to fetch registrations for export." };
            }
        });
    }
}
exports.RegistrationRepository = RegistrationRepository;
RegistrationRepository.repository = Database_1.AppDataSource.getRepository(Registration_1.Registration);
RegistrationRepository.ticketTypeRepository = Database_1.AppDataSource.getRepository(TicketType_1.TicketType);
