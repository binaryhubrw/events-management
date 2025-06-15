// src/services/registrations/TicketService.ts

import { AuthenticatedRequest } from '../../middlewares/AuthMiddleware';
import { TicketType } from '../../models/TicketType';
import { Response } from 'express';
import { RegistrationRepository } from '../../repositories/RegistrationRepository';
import { User } from '../../models/User';
import { AppDataSource } from '../../config/Database';
import { Registration } from '../../models/Registration';
import { validate, IsArray, ArrayNotEmpty, IsUUID, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Invoice } from '../../models/Invoice';
import { Event } from '../../models/Event';
import PDFDocument from 'pdfkit';
import EmailService from '../emails/EmailService';

export class TicketService {

    // Helper method to check authorization
    // Renamed for clarity on its purpose: Authorize access to a specific registration
  private static isAuthorizedForRegistration(
    loggedInUserId: string,
    loggedInUserRoleNames: string[],
    registration: Registration
): boolean {
    const normalizedRoles = loggedInUserRoleNames.map(role => role.toLowerCase());
    const hasAdminAccess = normalizedRoles.includes('admin');
    const hasManagerAccess = normalizedRoles.includes('manager');

    // Admin and Manager have full access to any registration
    if (hasAdminAccess || hasManagerAccess) {
        return true;
    }

    // Normalize loggedInUserId for comparison
    const normalizedLoggedInUserId = loggedInUserId.toLowerCase();

    // Check if the logged-in user is the buyer of this registration
    const isBuyer = registration.buyer?.userId?.toLowerCase() === normalizedLoggedInUserId;

    // Check if the logged-in user is the primary attendee of this registration
    const isPrimaryAttendee = registration.user?.userId?.toLowerCase() === normalizedLoggedInUserId;

    // Check if the logged-in user is one of the "boughtFor" attendees
    const isInBoughtFor = Array.isArray(registration.boughtForIds) &&
                          registration.boughtForIds.map(id => id.toLowerCase()).includes(normalizedLoggedInUserId);

    // A user is authorized if they are an admin, manager, the buyer, the primary attendee,
    // or one of the attendees for whom the ticket was bought.
    return isBuyer || isPrimaryAttendee || isInBoughtFor;
}

    /**
     * Get ticket details for a registration
     */
    static async getTicketDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
        const loggedInUserId = req.user?.userId;
        // Ensure roles are mapped to an array of strings containing just the role names
        const loggedInUserRoles = req.user?.roles?.map((role: any) => typeof role === 'string' ? role : role.roleName) || [];

        console.log(`[TicketService:getTicketDetails] User ID: ${loggedInUserId}, Roles: ${JSON.stringify(loggedInUserRoles)}`);

        try {
            const { id: registrationId } = req.params;

            if (!loggedInUserId) {
                res.status(401).json({ success: false, message: 'Unauthorized: User information is missing from the token.' });
                return;
            }

            if (!registrationId) {
                res.status(400).json({ success: false, message: 'Registration ID is required.' });
                return;
            }

            // Find the registration with all necessary relations
            const registration = await RegistrationRepository.getRepository().findOne({
                where: { registrationId },
                relations: ['event', 'user', 'buyer', 'ticketType', 'venue']
            });

            if (!registration) {
                res.status(404).json({ success: false, message: 'Registration not found.' });
                return;
            }

            // Authorization Check
            if (!this.isAuthorizedForRegistration(loggedInUserId, loggedInUserRoles, registration)) {
                res.status(403).json({ success: false, message: 'Forbidden: You do not have access to these registration details.' });
                return;
            }

            // Fetch details for boughtForIds users
            let boughtForUsersDetails: User[] = [];
            if (registration.boughtForIds && registration.boughtForIds.length > 0) {
                boughtForUsersDetails = await AppDataSource.getRepository(User).findByIds(registration.boughtForIds);
            }

            // Calculate total cost and include ticket type details
            const ticketPrice = registration.ticketType ? parseFloat(registration.ticketType.price.toString()) : 0;
            const totalCost = ticketPrice * registration.noOfTickets;

            // Construct the enhanced response data
            const responseData = {
                registrationId: registration.registrationId,
                noOfTickets: registration.noOfTickets,
                registrationDate: registration.registrationDate,
                paymentStatus: registration.paymentStatus,
                attended: registration.attended,
                checkDate: registration.checkDate,
                qrCode: registration.qrCode,

                ticketType: {
                    id: registration.ticketType?.ticketTypeId, // Add null check
                    name: registration.ticketType?.ticketName, // Add null check
                    description: registration.ticketType?.description, // Add null check
                    price: ticketPrice,
                    availableQuantity: registration.noOfTickets
                },

                buyer: {
                    userId: registration.buyer?.userId, // Add null check
                    fullName: registration.buyer?.fullName, // Add null check
                    email: registration.buyer?.email, // Add null check
                },

                primaryAttendee: {
                    userId: registration.user?.userId, // Add null check
                    fullName: registration.user?.fullName, // Add null check
                    email: registration.user?.email, // Add null check
                },

                boughtForAttendees: boughtForUsersDetails.map(user => ({
                    userId: user.userId,
                    fullName: user.fullName,
                    email: user.email,
                })),

                event: {
                    eventId: registration.event?.eventId, // Add null check
                    eventName: registration.event?.eventTitle, // Add null check
                    eventType: registration.event?.eventType, // Add null check
                    category: registration.event?.eventCategory, // Add null check
                    description: registration.event?.description, // Add null check
                },

                venue: {
                    venueId: registration.venue?.venueId, // Add null check
                    venueName: registration.venue?.venueName, // Add null check
                    address: registration.venue?.location, // Add null check
                    capacity: registration.venue?.capacity, // Add null check
                    manager: registration.venue?.manager, // Add null check
                    location: registration.venue?.location, // Add null check
                    isAvailable: registration.venue?.isAvailable, // Add null check
                },
                totalCost: totalCost
            };

            res.status(200).json({
                success: true,
                message: 'Ticket details retrieved successfully.',
                data: responseData
            });

        } catch (error) {
            console.error(`Error getting ticket details for registration ${req.params.id} by user ${loggedInUserId}:`, error);
            res.status(500).json({ success: false, message: 'Failed to retrieve ticket details due to a server error.' });
        }
    }

    /**
     * Transfer a ticket to a new user
     */
    static async transferTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
        const loggedInUserId = req.user?.userId;
        const loggedInUserRoles = req.user?.roles?.map((role: any) => typeof role === 'string' ? role : role.roleName) || [];

        console.log(`[TicketService:transferTicket] User ID: ${loggedInUserId}, Roles: ${JSON.stringify(loggedInUserRoles)}`);

        try {
            const { id: registrationId } = req.params;
            const { oldUserId, newUserId } = req.body;

            if (!loggedInUserId) {
                res.status(401).json({ success: false, message: 'Unauthorized: User information is missing.' });
                return;
            }

            if (!registrationId || !newUserId) {
                res.status(400).json({ success: false, message: 'Registration ID and new User ID are required.' });
                return;
            }

            // Find the registration with necessary relations
            const registration = await RegistrationRepository.getRepository().findOne({
                where: { registrationId },
                relations: ['buyer', 'user']
            });

            if (!registration) {
                res.status(404).json({ success: false, message: 'Registration not found.' });
                return;
            }

            // Authorization Check - Admin, Manager, or Buyer can transfer
            if (!this.isAuthorizedForRegistration(
                loggedInUserId,
                loggedInUserRoles,
                registration
            )) {
                res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to transfer tickets for this registration.' });
                return;
            }

            // Validate newUserId
            const newUser = await AppDataSource.getRepository(User).findOne({ where: { userId: newUserId } });
            if (!newUser) {
                res.status(400).json({ success: false, message: 'New user (newUserId) not found.' });
                return;
            }

            // Ticket Transfer Logic
            let updatedBoughtForIds = registration.boughtForIds ? [...registration.boughtForIds] : [];
            let transferSuccessful = false;

            if (oldUserId) {
                // Scenario 1: Replacing an existing boughtForId
                const indexToRemove = updatedBoughtForIds.indexOf(oldUserId);

                // Prevent replacing the primary attendee or buyer
                if (registration.user?.userId === oldUserId || registration.buyer?.userId === oldUserId) {
                    res.status(400).json({ success: false, message: 'Cannot transfer the primary attendee\'s or buyer\'s ticket directly using this method.' });
                    return;
                }

                if (indexToRemove !== -1) {
                    const otherBoughtForIds = updatedBoughtForIds.filter((_, idx) => idx !== indexToRemove);
                    if (otherBoughtForIds.includes(newUserId)) {
                        res.status(400).json({ success: false, message: 'The new user is already assigned a ticket for this registration.' });
                        return;
                    }
                    updatedBoughtForIds[indexToRemove] = newUserId;
                    transferSuccessful = true;
                } else {
                    if (updatedBoughtForIds.length < registration.noOfTickets) {
                        if (updatedBoughtForIds.includes(newUserId)) {
                            res.status(400).json({ success: false, message: 'The new user is already assigned a ticket for this registration.' });
                            return;
                        }
                        updatedBoughtForIds.push(newUserId);
                        transferSuccessful = true;
                    } else {
                        res.status(400).json({ success: false, message: 'Old user not found in bought tickets, and no available slots for transfer.' });
                        return;
                    }
                }
            } else {
                // Scenario 2: Fill an empty slot
                if (updatedBoughtForIds.length < registration.noOfTickets) {
                    if (updatedBoughtForIds.includes(newUserId)) {
                        res.status(400).json({ success: false, message: 'The new user is already assigned a ticket for this registration.' });
                        return;
                    }
                    updatedBoughtForIds.push(newUserId);
                    transferSuccessful = true;
                } else {
                    res.status(400).json({ success: false, message: 'Cannot transfer: All ticket slots are already assigned.' });
                    return;
                }
            }

            if (transferSuccessful) {
                registration.boughtForIds = updatedBoughtForIds;
                await RegistrationRepository.getRepository().save(registration);

                res.status(200).json({
                    success: true,
                    message: `Ticket successfully transferred for registration ${registrationId}.`,
                    data: {
                        registrationId: registration.registrationId,
                        noOfTickets: registration.noOfTickets,
                        updatedBoughtForIds: registration.boughtForIds
                    }
                });
            } else {
                res.status(400).json({ success: false, message: 'Ticket transfer failed due to logic error.' });
            }

        } catch (error) {
            console.error(`Error transferring ticket for registration ${req.params.id} by user ${loggedInUserId}:`, error);
            res.status(500).json({ success: false, message: 'Failed to transfer ticket due to a server error.' });
        }
    }

    /**
     * Cancel specific tickets from a registration
     */
    static async cancelRegistration(req: AuthenticatedRequest, res: Response): Promise<void> {
        const loggedInUserId = req.user?.userId;
        const loggedInUserRoles = req.user?.roles?.map((role: any) => typeof role === 'string' ? role : role.roleName) || [];

        console.log(`[TicketService:cancelRegistration] User ID: ${loggedInUserId}, Roles: ${JSON.stringify(loggedInUserRoles)}`);

        try {
            const { id: registrationId } = req.params;
            const { idsToCancel } = req.body;

            if (!loggedInUserId) {
                res.status(401).json({ success: false, message: 'Unauthorized: User information is missing.' });
                return;
            }
            if (!registrationId) {
                res.status(400).json({ success: false, message: 'Registration ID is required.' });
                return;
            }

            // Validate the incoming request body
            const cancelDto = new CancelTicketsDto();
            cancelDto.idsToCancel = idsToCancel;
            const errors = await validate(cancelDto);
            if (errors.length > 0) {
                res.status(400).json({ success: false, message: 'Invalid request body.', errors: errors.map(err => err.constraints) });
                return;
            }

            const registrationRepository = AppDataSource.getRepository(Registration);
            const invoiceRepository = AppDataSource.getRepository(Invoice);

            // Fetch Registration with all necessary relations
            const registration = await registrationRepository.findOne({
                where: { registrationId },
                relations: ['payment', 'buyer', 'user', 'ticketType', 'invoice']
            });

            if (!registration) {
                res.status(404).json({ success: false, message: 'Registration not found.' });
                return;
            }

            // Authorization Check
            if (!this.isAuthorizedForRegistration(
                loggedInUserId,
                loggedInUserRoles,
                registration
            )) {
                res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to cancel tickets for this registration.' });
                return;
            }

            // Payment Status Check: Must be 'pending' for direct cost reduction
            if (registration.paymentStatus !== 'pending') {
                res.status(400).json({ success: false, message: `Cannot cancel tickets: Registration payment status is '${registration.paymentStatus}', not 'pending'. For paid registrations, a separate refund process is required.` });
                return;
            }

            // Process Ticket Cancellation
            let currentBoughtForIds = registration.boughtForIds ? [...registration.boughtForIds] : [];
            const ticketPricePerUnit = registration.ticketType ? parseFloat(registration.ticketType.price.toString()) : 0;

            if (ticketPricePerUnit <= 0) {
                res.status(500).json({ success: false, message: 'Invalid ticket price found for this registration.' });
                return;
            }

            const newBoughtForIds: string[] = [];
            const cancelledUserIds: string[] = [];

            for (const existingId of currentBoughtForIds) {
                if (idsToCancel.includes(existingId)) {
                    // Prevent cancellation of the primary attendee or buyer
                    if (existingId === registration.user?.userId || existingId === registration.buyer?.userId) {
                        console.warn(`Skipping cancellation of primary attendee/buyer (${existingId}) for registration ${registrationId}.`);
                        newBoughtForIds.push(existingId);
                    } else {
                        cancelledUserIds.push(existingId);
                    }
                } else {
                    newBoughtForIds.push(existingId);
                }
            }

            if (cancelledUserIds.length === 0) {
                res.status(400).json({ success: false, message: 'No valid tickets found for cancellation.' });
                return;
            }

            const ticketsActuallyCancelledCount = cancelledUserIds.length;
            const costReduction = ticketPricePerUnit * ticketsActuallyCancelledCount;

            // Update Registration details
            registration.boughtForIds = newBoughtForIds;
            registration.noOfTickets -= ticketsActuallyCancelledCount;
            registration.totalCost = parseFloat((registration.totalCost - costReduction).toFixed(2));

            // Update registration status
            if (registration.noOfTickets === 0) {
                registration.registrationStatus = 'cancelled';
                registration.paymentStatus = 'cancelled';
            } else {
                registration.registrationStatus = 'partially_cancelled';
            }

            // Update linked invoice
            if (registration.invoice) {
                registration.invoice.totalAmount = parseFloat((registration.invoice.totalAmount - costReduction).toFixed(2));
                await invoiceRepository.save(registration.invoice);
            }

            // Save the updated registration
            await registrationRepository.save(registration);

            res.status(200).json({
                success: true,
                message: `Successfully cancelled ${ticketsActuallyCancelledCount} ticket(s).`,
                data: {
                    registrationId: registration.registrationId,
                    newNoOfTickets: registration.noOfTickets,
                    newBoughtForIds: registration.boughtForIds,
                    newTotalCost: registration.totalCost,
                    newRegistrationStatus: registration.registrationStatus,
                    cancelledUserIds: cancelledUserIds
                }
            });

        } catch (error) {
            console.error(`Error cancelling tickets for registration ${req.params.id} by user ${loggedInUserId}:`, error);
            res.status(500).json({ success: false, message: 'Failed to cancel tickets due to a server error.' });
        }
    }

    /**
     * Resend ticket via email
     */
  /**
     * Resend ticket via email
     */
    static async resendTicket(registrationId: string, userEmail?: string): Promise<boolean> {
        try {
            console.log(`[TicketService:resendTicket] Resending ticket for registration: ${registrationId}`);

            const registration = await RegistrationRepository.getRepository().findOne({
                where: { registrationId },
                relations: ['event', 'user', 'buyer', 'ticketType', 'venue']
            });

            if (!registration) {
                console.error(`Registration not found: ${registrationId}`);
                return false;
            }

            // Generate ticket PDF
            const ticketPdf = await this.generateTicketPdf(registrationId);

            // Determine recipient email
            const recipientEmail = userEmail || registration.user?.email;

            // Send email with ticket attachment
            if (recipientEmail) {
                await EmailService.sendTicketEmail({
                    to: recipientEmail,
                    subject: `Your Ticket for ${registration.event?.eventTitle}`,
                    eventName: registration.event?.eventTitle,
                    eventDate: registration.event?.createdAt,
                    venueName: registration.venue?.venueName,
                    ticketPdf: ticketPdf,
                    qrCode: registration.qrCode
                });
            } else {
                console.warn(`No recipient email found for registration ${registrationId}. Skipping email send.`);
                return false;
            }


            return true;
        } catch (error) {
            console.error(`Error resending ticket for registration ${registrationId}:`, error);
            return false;
        }
    }

    /**
     * Generate ticket PDF
     */
    static async generateTicketPdf(registrationId: string): Promise<Buffer> {
        try {
            console.log(`[TicketService:generateTicketPdf] Generating PDF for registration: ${registrationId}`);

            const registration = await RegistrationRepository.getRepository().findOne({
                where: { registrationId },
                relations: ['event', 'user', 'buyer', 'ticketType', 'venue']
            });

            if (!registration) {
                throw new Error(`Registration not found: ${registrationId}`);
            }

            // Create PDF document
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk: Buffer) => chunks.push(chunk));

            // PDF Header
            doc.fontSize(24).text('EVENT TICKET', { align: 'center' });
            doc.moveDown();

            // Event Information
            doc.fontSize(18).text(registration.event?.eventTitle || 'N/A', { align: 'center' });
            doc.moveDown();

            doc.fontSize(12);
            doc.text(`Event Date: ${new Date(registration.event?.createdAt || '').toLocaleDateString()}`);
            doc.text(`Event Type: ${registration.event?.eventType || 'N/A'}`);
            doc.text(`Category: ${registration.event?.eventCategory || 'N/A'}`);
            doc.moveDown();

            // Venue Information
            doc.text(`Venue: ${registration.venue?.venueName || 'N/A'}`);
            doc.text(`Location: ${registration.venue?.location || 'N/A'}`);
            doc.moveDown();

            // Ticket Information
            const ticketPrice = registration.ticketType ? parseFloat(registration.ticketType.price.toString()) : 0;
            const totalCost = ticketPrice * registration.noOfTickets;
            doc.text(`Ticket Type: ${registration.ticketType?.ticketName || 'N/A'}`);
            doc.text(`Number of Tickets: ${registration.noOfTickets}`);
            doc.text(`Price per Ticket: $${ticketPrice.toFixed(2)}`);
            doc.text(`Total Cost: $${totalCost.toFixed(2)}`);
            doc.moveDown();

            // Attendee Information
            doc.text(`Primary Attendee: ${registration.user?.fullName || 'N/A'}`);
            doc.text(`Email: ${registration.user?.email || 'N/A'}`);
            doc.text(`Buyer: ${registration.buyer?.fullName || 'N/A'}`);
            doc.moveDown();

            // Registration Details
            doc.text(`Registration ID: ${registration.registrationId}`);
            doc.text(`Registration Date: ${new Date(registration.registrationDate).toLocaleDateString()}`);
            doc.text(`Payment Status: ${registration.paymentStatus}`);
            doc.moveDown();

            // QR Code (if available)
            if (registration.qrCode) {
                doc.text(`QR Code: ${registration.qrCode}`);
            }

            // Footer
            doc.moveDown();
            doc.text('Please present this ticket at the venue entrance.', { align: 'center' });
            doc.text('Thank you for your registration!', { align: 'center' });

            doc.end();

            return new Promise((resolve) => {
                doc.on('end', () => {
                    resolve(Buffer.concat(chunks));
                });
            });

        } catch (error) {
            console.error(`Error generating PDF for registration ${registrationId}:`, error);
            throw new Error(`PDF generation failed: ${error}`);
        }
    }

    /**
     * Validate ticket
     */
    static async validateTicket(registrationId: string): Promise<boolean> {
        try {
            console.log(`[TicketService:validateTicket] Validating ticket for registration: ${registrationId}`);

            const registration = await RegistrationRepository.getRepository().findOne({
                where: { registrationId },
                relations: ['event']
            });

            if (!registration) {
                console.error(`Registration not found: ${registrationId}`);
                return false;
            }

            // Check if registration is valid
            if (registration.registrationStatus === 'cancelled') {
                console.error(`Registration is cancelled: ${registrationId}`);
                return false;
            }

            // Check if payment is completed
            if (registration.paymentStatus !== 'completed' && registration.paymentStatus !== 'paid') {
                console.error(`Payment not completed for registration: ${registrationId}`);
                return false;
            }

            // Check if event date hasn't passed
            if (registration.event && new Date(registration.event.createdAt || registration.event.createdAt) < new Date()) {
                 console.error(`Event has already passed for registration: ${registrationId}`);
                 return false;
            }


            return true;
        } catch (error) {
            console.error(`Error validating ticket for registration ${registrationId}:`, error);
            return false;
        }
    }
    /**
     * Get available ticket types for an event
     */
    static async getAvailableTicketTypes(eventId: string): Promise<TicketType[]> {
        // TODO: Implement get available ticket types
        return []; // Placeholder return value
    }

    /**
     * Check ticket availability
     */
    static async checkTicketAvailability(ticketTypeId: string, quantity: number): Promise<boolean> {
        // TODO: Implement check ticket availability
        return false; // Placeholder return value
    }

    /**
     * Reserve tickets
     */
    static async reserveTickets(ticketTypeId: string, quantity: number, userId: string): Promise<boolean> {
        // TODO: Implement reserve tickets
        return false; // Placeholder return value
    }

     /**
     * Add tickets to an existing registration (increment noOfTickets)
     * Allows adding 1 ticket by default, up to a maximum of 10 tickets per registration,
     * and also respects the ticket type's maxQuantity.
     */
    static async AddToCartTheNoOfTickets(req: AuthenticatedRequest, res: Response): Promise<void> {
        const loggedInUserId = req.user?.userId;
        const loggedInUserRoles = req.user?.roles?.map((role: any) => typeof role === 'string' ? role : role.roleName) || [];

        console.log(`[TicketService:AddToCartTheNoOfTickets] User ID: ${loggedInUserId}, Roles: ${JSON.stringify(loggedInUserRoles)}`);

        try {
            const { id: registrationId } = req.params;
            const { quantityToAdd } = req.body;

            if (!loggedInUserId) {
                res.status(401).json({ success: false, message: 'Unauthorized: User information is missing.' });
                return;
            }

            if (!registrationId) {
                res.status(400).json({ success: false, message: 'Registration ID is required.' });
                return;
            }

            // Validate the incoming request body for quantityToAdd
            const addToCartDto = new AddToCartTicketsDto();
            addToCartDto.quantityToAdd = quantityToAdd;
            const errors = await validate(addToCartDto);
            if (errors.length > 0) {
                // If quantityToAdd is not a number or less than 1, default to 1
                if (typeof quantityToAdd !== 'number' || quantityToAdd < 1) {
                    addToCartDto.quantityToAdd = 1;
                } else {
                    res.status(400).json({ success: false, message: 'Invalid quantity to add.', errors: errors.map(err => err.constraints) });
                    return;
                }
            }
            // Ensure quantityToAdd is at least 1 if it was valid but not provided
            const actualQuantityToAdd = addToCartDto.quantityToAdd || 1;


            // Find the registration with necessary relations
            const registration = await RegistrationRepository.getRepository().findOne({
                where: { registrationId },
                relations: ['ticketType', 'user', 'buyer', 'invoice']
            });

            if (!registration) {
                res.status(404).json({ success: false, message: 'Registration not found.' });
                return;
            }

            // Authorization Check - Only the buyer or authorized roles can add tickets to their cart
            // This is crucial: an admin/manager can add to anyone's cart, but a regular user
            // can only add to their own registration.
            if (!this.isAuthorizedForRegistration(
                loggedInUserId,
                loggedInUserRoles,
                registration
            )) {
                res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to modify tickets for this registration.' });
                return;
            }

            // Ensure the registration is in a state where tickets can be added (e.g., not cancelled)
            if (registration.registrationStatus === 'cancelled' || registration.paymentStatus === 'completed' || registration.paymentStatus === 'paid') {
                res.status(400).json({ success: false, message: `Cannot add tickets to a registration with status '${registration.registrationStatus}' or payment status '${registration.paymentStatus}'.` });
                return;
            }

            const currentNoOfTickets = registration.noOfTickets;
            let newNoOfTickets = currentNoOfTickets + actualQuantityToAdd;
            let message = `Successfully added ${actualQuantityToAdd} ticket(s) to registration ${registrationId}.`;

            // Apply global maximum of 10 tickets per registration
            const GLOBAL_MAX_TICKETS_PER_REGISTRATION = 10;
            if (newNoOfTickets > GLOBAL_MAX_TICKETS_PER_REGISTRATION) {
                newNoOfTickets = GLOBAL_MAX_TICKETS_PER_REGISTRATION;
                message = `Added tickets. Reached maximum of ${GLOBAL_MAX_TICKETS_PER_REGISTRATION} tickets for registration ${registrationId}.`;
            }

            // Apply ticket type specific maximum quantity, if defined
            if (registration.ticketType?.maxQuantity && newNoOfTickets > registration.ticketType.maxQuantity) {
                newNoOfTickets = registration.ticketType.maxQuantity;
                message = `Added tickets. Reached maximum of ${registration.ticketType.maxQuantity} tickets for this ticket type.`;
            }

            // If no tickets were actually added due to limits
            if (newNoOfTickets === currentNoOfTickets) {
                 res.status(400).json({ success: false, message: 'No tickets were added as the maximum limit has already been reached.' });
                 return;
            }

            // Update Registration details
            registration.noOfTickets = newNoOfTickets;
            const ticketPricePerUnit = registration.ticketType ? parseFloat(registration.ticketType.price.toString()) : 0;
            registration.totalCost = parseFloat((newNoOfTickets * ticketPricePerUnit).toFixed(2));

            // Update linked invoice if it exists
            if (registration.invoice) {
                registration.invoice.totalAmount = registration.totalCost; // Invoice total should reflect new total cost
                await AppDataSource.getRepository(Invoice).save(registration.invoice);
            }

            // Save the updated registration
            await RegistrationRepository.getRepository().save(registration);

            res.status(200).json({
                success: true,
                message: message,
                data: {
                    registrationId: registration.registrationId,
                    newNoOfTickets: registration.noOfTickets,
                    newTotalCost: registration.totalCost
                }
            });

        } catch (error) {
            console.error(`Error adding tickets to cart for registration ${req.params.id} by user ${loggedInUserId}:`, error);
            res.status(500).json({ success: false, message: 'Failed to add tickets to cart due to a server error.' });
        }
    }


}


// DTO for validating the request body for cancellation
class CancelTicketsDto {
    @IsArray({ message: 'idsToCancel must be an array' })
    @ArrayNotEmpty({ message: 'idsToCancel array cannot be empty' })
    @IsUUID('4', { each: true, message: 'Each ID in idsToCancel must be a valid UUID' })
    idsToCancel!: string[];
}
// DTO for validating the request body for adding tickets to cart
class AddToCartTicketsDto {
    @IsOptional()
    @IsNumber({}, { message: 'quantityToAdd must be a number' })
    @Min(1, { message: 'quantityToAdd must be at least 1' })
    @Max(10, { message: 'quantityToAdd cannot exceed 10 in a single operation' }) // Optional: enforce max per operation
    quantityToAdd?: number;
}