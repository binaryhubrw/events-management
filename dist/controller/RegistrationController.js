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
exports.RegistrationController = void 0;
const RegistrationRepository_1 = require("../repositories/RegistrationRepository");
const uuid_1 = require("uuid");
const ValidationRegistrationService_1 = require("../services/registrations/ValidationRegistrationService");
const UserRepository_1 = require("../repositories/UserRepository");
class RegistrationController {
    static createRegistration(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            try {
                const registrationData = req.body;
                console.log("Incoming registrationData:", registrationData);
                const buyerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!buyerId) {
                    res.status(401).json({
                        success: false,
                        message: "Authentication required. Buyer information not found.",
                    });
                    return;
                }
                const noOfTickets = registrationData.noOfTickets;
                let finalBoughtForIds = [];
                if (noOfTickets === 1) {
                    if (!((_b = registrationData.user) === null || _b === void 0 ? void 0 : _b.userId)) {
                        res.status(400).json({
                            success: false,
                            message: "For a single ticket, the primary user ID is required.",
                        });
                        return;
                    }
                    finalBoughtForIds = [registrationData.user.userId];
                }
                else if (noOfTickets > 1) {
                    if (!registrationData.boughtForIds || registrationData.boughtForIds.length === 0) {
                        res.status(400).json({
                            success: false,
                            message: "For multiple tickets, boughtForIds must be provided and cannot be empty.",
                        });
                        return;
                    }
                    if (registrationData.boughtForIds.length !== noOfTickets) {
                        res.status(400).json({
                            success: false,
                            message: `Number of boughtForIds (${registrationData.boughtForIds.length}) must match noOfTickets (${noOfTickets}).`,
                        });
                        return;
                    }
                    finalBoughtForIds = registrationData.boughtForIds;
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: "Number of tickets must be a positive number.",
                    });
                    return;
                }
                // Ensure ticketTypes length also matches noOfTickets
                if (registrationData.ticketTypes && registrationData.ticketTypes.length !== noOfTickets) {
                    res.status(400).json({
                        success: false,
                        message: `Number of ticketTypes provided (${registrationData.ticketTypes.length}) must match noOfTickets (${noOfTickets}).`,
                    });
                    return;
                }
                const completeRegistrationData = {
                    registrationId: (0, uuid_1.v4)(),
                    event: registrationData.event,
                    user: registrationData.user,
                    buyer: { userId: buyerId },
                    boughtForIds: finalBoughtForIds,
                    ticketTypes: registrationData.ticketTypes, // This is correct, it's an array of { ticketTypeId: string }
                    venue: registrationData.venue,
                    noOfTickets: noOfTickets,
                    registrationDate: registrationData.registrationDate || new Date().toISOString(),
                    paymentStatus: registrationData.paymentStatus || "pending",
                    attended: false,
                };
                console.log("Complete registration data to repo:", completeRegistrationData);
                const validationResult = yield ValidationRegistrationService_1.ValidationService.validateRegistrationIds(completeRegistrationData);
                if (!validationResult.valid) {
                    res.status(400).json({
                        success: false,
                        message: validationResult.message,
                        errors: validationResult.errors,
                    });
                    return;
                }
                const capacityValidation = yield ValidationRegistrationService_1.ValidationService.validateEventCapacity(((_c = completeRegistrationData.event) === null || _c === void 0 ? void 0 : _c.eventId) || "", ((_d = completeRegistrationData.venue) === null || _d === void 0 ? void 0 : _d.venueId) || "", completeRegistrationData.noOfTickets);
                if (!capacityValidation.valid) {
                    res.status(400).json({
                        success: false,
                        message: capacityValidation.message,
                    });
                    return;
                }
                const result = yield RegistrationRepository_1.RegistrationRepository.create(completeRegistrationData);
                if (result.success && result.data) {
                    const createdRegistration = result.data;
                    // Fetch details for all relevant users (buyer, primary attendee, and boughtForIds)
                    const allUserIds = [
                        (_e = createdRegistration.buyer) === null || _e === void 0 ? void 0 : _e.userId,
                        (_f = createdRegistration.user) === null || _f === void 0 ? void 0 : _f.userId,
                        ...(createdRegistration.boughtForIds || []),
                    ].filter((id) => typeof id === "string" && id !== null);
                    const uniqueUserIds = Array.from(new Set(allUserIds));
                    // Fetch users in parallel
                    const fetchedUsers = yield Promise.all(uniqueUserIds.map((id) => UserRepository_1.UserRepository.getUserById(id)));
                    const userMap = new Map();
                    fetchedUsers
                        .filter((user) => Boolean(user) && typeof (user === null || user === void 0 ? void 0 : user.userId) === "string")
                        .forEach((user) => {
                        if (user && typeof user.userId === "string") {
                            userMap.set(user.userId, user);
                        }
                    });
                    // Format buyer and user (primary attendee) details
                    const formattedBuyer = createdRegistration.buyer ? userMap.get(createdRegistration.buyer.userId) : undefined;
                    const formattedUser = createdRegistration.user ? userMap.get(createdRegistration.user.userId) : undefined;
                    // Format boughtForIds with full user details
                    const formattedBoughtForUsers = (createdRegistration.boughtForIds || [])
                        .map((id) => userMap.get(id))
                        .filter(Boolean);
                    // --- IMPORTANT: Construct individualTickets correctly ---
                    const individualTickets = [];
                    // Loop up to the number of tickets.
                    // Both createdRegistration.ticketTypes and formattedBoughtForUsers should have this length
                    for (let i = 0; i < createdRegistration.noOfTickets; i++) {
                        const boughtForUser = formattedBoughtForUsers[i];
                        const ticketType = (_g = createdRegistration.ticketTypes) === null || _g === void 0 ? void 0 : _g[i]; // Access by index from the fetched entity's ticketTypes
                        individualTickets.push({
                            ticketNumber: i + 1,
                            boughtFor: boughtForUser
                                ? {
                                    userId: boughtForUser.userId,
                                    username: boughtForUser.username,
                                    firstName: boughtForUser.firstName,
                                    lastName: boughtForUser.lastName,
                                    email: boughtForUser.email,
                                    phoneNumber: boughtForUser.phoneNumber || undefined,
                                }
                                : { userId: ((_h = createdRegistration.boughtForIds) === null || _h === void 0 ? void 0 : _h[i]) || "N/A" }, // Fallback
                            ticketType: ticketType
                                ? {
                                    ticketTypeId: ticketType.ticketTypeId,
                                    ticketName: ticketType.ticketName,
                                    price: ticketType.price,
                                    description: ticketType.description || undefined,
                                }
                                : undefined,
                        });
                    }
                    res.status(201).json({
                        success: true,
                        message: result.message,
                        data: {
                            registrationId: createdRegistration.registrationId,
                            event: createdRegistration.event
                                ? {
                                /* ... map event details ... */
                                }
                                : undefined,
                            user: formattedUser,
                            buyer: formattedBuyer,
                            boughtForIds: createdRegistration.boughtForIds, // Keep original IDs
                            // Make sure you're mapping the ticketTypes from the *fetched* registration data,
                            // which should contain the full TicketType objects if `eager: true` or `relations` are used.
                            ticketTypes: ((_j = createdRegistration.ticketTypes) === null || _j === void 0 ? void 0 : _j.map((tt) => ({
                                ticketTypeId: tt.ticketTypeId,
                                ticketName: tt.ticketName,
                                price: tt.price,
                                description: tt.description,
                            }))) || [], // Ensure this is also plural `ticketTypes`
                            venue: createdRegistration.venue
                                ? {
                                /* ... map venue details ... */
                                }
                                : undefined,
                            noOfTickets: createdRegistration.noOfTickets,
                            registrationDate: createdRegistration.registrationDate,
                            paymentStatus: createdRegistration.paymentStatus,
                            qrCode: createdRegistration.qrCode,
                            checkDate: createdRegistration.checkDate,
                            attended: createdRegistration.attended,
                            individualTickets: individualTickets, // Your structured output
                        },
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message,
                    });
                }
            }
            catch (error) {
                console.error("Error creating registration in controller:", error);
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to create registration due to an unexpected server error.",
                });
            }
        });
    }
    // Get All Registrations
    static getAllRegistrations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const registrations = yield RegistrationRepository_1.RegistrationRepository.findAll();
                res.status(200).json({
                    success: true,
                    data: registrations,
                });
            }
            catch (error) {
                console.error("Error getting all registrations:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to retrieve registrations.",
                });
            }
        });
    }
    // Get Registration by ID
    static getRegistrationById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const registration = yield RegistrationRepository_1.RegistrationRepository.findById(id);
                if (!registration) {
                    res.status(404).json({
                        success: false,
                        message: "Registration not found.",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: Object.assign(Object.assign({}, registration), { 
                        // Assuming you have a method to fetch user details by ID
                        boughtForIds: (((_a = registration.data) === null || _a === void 0 ? void 0 : _a.boughtForIds) || []).map((id) => ({
                            userId: id,
                            userDetails: UserRepository_1.UserRepository.getUserById(id),
                        })) }),
                });
            }
            catch (error) {
                console.error("Error getting registration by ID:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to retrieve registration.",
                });
            }
        });
    }
    // Update Registration
    static updateRegistration(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const updateData = req.body;
                // Check if registration exists
                const existingRegistration = yield RegistrationRepository_1.RegistrationRepository.findById(id);
                if (!existingRegistration) {
                    res.status(404).json({
                        success: false,
                        message: "Registration not found.",
                    });
                    return;
                }
                // FIXED: Changed ticketTypeId to ticketTypes
                if (updateData.eventId || updateData.user || updateData.ticketTypes || updateData.venueId) {
                    const validation = yield ValidationRegistrationService_1.ValidationService.validateRegistrationIds(Object.assign(Object.assign({}, existingRegistration), updateData));
                    if (!validation.valid) {
                        res.status(400).json({
                            success: false,
                            message: validation.message,
                            errors: validation.errors,
                        });
                        return;
                    }
                }
                const updatedRegistration = yield RegistrationRepository_1.RegistrationRepository.update(id, updateData);
                if (!updatedRegistration) {
                    res.status(400).json({
                        success: false,
                        message: "Failed to update registration.",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Registration updated successfully",
                    data: updatedRegistration,
                });
            }
            catch (error) {
                console.error("Error updating registration:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to update registration.",
                });
            }
        });
    }
    // Delete Registration
    static deleteRegistration(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // Check if registration exists
                const existingRegistration = yield RegistrationRepository_1.RegistrationRepository.findById(id);
                if (!existingRegistration) {
                    res.status(404).json({
                        success: false,
                        message: "Registration not found.",
                    });
                    return;
                }
                const deleted = yield RegistrationRepository_1.RegistrationRepository.delete(id);
                if (!deleted) {
                    res.status(400).json({
                        success: false,
                        message: "Failed to delete registration.",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Registration deleted successfully",
                });
            }
            catch (error) {
                console.error("Error deleting registration:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to delete registration.",
                });
            }
        });
    }
    // Get Event Registrations
    static getEventRegistrations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { eventId } = req.params;
                const registrations = yield RegistrationRepository_1.RegistrationRepository.findByEventId(eventId);
                res.status(200).json({
                    success: true,
                    data: registrations,
                });
            }
            catch (error) {
                console.error("Error getting event registrations:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to retrieve event registrations.",
                });
            }
        });
    }
    // Register for Event (Alternative endpoint)
    static registerForEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // This can be the same as createRegistration or have different logic
            yield RegistrationController.createRegistration(req, res);
        });
    }
    // Get Event Registration Stats
    static getEventRegistrationStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { eventId } = req.params;
                const stats = yield RegistrationRepository_1.RegistrationRepository.getEventRegistrationStats(eventId);
                res.status(200).json({
                    success: true,
                    data: stats,
                });
            }
            catch (error) {
                console.error("Error getting event registration stats:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to retrieve registration statistics.",
                });
            }
        });
    }
    // Get User Registrations
    static getUserRegistrations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req.params;
                const registrations = yield RegistrationRepository_1.RegistrationRepository.findByUserId(user);
                res.status(200).json({
                    success: true,
                    data: registrations,
                });
            }
            catch (error) {
                console.error("Error getting user registrations:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to retrieve user registrations.",
                });
            }
        });
    }
    // Get User Upcoming Registrations
    static getUserUpcomingRegistrations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req.params;
                const registrations = yield RegistrationRepository_1.RegistrationRepository.findUpcomingByUserId(user);
                res.status(200).json({
                    success: true,
                    data: registrations,
                });
            }
            catch (error) {
                console.error("Error getting user upcoming registrations:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to retrieve upcoming registrations.",
                });
            }
        });
    }
    // Get User Registration History
    static getUserRegistrationHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req.params;
                const registrations = yield RegistrationRepository_1.RegistrationRepository.findHistoryByUserId(user);
                res.status(200).json({
                    success: true,
                    data: registrations,
                });
            }
            catch (error) {
                console.error("Error getting user registration history:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to retrieve registration history.",
                });
            }
        });
    }
    // Get Registration QR Code
    static getRegistrationQrCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const registration = yield RegistrationRepository_1.RegistrationRepository.findById(id);
                if (!registration) {
                    res.status(404).json({
                        success: false,
                        message: "Registration not found.",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: { qrCode: (_a = registration.data) === null || _a === void 0 ? void 0 : _a.qrCode },
                });
            }
            catch (error) {
                console.error("Error getting registration QR code:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to retrieve QR code.",
                });
            }
        });
    }
    // Regenerate QR Code
    static regenerateQrCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // Check if registration exists
                const registration = yield RegistrationRepository_1.RegistrationRepository.findById(id);
                if (!registration) {
                    res.status(404).json({
                        success: false,
                        message: "Registration not found.",
                    });
                    return;
                }
                // Generate new QR code
                const QrCodeService = require("../services/registrations/QrCodeService").QrCodeService;
                const newQrCode = yield QrCodeService.regenerateQrCode(id);
                // Update registration with new QR code
                const updated = yield RegistrationRepository_1.RegistrationRepository.updateQrCode(id, newQrCode);
                if (!updated) {
                    res.status(400).json({
                        success: false,
                        message: "Failed to regenerate QR code.",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "QR code regenerated successfully",
                    data: { qrCode: newQrCode },
                });
            }
            catch (error) {
                console.error("Error regenerating QR code:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to regenerate QR code.",
                });
            }
        });
    }
    // Validate QR Code
    static validateQrCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { qrCode } = req.params;
                const registration = yield RegistrationRepository_1.RegistrationRepository.findByQrCode(qrCode);
                if (!registration) {
                    res.status(404).json({
                        success: false,
                        message: "Invalid QR code.",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "QR code is valid",
                    data: registration,
                });
            }
            catch (error) {
                console.error("Error validating QR code:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to validate QR code.",
                });
            }
        });
    }
    // Check-in Attendee
    static checkInAttendee(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { checkDate } = req.body;
                // Check if registration exists
                const registration = yield RegistrationRepository_1.RegistrationRepository.findById(id);
                if (!registration) {
                    res.status(404).json({
                        success: false,
                        message: "Registration not found.",
                    });
                    return;
                }
                const updated = yield RegistrationRepository_1.RegistrationRepository.updateAttendance(id, true, checkDate || new Date().toISOString());
                if (!updated) {
                    res.status(400).json({
                        success: false,
                        message: "Failed to check-in attendee.",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Attendee checked-in successfully",
                });
            }
            catch (error) {
                console.error("Error checking-in attendee:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to check-in attendee.",
                });
            }
        });
    }
    // Check-in via QR Code
    static checkInViaQrCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const { qrCode } = req.body;
                if (!qrCode) {
                    res.status(400).json({
                        success: false,
                        message: "QR code is required.",
                    });
                    return;
                }
                // Find registration by QR code
                const registration = yield RegistrationRepository_1.RegistrationRepository.findByQrCode(qrCode);
                if (!registration) {
                    res.status(404).json({
                        success: false,
                        message: "Invalid QR code.",
                    });
                    return;
                }
                // Check if already checked in
                if ((_a = registration.data) === null || _a === void 0 ? void 0 : _a.attended) {
                    res.status(400).json({
                        success: false,
                        message: "Attendee already checked-in.",
                    });
                    return;
                }
                // Update attendance
                const registrationId = (_b = registration.data) === null || _b === void 0 ? void 0 : _b.registrationId;
                if (!registrationId) {
                    res.status(400).json({
                        success: false,
                        message: "Registration ID not found in registration data.",
                    });
                    return;
                }
                const updated = yield RegistrationRepository_1.RegistrationRepository.updateAttendance(registrationId, true, new Date().toISOString());
                if (!updated) {
                    res.status(400).json({
                        success: false,
                        message: "Failed to check-in attendee.",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Attendee checked-in successfully via QR code",
                    data: { registrationId: (_c = registration.data) === null || _c === void 0 ? void 0 : _c.registrationId },
                });
            }
            catch (error) {
                console.error("Error checking-in via QR code:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to check-in via QR code.",
                });
            }
        });
    }
    // Get Attendance Status
    static getAttendanceStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { id } = req.params;
                const registration = yield RegistrationRepository_1.RegistrationRepository.findById(id);
                if (!registration) {
                    res.status(404).json({
                        success: false,
                        message: "Registration not found.",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: {
                        attended: (_a = registration.data) === null || _a === void 0 ? void 0 : _a.attended,
                        checkDate: (_b = registration.data) === null || _b === void 0 ? void 0 : _b.checkDate,
                    },
                });
            }
            catch (error) {
                console.error("Error getting attendance status:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to retrieve attendance status.",
                });
            }
        });
    }
    // Update Attendance Status
    static updateAttendanceStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { attended, checkDate } = req.body;
                // Check if registration exists
                const registration = yield RegistrationRepository_1.RegistrationRepository.findById(id);
                if (!registration) {
                    res.status(404).json({
                        success: false,
                        message: "Registration not found.",
                    });
                    return;
                }
                const updated = yield RegistrationRepository_1.RegistrationRepository.updateAttendance(id, attended, checkDate);
                if (!updated) {
                    res.status(400).json({
                        success: false,
                        message: "Failed to update attendance status.",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Attendance status updated successfully",
                });
            }
            catch (error) {
                console.error("Error updating attendance status:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to update attendance status.",
                });
            }
        });
    }
    // Get Event Attendance Report
    static getEventAttendanceReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { eventId } = req.params;
                const attendanceData = yield RegistrationRepository_1.RegistrationRepository.findAttendanceByEvent(eventId);
                res.status(200).json({
                    success: true,
                    data: attendanceData,
                });
            }
            catch (error) {
                console.error("Error getting event attendance report:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to retrieve attendance report.",
                });
            }
        });
    }
    // Get Payment Status
    static getPaymentStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const registration = yield RegistrationRepository_1.RegistrationRepository.findById(id);
                if (!registration) {
                    res.status(404).json({
                        success: false,
                        message: "Registration not found.",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: { paymentStatus: (_a = registration.data) === null || _a === void 0 ? void 0 : _a.paymentStatus },
                });
            }
            catch (error) {
                console.error("Error getting payment status:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to retrieve payment status.",
                });
            }
        });
    }
    // Process Payment
    static processPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { paymentDetails } = req.body;
                // Check if registration exists
                const registration = yield RegistrationRepository_1.RegistrationRepository.findById(id);
                if (!registration) {
                    res.status(404).json({
                        success: false,
                        message: "Registration not found.",
                    });
                    return;
                }
                // TODO: Integrate with PaymentService for actual payment processing
                // const PaymentService = require('../services/registrations/PaymentService').PaymentService;
                // const paymentResult = await PaymentService.processPayment(id, paymentDetails);
                // For now, just update payment status
                const updated = yield RegistrationRepository_1.RegistrationRepository.updatePaymentStatus(id, "paid");
                if (!updated) {
                    res.status(400).json({
                        success: false,
                        message: "Failed to process payment.",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Payment processed successfully",
                });
            }
            catch (error) {
                console.error("Error processing payment:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to process payment.",
                });
            }
        });
    }
    // Update Payment Status
    static updatePaymentStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { paymentStatus } = req.body;
                if (!paymentStatus) {
                    res.status(400).json({
                        success: false,
                        message: "Payment status is required.",
                    });
                    return;
                }
                // Check if registration exists
                const registration = yield RegistrationRepository_1.RegistrationRepository.findById(id);
                if (!registration) {
                    res.status(404).json({
                        success: false,
                        message: "Registration not found.",
                    });
                    return;
                }
                const updated = yield RegistrationRepository_1.RegistrationRepository.updatePaymentStatus(id, paymentStatus);
                if (!updated) {
                    res.status(400).json({
                        success: false,
                        message: "Failed to update payment status.",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Payment status updated successfully",
                });
            }
            catch (error) {
                console.error("Error updating payment status:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to update payment status.",
                });
            }
        });
    }
    // Process Refund
    static processRefund(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const { refundDetails } = req.body;
                // Check if registration exists
                const registration = yield RegistrationRepository_1.RegistrationRepository.findById(id);
                if (!registration) {
                    res.status(404).json({
                        success: false,
                        message: "Registration not found.",
                    });
                    return;
                }
                // Check if payment was made
                if (((_a = registration.data) === null || _a === void 0 ? void 0 : _a.paymentStatus) !== "paid") {
                    res.status(400).json({
                        success: false,
                        message: "Cannot refund unpaid registration.",
                    });
                    return;
                }
                // TODO: Integrate with PaymentService for actual refund processing
                // const PaymentService = require('../services/registrations/PaymentService').PaymentService;
                // const refundResult = await PaymentService.processRefund(id, refundDetails);
                // For now, just update payment status
                const updated = yield RegistrationRepository_1.RegistrationRepository.updatePaymentStatus(id, "refunded");
                if (!updated) {
                    res.status(400).json({
                        success: false,
                        message: "Failed to process refund.",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Refund processed successfully",
                });
            }
            catch (error) {
                console.error("Error processing refund:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to process refund.",
                });
            }
        });
    }
    // Get Ticket Details
    static getTicketDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const registration = yield RegistrationRepository_1.RegistrationRepository.findById(id);
                if (!registration) {
                    res.status(404).json({
                        success: false,
                        message: "Registration not found.",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: registration,
                });
            }
            catch (error) {
                console.error("Error getting ticket details:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to retrieve ticket details.",
                });
            }
        });
    }
    // Transfer Ticket
    static transferTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { newuser } = req.body;
                if (!newuser) {
                    res.status(400).json({
                        success: false,
                        message: "New user ID is required.",
                    });
                    return;
                }
                // Check if registration exists
                const registration = yield RegistrationRepository_1.RegistrationRepository.findById(id);
                if (!registration) {
                    res.status(404).json({
                        success: false,
                        message: "Registration not found.",
                    });
                    return;
                }
                // Check if new user exists
                const userExists = yield ValidationRegistrationService_1.ValidationService.checkUserExists(newuser);
                if (!userExists) {
                    res.status(400).json({
                        success: false,
                        message: "New user does not exist.",
                    });
                    return;
                }
                const transferred = yield RegistrationRepository_1.RegistrationRepository.transferTicket(id, newuser);
                if (!transferred) {
                    res.status(400).json({
                        success: false,
                        message: "Failed to transfer ticket.",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Ticket transferred successfully",
                });
            }
            catch (error) {
                console.error("Error transferring ticket:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to transfer ticket.",
                });
            }
        });
    }
    // Resend Ticket
    static resendTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // Check if registration exists
                const registration = yield RegistrationRepository_1.RegistrationRepository.findById(id);
                if (!registration) {
                    res.status(404).json({
                        success: false,
                        message: "Registration not found.",
                    });
                    return;
                }
                // TODO: Integrate with TicketService and NotificationService
                // const TicketService = require('../services/registrations/TicketService').TicketService;
                // const sent = await TicketService.resendTicket(id);
                res.status(200).json({
                    success: true,
                    message: "Ticket resent successfully",
                });
            }
            catch (error) {
                console.error("Error resending ticket:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to resend ticket.",
                });
            }
        });
    }
    // Download Ticket
    static downloadTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // Check if registration exists
                const registration = yield RegistrationRepository_1.RegistrationRepository.findById(id);
                if (!registration) {
                    res.status(404).json({
                        success: false,
                        message: "Registration not found.",
                    });
                    return;
                }
                // TODO: Integrate with TicketService to generate PDF
                // const TicketService = require('../services/registrations/TicketService').TicketService;
                // const ticketPdf = await TicketService.generateTicketPdf(id);
                // For now, return ticket data
                res.status(200).json({
                    success: true,
                    message: "Ticket download ready",
                    data: registration,
                });
            }
            catch (error) {
                console.error("Error downloading ticket:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to download ticket.",
                });
            }
        });
    }
    // Bulk Create Registrations
    static bulkCreateRegistrations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { registrations } = req.body;
                if (!Array.isArray(registrations) || registrations.length === 0) {
                    res.status(400).json({
                        success: false,
                        message: "Registrations array is required.",
                    });
                    return;
                }
                // Get buyer from token
                const buyerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!buyerId) {
                    res.status(401).json({
                        success: false,
                        message: "Authentication required.",
                    });
                    return;
                }
                // Prepare bulk registration data
                const bulkData = registrations.map((reg) => {
                    var _a, _b, _c;
                    return ({
                        registrationId: (0, uuid_1.v4)(),
                        eventId: (_a = reg.event) === null || _a === void 0 ? void 0 : _a.eventId,
                        user: (_b = reg.user) === null || _b === void 0 ? void 0 : _b.user,
                        buyerId: buyerId,
                        boughtForId: reg.boughtForId,
                        // FIXED: Changed from ticketTypeId to ticketTypes
                        ticketTypes: reg.ticketTypes,
                        venueId: (_c = reg.venue) === null || _c === void 0 ? void 0 : _c.venueId,
                        noOfTickets: reg.noOfTickets,
                        registrationDate: reg.registrationDate || new Date().toISOString(),
                        paymentStatus: reg.paymentStatus || "pending",
                        attended: false,
                    });
                });
                // Validate all registrations
                for (const regData of bulkData) {
                    const validation = yield ValidationRegistrationService_1.ValidationService.validateRegistrationIds(regData);
                    if (!validation.valid) {
                        res.status(400).json({
                            success: false,
                            message: `Validation failed for registration: ${validation.message}`,
                            errors: validation.errors,
                        });
                        return;
                    }
                }
                const result = yield RegistrationRepository_1.RegistrationRepository.createBulk(bulkData);
                res.status(201).json({
                    success: true,
                    message: "Bulk registrations created successfully",
                    data: result,
                });
            }
            catch (error) {
                console.error("Error creating bulk registrations:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to create bulk registrations.",
                });
            }
        });
    }
    // Bulk Check-in
    static bulkCheckIn(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { registrationIds, checkDate } = req.body;
                if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
                    res.status(400).json({
                        success: false,
                        message: "Registration IDs array is required.",
                    });
                    return;
                }
                const result = yield RegistrationRepository_1.RegistrationRepository.bulkCheckIn(registrationIds, checkDate || new Date().toISOString());
                if (!result) {
                    res.status(400).json({
                        success: false,
                        message: "Failed to perform bulk check-in.",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Bulk check-in completed successfully",
                });
            }
            catch (error) {
                console.error("Error performing bulk check-in:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to perform bulk check-in.",
                });
            }
        });
    }
    // Export Registrations
    static exportRegistrations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { eventId } = req.params;
                const { format } = req.query;
                const registrations = yield RegistrationRepository_1.RegistrationRepository.getRegistrationsForExport(eventId);
                // TODO: Integrate with ReportService for actual export
                // const ReportService = require('../services/registrations/ReportService').ReportService;
                // const exportData = await ReportService.exportRegistrations(registrations, format);
                res.status(200).json({
                    success: true,
                    message: "Registrations exported successfully",
                    data: registrations,
                });
            }
            catch (error) {
                console.error("Error exporting registrations:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to export registrations.",
                });
            }
        });
    }
    // Get Pending Registrations
    static getPendingRegistrations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const registrations = yield RegistrationRepository_1.RegistrationRepository.findPending();
                res.status(200).json({
                    success: true,
                    data: registrations,
                });
            }
            catch (error) {
                console.error("Error getting pending registrations:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to retrieve pending registrations.",
                });
            }
        });
    }
    // Approve Registration
    static approveRegistration(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // Check if registration exists
                const registration = yield RegistrationRepository_1.RegistrationRepository.findById(id);
                if (!registration) {
                    res.status(404).json({
                        success: false,
                        message: "Registration not found.",
                    });
                    return;
                }
                // Update payment status to approved (or create a separate approval status)
                const updated = yield RegistrationRepository_1.RegistrationRepository.updatePaymentStatus(id, "approved");
                if (!updated) {
                    res.status(400).json({
                        success: false,
                        message: "Failed to approve registration.",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Registration approved successfully",
                });
            }
            catch (error) {
                console.error("Error approving registration:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to approve registration.",
                });
            }
        });
    }
    // Reject Registration
    static rejectRegistration(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { reason } = req.body;
                // Check if registration exists
                const registration = yield RegistrationRepository_1.RegistrationRepository.findById(id);
                if (!registration) {
                    res.status(404).json({
                        success: false,
                        message: "Registration not found.",
                    });
                    return;
                }
                // Update payment status to rejected
                const updated = yield RegistrationRepository_1.RegistrationRepository.updatePaymentStatus(id, "rejected");
                if (!updated) {
                    res.status(400).json({
                        success: false,
                        message: "Failed to reject registration.",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Registration rejected successfully",
                });
            }
            catch (error) {
                console.error("Error rejecting registration:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to reject registration.",
                });
            }
        });
    }
    // Generate Registration Reports
    static generateRegistrationReports(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { eventId, startDate, endDate, format } = req.query;
                // TODO: Integrate with ReportService
                // const ReportService = require('../services/registrations/ReportService').ReportService;
                // const report = await ReportService.generateRegistrationReport(filters);
                res.status(200).json({
                    success: true,
                    message: "Registration report generated successfully",
                    data: { message: "Report generation not yet implemented" },
                });
            }
            catch (error) {
                console.error("Error generating registration reports:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to generate registration reports.",
                });
            }
        });
    }
    // Get Venue Registrations
    static getVenueRegistrations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { venueId } = req.params;
                const registrations = yield RegistrationRepository_1.RegistrationRepository.findByVenueId(venueId);
                res.status(200).json({
                    success: true,
                    data: registrations,
                });
            }
            catch (error) {
                console.error("Error getting venue registrations:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to retrieve venue registrations.",
                });
            }
        });
    }
    // Get Venue Capacity Info
    static getVenueCapacityInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { venueId } = req.params;
                const capacityInfo = yield RegistrationRepository_1.RegistrationRepository.getVenueCapacityInfo(venueId);
                res.status(200).json({
                    success: true,
                    data: capacityInfo,
                });
            }
            catch (error) {
                console.error("Error getting venue capacity info:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to retrieve venue capacity information.",
                });
            }
        });
    }
}
exports.RegistrationController = RegistrationController;
