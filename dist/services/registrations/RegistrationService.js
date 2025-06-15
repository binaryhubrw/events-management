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
exports.ValidationService = void 0;
class ValidationService {
    /**
     * Validate complete registration data
     */
    static validateRegistrationData(registrationData) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = [];
            // Validate registrationId if provided
            if (registrationData.registrationId) {
                if (!this.isValidUUID(registrationData.registrationId)) {
                    errors.push('Invalid registrationId format. Must be a valid UUID.');
                }
            }
            // Validate event
            if (!registrationData.event) {
                errors.push('Event is required.');
            }
            else {
                const eventValidation = yield this.validateEvent(registrationData.event);
                if (!eventValidation.valid) {
                    errors.push(...eventValidation.errors);
                }
            }
            // Validate user (attendee)
            if (!registrationData.user) {
                errors.push('User (attendee) is required.');
            }
            else {
                const userValidation = yield this.validateUser(registrationData.user);
                if (!userValidation.valid) {
                    errors.push(...userValidation.errors);
                }
            }
            // Validate buyer
            if (!registrationData.buyer) {
                errors.push('Buyer is required.');
            }
            else {
                const buyerValidation = yield this.validateUser(registrationData.buyer);
                if (!buyerValidation.valid) {
                    errors.push(...buyerValidation.errors);
                }
            }
            // Validate boughtForId if provided
            if (registrationData.boughtForIds && Array.isArray(registrationData.boughtForIds)) {
                const invalidIds = registrationData.boughtForIds.filter(id => !this.isValidUUID(id));
                if (invalidIds.length > 0) {
                    errors.push('Invalid boughtForId format. All IDs must be valid UUIDs.');
                }
            }
            // Validate ticketType
            if (!registrationData.ticketTypes) {
                errors.push('Ticket type is required.');
            }
            else {
                const ticketTypeValidation = yield this.validateTicketType(registrationData.ticketTypes);
                if (!ticketTypeValidation.valid) {
                    errors.push(...ticketTypeValidation.errors);
                }
            }
            // Validate venue
            if (!registrationData.venue) {
                errors.push('Venue is required.');
            }
            else {
                const venueValidation = yield this.validateVenue(registrationData.venue);
                if (!venueValidation.valid) {
                    errors.push(...venueValidation.errors);
                }
            }
            // Validate noOfTickets
            if (registrationData.noOfTickets === undefined) {
                errors.push('Number of tickets is required.');
            }
            else if (!Number.isInteger(registrationData.noOfTickets) || registrationData.noOfTickets <= 0) {
                errors.push('Number of tickets must be a positive integer.');
            }
            // Validate registrationDate
            if (!registrationData.registrationDate) {
                errors.push('Registration date is required.');
            }
            else if (!this.isValidDateString(registrationData.registrationDate)) {
                errors.push('Registration date must be a valid date string.');
            }
            // Validate paymentStatus
            if (!registrationData.paymentStatus) {
                errors.push('Payment status is required.');
            }
            else if (!this.isValidPaymentStatus(registrationData.paymentStatus)) {
                errors.push('Invalid payment status. Must be one of: pending, paid, failed, refunded.');
            }
            // Validate qrCode
            if (!registrationData.qrCode) {
                errors.push('QR code is required.');
            }
            // Validate checkDate if provided
            if (registrationData.checkDate && !this.isValidDateString(registrationData.checkDate)) {
                errors.push('Check date must be a valid date string.');
            }
            // Validate attended
            if (registrationData.attended === undefined) {
                errors.push('Attended status is required.');
            }
            else if (typeof registrationData.attended !== 'boolean') {
                errors.push('Attended must be a boolean value.');
            }
            return {
                valid: errors.length === 0,
                errors: errors.length > 0 ? errors : undefined
            };
        });
    }
    /**
     * Validate event data
     */
    static validateEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = [];
            if (!event.eventId || !this.isValidUUID(event.eventId)) {
                errors.push('Invalid event ID format. Must be a valid UUID.');
            }
            // Additional event validation logic can be added here
            return {
                valid: errors.length === 0,
                errors
            };
        });
    }
    /**
     * Validate user data
     */
    static validateUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = [];
            if (!user.UserID || !this.isValidUUID(user.UserID)) {
                errors.push('Invalid user ID format. Must be a valid UUID.');
            }
            // Additional user validation logic can be added here
            return {
                valid: errors.length === 0,
                errors
            };
        });
    }
    /**
     * Validate ticket type data
     */
    static validateTicketType(ticketType) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = [];
            if (!ticketType.TicketTypeID || !this.isValidUUID(ticketType.TicketTypeID)) {
                errors.push('Invalid ticket type ID format. Must be a valid UUID.');
            }
            // Additional ticket type validation logic can be added here
            return {
                valid: errors.length === 0,
                errors
            };
        });
    }
    /**
     * Validate venue data
     */
    static validateVenue(venue) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = [];
            if (!venue.venueId || !this.isValidUUID(venue.venueId)) {
                errors.push('Invalid venue ID format. Must be a valid UUID.');
            }
            // Additional venue validation logic can be added here
            return {
                valid: errors.length === 0,
                errors
            };
        });
    }
    /**
     * Validate event capacity
     */
    static validateEventCapacity(eventId, ticketCount) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement event capacity validation
            // Check if the event has enough capacity for the requested number of tickets
            return true;
        });
    }
    /**
     * Validate ticket availability
     */
    static validateTicketAvailability(ticketTypeId, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement ticket availability validation
            // Check if there are enough tickets of the specified type available
            return true;
        });
    }
    /**
     * Validate user eligibility for registration
     */
    static validateUserEligibility(userId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement user eligibility validation
            // Check if the user is eligible to register for the event (e.g., age restrictions, membership, etc.)
            return true;
        });
    }
    /**
     * Validate payment details
     */
    static validatePaymentDetails(paymentDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = [];
            if (!paymentDetails.amount || typeof paymentDetails.amount !== 'number' || paymentDetails.amount <= 0) {
                errors.push('Payment amount must be a positive number.');
            }
            if (!paymentDetails.method) {
                errors.push('Payment method is required.');
            }
            else if (!['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'].includes(paymentDetails.method)) {
                errors.push('Invalid payment method.');
            }
            if (paymentDetails.method === 'credit_card' || paymentDetails.method === 'debit_card') {
                if (!paymentDetails.cardNumber) {
                    errors.push('Card number is required for card payments.');
                }
                if (!paymentDetails.expiryDate) {
                    errors.push('Card expiry date is required for card payments.');
                }
                if (!paymentDetails.cvv) {
                    errors.push('CVV is required for card payments.');
                }
            }
            return {
                valid: errors.length === 0,
                errors: errors.length > 0 ? errors : undefined
            };
        });
    }
    /**
     * Validate QR code format
     */
    static validateQrCodeFormat(qrCode) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement QR code format validation
            // Check if the QR code has the correct format
            return !!qrCode && qrCode.length > 0;
        });
    }
    /**
     * Helper method to validate UUID format
     */
    static isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
    /**
     * Helper method to validate date string format
     */
    static isValidDateString(dateString) {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }
    /**
     * Helper method to validate payment status
     */
    static isValidPaymentStatus(status) {
        return ['pending', 'paid', 'failed', 'refunded'].includes(status.toLowerCase());
    }
    /**
     * Validate registration exists
     */
    static validateRegistrationExists(registrationId) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement registration existence validation
            // Check if a registration with the given ID exists
            return true;
        });
    }
    /**
     * Validate registration belongs to user
     */
    static validateRegistrationBelongsToUser(registrationId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement validation that registration belongs to user
            // Check if the registration belongs to the specified user
            return true;
        });
    }
    /**
     * Validate registration can be modified
     */
    static validateRegistrationCanBeModified(registrationId) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement validation that registration can be modified
            // Check if the registration can be modified (e.g., not too close to event date)
            return true;
        });
    }
    /**
     * Validate registration can be canceled
     */
    static validateRegistrationCanBeCanceled(registrationId) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement validation that registration can be canceled
            // Check if the registration can be canceled (e.g., within cancellation period)
            return true;
        });
    }
    /**
     * Validate registration can be transferred
     */
    static validateRegistrationCanBeTransferred(registrationId) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement validation that registration can be transferred
            // Check if the registration can be transferred to another user
            return true;
        });
    }
    /**
     * Validate user can receive transfer
     */
    static validateUserCanReceiveTransfer(userId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement validation that user can receive transfer
            // Check if the user can receive a transferred registration
            return true;
        });
    }
}
exports.ValidationService = ValidationService;
