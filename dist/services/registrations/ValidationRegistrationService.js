"use strict";
// src/services/registrations/ValidationRegistrationService.ts
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
exports.ValidationService = void 0;
const Event_1 = require("../../models/Event");
const User_1 = require("../../models/User");
const TicketType_1 = require("../../models/TicketType");
const Venue_1 = require("../../models/Venue");
const Registration_1 = require("../../models/Registration");
const Database_1 = require("../../config/Database");
const typeorm_1 = require("typeorm");
class ValidationService {
    /**
     * Validate that all referenced IDs exist in the database for a new registration.
     */
    static validateRegistrationIds(registrationData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const errors = [];
            // Get repositories once to avoid redundancy
            const eventRepository = Database_1.AppDataSource.getRepository(Event_1.Event);
            const userRepository = Database_1.AppDataSource.getRepository(User_1.User);
            const ticketTypeRepository = Database_1.AppDataSource.getRepository(TicketType_1.TicketType);
            const venueRepository = Database_1.AppDataSource.getRepository(Venue_1.Venue);
            try {
                // Validate Event exists
                const eventId = (_a = registrationData.event) === null || _a === void 0 ? void 0 : _a.eventId;
                if (!eventId) {
                    errors.push("Event ID is required.");
                }
                else {
                    const event = yield eventRepository.findOne({ where: { eventId } });
                    if (!event) {
                        errors.push(`Event with ID '${eventId}' does not exist.`);
                    }
                }
                // Validate User (primary attendee) exists
                const userId = (_b = registrationData.user) === null || _b === void 0 ? void 0 : _b.userId;
                if (!userId) {
                    errors.push("User ID (attendee) is required.");
                }
                else {
                    const user = yield userRepository.findOne({ where: { userId } });
                    if (!user) {
                        errors.push(`User (attendee) with ID '${userId}' does not exist.`);
                    }
                }
                // Validate Buyer exists (from token)
                const buyerId = (_c = registrationData.buyer) === null || _c === void 0 ? void 0 : _c.userId;
                if (!buyerId) {
                    errors.push("Buyer ID is required.");
                }
                else {
                    const buyer = yield userRepository.findOne({ where: { userId: buyerId } });
                    if (!buyer) {
                        errors.push(`Buyer with ID '${buyerId}' does not exist.`);
                    }
                }
                // --- Validate boughtForIds and its length ---
                const noOfTickets = registrationData.noOfTickets;
                const boughtForIds = registrationData.boughtForIds;
                if (!boughtForIds || boughtForIds.length === 0) {
                    errors.push("boughtForIds is required and cannot be empty.");
                }
                else {
                    // Check if all boughtForIds exist
                    const users = yield userRepository.find({
                        where: { userId: (0, typeorm_1.In)(boughtForIds) },
                    });
                    if (users.length !== boughtForIds.length) {
                        const foundIds = users.map((u) => u.userId);
                        const notFound = boughtForIds.filter((id) => !foundIds.includes(id));
                        errors.push(`User(s) with ID(s) '${notFound.join(", ")}' do not exist in boughtForIds.`);
                    }
                    // Validate that boughtForIds length matches noOfTickets
                    if (noOfTickets !== undefined && boughtForIds.length !== noOfTickets) {
                        errors.push(`Number of boughtForIds (${boughtForIds.length}) must match noOfTickets (${noOfTickets}).`);
                    }
                    // Optional: Ensure the primary attendee (registrationData.user.userId) is among boughtForIds
                    if (userId && !boughtForIds.includes(userId) && noOfTickets && noOfTickets > 0) {
                        errors.push(`The primary attendee (User ID: ${userId}) must be included in boughtForIds.`);
                    }
                }
                // --- FIXED: Validate ticketTypes (plural) and its length ---
                const requestedTicketTypes = registrationData.ticketTypes; // ✅ Now using correct property name
                if (!requestedTicketTypes || requestedTicketTypes.length === 0) {
                    errors.push("At least one Ticket Type is required.");
                }
                else {
                    const uniqueTicketTypeIds = Array.from(new Set(requestedTicketTypes.map((tt) => tt.ticketTypeId)));
                    // Check if all requested ticketTypeIds exist
                    const foundTicketTypes = yield ticketTypeRepository.find({
                        where: { ticketTypeId: (0, typeorm_1.In)(uniqueTicketTypeIds) },
                    });
                    if (foundTicketTypes.length !== uniqueTicketTypeIds.length) {
                        const foundIds = foundTicketTypes.map((tt) => tt.ticketTypeId); // ✅ Fixed variable name
                        const notFound = uniqueTicketTypeIds.filter((id) => !foundIds.includes(id));
                        errors.push(`Ticket Type(s) with ID(s) '${notFound.join(", ")}' do not exist.`);
                    }
                    // IMPORTANT FIX: Compare noOfTickets with the *total count* of requested ticketType entries
                    if (noOfTickets !== undefined && requestedTicketTypes.length !== noOfTickets) {
                        errors.push(`Number of ticketType entries provided (${requestedTicketTypes.length}) must match noOfTickets (${noOfTickets}).`);
                    }
                }
                // Validate Venue exists
                const venueId = (_d = registrationData.venue) === null || _d === void 0 ? void 0 : _d.venueId;
                if (!venueId) {
                    errors.push("Venue ID is required.");
                }
                else {
                    const venue = yield venueRepository.findOne({ where: { venueId } });
                    if (!venue) {
                        errors.push(`Venue with ID '${venueId}' does not exist.`);
                    }
                }
                // Basic checks for noOfTickets
                if (noOfTickets === undefined || noOfTickets <= 0) {
                    errors.push("Number of tickets must be a positive number.");
                }
                return {
                    valid: errors.length === 0,
                    message: errors.length > 0 ? `Validation failed: ${errors.join(" ")}` : undefined,
                    errors: errors.length > 0 ? errors : undefined,
                };
            }
            catch (error) {
                console.error("Error validating registration IDs:", error);
                return {
                    valid: false,
                    message: "An internal server error occurred during ID validation.",
                    errors: ["Internal validation error"],
                };
            }
        });
    }
    /**
     * Check if user exists by ID
     */
    static checkUserExists(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = Database_1.AppDataSource.getRepository(User_1.User);
                const user = yield userRepository.findOne({ where: { userId: userId } });
                return !!user;
            }
            catch (error) {
                console.error(`Error checking if user ${userId} exists:`, error);
                return false;
            }
        });
    }
    /**
     * Validate event capacity and ticket availability
     */
    static validateEventCapacity(eventId, venueId, requestedTickets) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const venueRepository = Database_1.AppDataSource.getRepository(Venue_1.Venue);
                const venue = yield venueRepository.findOne({ where: { venueId } });
                if (!venue) {
                    return { valid: false, message: "Venue not found" };
                }
                const registrationRepository = Database_1.AppDataSource.getRepository(Registration_1.Registration);
                // ✅ FIXED: Updated query to use correct relations
                const currentRegistrations = yield registrationRepository
                    .createQueryBuilder("registration")
                    .select("SUM(registration.noOfTickets)", "totalTickets")
                    .where("registration.event.eventId = :eventId", { eventId })
                    .getRawOne();
                const currentTicketCount = Number.parseInt(currentRegistrations.totalTickets) || 0;
                const availableCapacity = venue.capacity - currentTicketCount;
                if (requestedTickets > availableCapacity) {
                    return {
                        valid: false,
                        message: `Not enough capacity. Available: ${availableCapacity}, Requested: ${requestedTickets}`,
                    };
                }
                return { valid: true };
            }
            catch (error) {
                console.error("Error validating event capacity:", error);
                return { valid: false, message: "Error checking event capacity" };
            }
        });
    }
    /**
     * ✅ ENHANCED: Validate duplicate registration with better logic
     * This checks if any user in 'boughtForIds' is already registered for this event.
     */
    static validateDuplicateRegistration(eventId, userId, boughtForIds) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const registrationRepository = Database_1.AppDataSource.getRepository(Registration_1.Registration);
                // Check if the primary attendee is already registered
                const existingRegistration = yield registrationRepository.findOne({
                    where: {
                        event: { eventId },
                        user: { userId: userId },
                    },
                });
                if (existingRegistration) {
                    return {
                        valid: false,
                        message: "Primary attendee is already registered for this event",
                    };
                }
                // ✅ ENHANCED: Also check if any user in boughtForIds is already registered
                if (boughtForIds && boughtForIds.length > 0) {
                    const existingRegistrationsForBoughtUsers = yield registrationRepository
                        .createQueryBuilder("registration")
                        .where("registration.event.eventId = :eventId", { eventId })
                        .andWhere("registration.boughtForIds && :boughtForIds", { boughtForIds })
                        .getMany();
                    if (existingRegistrationsForBoughtUsers.length > 0) {
                        return {
                            valid: false,
                            message: "One or more users in boughtForIds are already registered for this event",
                        };
                    }
                }
                return { valid: true };
            }
            catch (error) {
                console.error("Error validating duplicate registration:", error);
                return { valid: false, message: "Error checking duplicate registration" };
            }
        });
    }
    /**
     * ✅ NEW: Comprehensive validation method that combines all checks
     */
    static validateCompleteRegistration(registrationData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const allErrors = [];
            try {
                // 1. Validate all IDs exist
                const idValidation = yield this.validateRegistrationIds(registrationData);
                if (!idValidation.valid && idValidation.errors) {
                    allErrors.push(...idValidation.errors);
                }
                // 2. Validate event capacity
                if (((_a = registrationData.event) === null || _a === void 0 ? void 0 : _a.eventId) && ((_b = registrationData.venue) === null || _b === void 0 ? void 0 : _b.venueId) && registrationData.noOfTickets) {
                    const capacityValidation = yield this.validateEventCapacity(registrationData.event.eventId, registrationData.venue.venueId, registrationData.noOfTickets);
                    if (!capacityValidation.valid && capacityValidation.message) {
                        allErrors.push(capacityValidation.message);
                    }
                }
                // 3. Validate duplicate registration
                if (((_c = registrationData.event) === null || _c === void 0 ? void 0 : _c.eventId) && ((_d = registrationData.user) === null || _d === void 0 ? void 0 : _d.userId)) {
                    const duplicateValidation = yield this.validateDuplicateRegistration(registrationData.event.eventId, registrationData.user.userId, registrationData.boughtForIds);
                    if (!duplicateValidation.valid && duplicateValidation.message) {
                        allErrors.push(duplicateValidation.message);
                    }
                }
                return {
                    valid: allErrors.length === 0,
                    message: allErrors.length > 0 ? `Validation failed: ${allErrors.join(" ")}` : undefined,
                    errors: allErrors.length > 0 ? allErrors : undefined,
                };
            }
            catch (error) {
                console.error("Error in complete registration validation:", error);
                return {
                    valid: false,
                    message: "An internal server error occurred during validation.",
                    errors: ["Internal validation error"],
                };
            }
        });
    }
    /**
     * ✅ NEW: Validate ticket type pricing and calculate total cost
     */
    static validateAndCalculateTicketCost(ticketTypeIds) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ticketTypeRepository = Database_1.AppDataSource.getRepository(TicketType_1.TicketType);
                const ticketTypes = yield ticketTypeRepository.find({
                    where: { ticketTypeId: (0, typeorm_1.In)(ticketTypeIds) },
                });
                if (ticketTypes.length !== ticketTypeIds.length) {
                    const foundIds = ticketTypes.map((tt) => tt.ticketTypeId);
                    const notFound = ticketTypeIds.filter((id) => !foundIds.includes(id));
                    return {
                        valid: false,
                        message: `Ticket Type(s) with ID(s) '${notFound.join(", ")}' do not exist.`,
                    };
                }
                const totalCost = ticketTypes.reduce((sum, ticket) => sum + ticket.price, 0);
                return {
                    valid: true,
                    totalCost,
                    ticketTypes,
                };
            }
            catch (error) {
                console.error("Error validating ticket cost:", error);
                return {
                    valid: false,
                    message: "Error calculating ticket cost",
                };
            }
        });
    }
}
exports.ValidationService = ValidationService;
