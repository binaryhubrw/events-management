// src/controller/RegistrationController.ts
import { NextFunction, RequestHandler, Response } from "express";
import { RegistrationRepository } from "../repositories/RegistrationRepository";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";
import { v4 as uuidv4 } from 'uuid';
import { RegistrationService } from "../services/registrations/ValidationRegistrationService";
// You DON'T need to import AppDataSource, User, Event, TicketType, Venue here anymore
// because RegistrationRepository and ValidationService will handle getting repositories.
import { QrCodeService } from "../services/registrations/QrCodeService";
import path from "path";
import fs from "fs";
import { AppDataSource } from "../config/Database";
import { User } from "../models/User";
import { RegistrationRequestInterface, RegistrationResponseInterface } from "../interfaces/RegistrationInterface";
import { PaymentStatus } from "../interfaces/Index";


export class RegistrationController {
   

    // Create Registration
    // Static method for creating a registration
 
    // Create Registration
    // Static method for creating a registration
static async createRegistration(req: Request, res: Response): Promise<void> {
        try {
        // Accept the body as any, but validate/transform before using as RegistrationRequestInterface
        const registrationData = req.body as Partial<RegistrationRequestInterface>;

        // Extract userId directly from request body (no authentication)
        const userId = registrationData.userId;
        if (!userId) {
            res.status(400).json({ success: false, message: "User ID is required." });
            return;
        }

        let finalBuyerId: string | null = null;
        const buyerIdFromRequest = registrationData.buyerId;

        // Set buyerId based on request or default to userId
        if (buyerIdFromRequest === null || buyerIdFromRequest === undefined) {
            finalBuyerId = userId;
        } else {
            finalBuyerId = buyerIdFromRequest;
        }

        const registrationId = uuidv4(); // Generate a UUID for the new registration

        // Ensure noOfTickets is always a number (not undefined)
        if (registrationData.noOfTickets === undefined || registrationData.noOfTickets === null) {
            res.status(400).json({ success: false, message: "Number of tickets (noOfTickets) is required." });
            return;
        }

        const dataForService: RegistrationRequestInterface = {
            ...registrationData,
            registrationId: registrationId, // Assign the generated UUID
            userId: userId,
            buyerId: finalBuyerId,
            paymentStatus: registrationData.paymentStatus || PaymentStatus.PENDING,
            attended: registrationData.attended || false,
            boughtForIds: registrationData.boughtForIds || [],
            eventId: registrationData.eventId ?? "", // Ensure string, not undefined
            ticketTypeId: registrationData.ticketTypeId ?? "", // Ensure string, not undefined
            venueId: registrationData.venueId ?? "", // Ensure string, not undefined
            noOfTickets: Number(registrationData.noOfTickets), // Ensure number, not undefined
            // Add other required string fields similarly if needed
        };

        // ---
        // Step 1: Validate the incoming request data
        // ---
        const validationResult = await RegistrationService.validateRegistrationIds(dataForService);

        if (!validationResult.valid) {
            res.status(400).json({
                success: false,
                message: validationResult.message,
                errors: validationResult.errors
            });
            return;
        }

        // ---
        // Step 2: Validate event capacity and ticket cost
        // ---
        const capacityValidation = await RegistrationService.validateEventCapacity(
            dataForService.eventId,
            dataForService.venueId,
            dataForService.noOfTickets
        );

        if (!capacityValidation.valid) {
            res.status(400).json({
                success: false,
                message: capacityValidation.message
            });
            return;
        }

        const ticketCostValidation = await RegistrationService.validateAndCalculateTicketCost(
            dataForService.ticketTypeId,
            dataForService.noOfTickets
        );

        if (!ticketCostValidation.valid || ticketCostValidation.totalCost === undefined) {
            res.status(400).json({
                success: false,
                message: ticketCostValidation.message || "Could not validate ticket type or calculate cost."
            });
            return;
        }

        // Update the totalCost in dataForService as it's now calculated and validated
        dataForService.totalCost = ticketCostValidation.totalCost;

        // ---
        // Step 3: Check for duplicate registrations
        // ---
        const duplicateValidation = await RegistrationService.validateDuplicateRegistration(
            dataForService.eventId,
            dataForService.userId,
            dataForService.buyerId ?? "",
            dataForService.boughtForIds
        );

        if (!duplicateValidation.valid) {
            res.status(400).json({
                success: false,
                message: duplicateValidation.message
            });
            return;
        }

        // ---
        // Step 4: Create the registration (after all validations pass)
        // ---
        const newRegistrationResponse: RegistrationResponseInterface = await RegistrationService.createRegistration(dataForService);

        res.status(201).json({
            success: true,
            message: "Registration created successfully",
            data: newRegistrationResponse
        });

    } catch (error: any) {
        console.error('Error creating registration:', error);

        if (error instanceof Error) {
            if (error.message.includes("not found") || error.message.includes("Validation failed:") || error.message.includes("Not enough capacity") || error.message.includes("already registered")) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                    errors: error.message.includes("Validation failed:") ? error.message.split("; ") : undefined
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Failed to create registration due to an unexpected server error.",
                    error: error.message
                });
            }
        } else {
            res.status(500).json({
                success: false,
                message: "An unknown error occurred.",
                error: String(error)
            });
        }
    }
}

  
  
    static async getAllRegistrations(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const registrations = await RegistrationRepository.findAll();
            res.status(200).json({ success: true, data: registrations });
        } catch (error) {
            console.error('Error getting all registrations:', error);
            res.status(500).json({ success: false, message: "Failed to retrieve registrations." });
        }
    } /**
     * Retrieves a user's details and the total cost of all tickets associated with them.
     * This includes registrations where they are the buyer or the primary attendee.
     * @param req The authenticated request object, containing userId in params.
     * @param res The Express response object.
     */
 /**
 * Get ticket cost summary for a specific user
 * Authorized users: Admin, Manager, Buyer (who purchased tickets), or the target user themselves
 */
static async getUserTicketCostSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    const loggedInUserId = req.user?.userId;
    const loggedInUserRoles = req.user?.roles || []; // Array of role names
    const { userId: targetUserId } = req.params;

    console.log(`[RegistrationController:getUserTicketCostSummary] Logged-in User ID: ${loggedInUserId}, Roles: ${JSON.stringify(loggedInUserRoles)}, Target User ID: ${targetUserId}`);

    try {
        // Basic validation
        if (!loggedInUserId) {
            res.status(401).json({ 
                success: false, 
                message: 'Unauthorized: User information is missing from the token.' 
            });
            return;
        }

        if (!targetUserId) {
            res.status(400).json({ 
                success: false, 
                message: 'Target user ID is required.' 
            });
            return;
        }

        // Check if target user exists
        const targetUser = await AppDataSource.getRepository(User).findOne({
            where: { userId: targetUserId }
        });

        if (!targetUser) {
            res.status(404).json({ 
                success: false, 
                message: 'Target user not found.' 
            });
            return;
        }

        // Authorization check with case-insensitive role comparison
        const normalizedRoles = loggedInUserRoles.map((role: { roleName: string }) => role.roleName.toLowerCase());
        const hasAdminAccess = normalizedRoles.includes('admin');
        const hasManagerAccess = normalizedRoles.includes('manager');
        const isSelfAccess = loggedInUserId === targetUserId;

        // For Buyer role, we need to check if they actually bought tickets for the target user
        let hasBuyerAccess = false;
        if (normalizedRoles.includes('buyer')) {
            const buyerRegistrations = await RegistrationRepository.getRepository().find({
                where: [
                    { buyer: { userId: loggedInUserId }, user: { userId: targetUserId } },
                    { buyer: { userId: loggedInUserId } }
                ],
                relations: ['buyer', 'user']
            });

            hasBuyerAccess = buyerRegistrations.some(reg => 
                reg.buyer.userId === loggedInUserId && 
                (reg.user.userId === targetUserId || 
                 (reg.boughtForIds && reg.boughtForIds.includes(targetUserId)))
            );
        }

        // Check if user has any of the required permissions
        const isAuthorized = hasAdminAccess || hasManagerAccess || isSelfAccess || hasBuyerAccess;

        if (!isAuthorized) {
            res.status(403).json({ 
                success: false, 
                message: 'Forbidden: You do not have permission to view this user\'s ticket cost summary.' 
            });
            return;
        }

        // Fetch all registrations for the target user
        const registrations = await RegistrationRepository.getRepository().find({
            where: [
                { user: { userId: targetUserId } },
                { buyer: { userId: targetUserId } }
            ],
            relations: ['event', 'user', 'buyer', 'ticketType', 'venue', 'payment'],
            order: { registrationDate: 'DESC' }
        });

        // Also find registrations where target user is in boughtForIds
     // Corrected code for additionalRegistrations query
const additionalRegistrations = await RegistrationRepository.getRepository()
    .createQueryBuilder('registration')
    .leftJoinAndSelect('registration.event', 'event')
    .leftJoinAndSelect('registration.user', 'user')
    .leftJoinAndSelect('registration.buyer', 'buyer')
    .leftJoinAndSelect('registration.ticketType', 'ticketType')
    .leftJoinAndSelect('registration.venue', 'venue')
    .leftJoinAndSelect('registration.payment', 'payment')
    // Corrected WHERE clause: Check if the array 'boughtForIds' contains the 'targetUserId'
    .where('registration.boughtForIds @> ARRAY[:userId]::uuid[]', { userId: targetUserId })
    .getMany();

        // Combine and deduplicate registrations
        const allRegistrations = [...registrations, ...additionalRegistrations]
            .filter((reg, index, arr) => 
                arr.findIndex(r => r.registrationId === reg.registrationId) === index
            );

        // Calculate summary statistics
        let totalTickets = 0;
        let totalCost = 0;
        let totalPaid = 0;
        let totalPending = 0;
        let totalRefunded = 0;

        const registrationSummaries = allRegistrations.map(registration => {
            const ticketPrice = registration.ticketType ? parseFloat(registration.ticketType.price.toString()) : 0;
            const regTotalCost = ticketPrice * registration.noOfTickets;
            
            totalTickets += registration.noOfTickets;
            totalCost += regTotalCost;

            // Calculate payment totals based on status
            switch (registration.paymentStatus?.toLowerCase()) {
                case 'completed':
                case 'paid':
                    totalPaid += regTotalCost;
                    break;
                case 'pending':
                    totalPending += regTotalCost;
                    break;
                case 'refunded':
                    totalRefunded += regTotalCost;
                    break;
            }

            return {
                registrationId: registration.registrationId,
                eventId:registration.eventId,
                eventName: registration.event.eventTitle,
                eventDate: registration.event.createdAt,
                ticketType: registration.ticketType.ticketName,
                noOfTickets: registration.noOfTickets,
                ticketPrice: ticketPrice,
                totalCost: regTotalCost,
                paymentStatus: registration.paymentStatus,
                registrationStatus: registration.registrationStatus,
                registrationDate: registration.registrationDate,
                isPrimaryAttendee: registration.user.userId === targetUserId,
                isBuyer: registration.buyer.userId === targetUserId,
                isInBoughtForIds: registration.boughtForIds ? registration.boughtForIds.includes(targetUserId) : false
            };
        });

        const summary = {
            targetUser: {
                userId: targetUser.userId,
                fullName: targetUser.fullName,
                email: targetUser.email
            },
            totalRegistrations: allRegistrations.length,
            totalTickets,
            totalCost: parseFloat(totalCost.toFixed(2)),
            totalPaid: parseFloat(totalPaid.toFixed(2)),
            totalPending: parseFloat(totalPending.toFixed(2)),
            totalRefunded: parseFloat(totalRefunded.toFixed(2)),
            registrations: registrationSummaries
        };

        res.status(200).json({
            success: true,
            message: 'User ticket cost summary retrieved successfully.',
            data: summary
        });

    } catch (error) {
        console.error(`Error getting ticket cost summary for user ${targetUserId} by user ${loggedInUserId}:`, error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to retrieve ticket cost summary due to a server error.' 
        });
    }
}



    //update registration
    static async updateRegistration(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const registrationId = req.params.id;
            const updateData: RegistrationRequestInterface = req.body;

            // Validate the update data if necessary
            const validationResult = await RegistrationService.validateRegistrationIds(updateData);
            if (!validationResult.valid) {
                res.status(400).json({
                    success: false,
                    message: validationResult.message,
                    errors: validationResult.errors
                });
                return;
            }

            const updatedRegistration = await RegistrationRepository.update(registrationId, updateData);
            if (!updatedRegistration) {
                res.status(404).json({ success: false, message: "Registration not found." });
                return;
            }
            res.status(200).json({ success: true, data: updatedRegistration });
        } catch (error) {
            console.error('Error updating registration:', error);
            res.status(500).json({ success: false, message: "Failed to update registration." });
        }
    
    }
//delete registrations 
/**
     * Deletes a registration by ID.
     * @param req - Authenticated request object containing the registration ID.
     * @param res - Express response object.
     */
    static async deleteRegistration(req: import("express").Request, res: Response): Promise<void> {
        try {
            const { registrationId } = req.params;

            if (!registrationId) {
                res.status(400).json({ message: 'Registration ID is required.' });
                return;
            }

            const success = await RegistrationRepository.delete(registrationId);

            if (success) {
                res.status(200).json({ message: 'Registration deleted successfully.' });
            } else {
                res.status(404).json({ message: 'Registration not found or could not be deleted.' });
            }
        } catch (error) {
            console.error(`Error deleting registration ${req.params.registrationId}:`, error);
            res.status(500).json({ message: 'An error occurred while deleting the registration.' });
        }
    }


    /**
     * Regenerates the QR code for a specific registration.
     * Deletes the old QR code file and saves the new one.
     */
    static regenerateQrCode: RequestHandler<{ id: string }> = async (req, res) => {
        try {
            const { id: registrationId } = req.params;

            // 1. Find the existing registration
            const existingRegistration = await RegistrationRepository.findById(registrationId);
            if (!existingRegistration) {
                res.status(404).json({ success: false, message: "Registration not found." });
                return;
            }

            // 2. Delete the old QR code file if it exists
            if (existingRegistration.qrCode) {
                const oldQrCodePath = path.join(__dirname, '..', '..', existingRegistration.qrCode);
                if (fs.existsSync(oldQrCodePath)) {
                    fs.unlinkSync(oldQrCodePath); // Synchronous for simplicity, async for production
                    console.log(`Deleted old QR code file: ${oldQrCodePath}`);
                }
            }

            // 3. Generate a new QR code
            const newQrCodeFilePath = await QrCodeService.generateQrCode(
                existingRegistration.registrationId,
                existingRegistration.user.id,
                existingRegistration.event.eventId
            );

            // 4. Update the registration with the new QR code file path
            const updatedRegistration = await RegistrationRepository.update(registrationId, { qrCode: newQrCodeFilePath });

            if (!updatedRegistration) {
                // This case should ideally not be hit if existingRegistration was found
                throw new Error("Failed to update registration with new QR code path.");
            }

            res.status(200).json({
                success: true,
                message: "QR code regenerated successfully.",
                data: updatedRegistration,
                qrCodeUrl: `/static/${newQrCodeFilePath}`
            });

        } catch (error) {
            console.error(`Error regenerating QR code for registration ${req.params.id}:`, error);
            res.status(500).json({ success: false, message: "Failed to regenerate QR code." });
        }
    };

    /**
     * Validates a raw QR code string (the base64 encoded data) and returns the associated registration.
     * This is typically used for check-in scenarios.
     */
    static validateQrCode: RequestHandler<{ qrCode: string }> = async (req, res) => {
        try {
            const { qrCode } = req.params; // Expecting the raw base64 string from the QR code

            if (!qrCode) {
                res.status(400).json({ success: false, message: "QR code string is required." });
                return;
            }

            // Use the repository method that leverages QrCodeService for validation
            const registration = await RegistrationRepository.findByQRCode(qrCode);

            if (registration=== null) {
                res.status(404).json({ success: false, message: "Invalid or expired QR code, or registration not found." });
                return;
            }

            res.status(200).json({
                success: true,
                message: "QR code validated successfully.",
                data: registration
            });

        } catch (error) {
            console.error(`Error validating QR code:`, error);
            res.status(500).json({ success: false, message: "Failed to validate QR code." });
        }
    };

    /**
     * Gets the QR code path stored for a specific registration.
     * This method retrieves the path from the database, not the image itself.
     */
    static async getRegistrationQrCode(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const registration = await RegistrationRepository.findById(id);

            if (!registration) {
                res.status(404).json({ success: false, message: "Registration not found." });
                return;
            }

            if (!registration.qrCode) {
                res.status(404).json({ success: false, message: "QR code not generated for this registration." });
                return;
            }

            res.status(200).json({
                success: true,
                message: "QR code path retrieved successfully.",
                qrCodePath: registration.qrCode,
                qrCodeUrl: `/static/${registration.qrCode}` // Provide a full URL
            });

        } catch (error) {
            console.error(`Error getting QR code path for registration ${req.params.id}:`, error);
            res.status(500).json({ success: false, message: "Failed to retrieve QR code path." });
        }
    }

    /**
     * Serves the actual QR code image file for a given registration ID.
     */
    static async getRegistrationQrCodeImage(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const registration = await RegistrationRepository.findById(id);

            if (!registration || !registration.qrCode) {
                res.status(404).json({ success: false, message: "QR code not found for this registration, or it hasn't been generated yet." });
                return;
            }

            // CRITICAL LINE TO CHECK:
            // __dirname in 'src/controller' -> 'path.join(__dirname, '..')' goes to 'src/'
            // Then 'uploads/qrcodes' is appended.
            const QR_CODES_UPLOAD_BASE_DIR = path.join(__dirname, '..', 'uploads', 'qrcodes'); // THIS MUST BE CORRECT!

            const absolutePath = path.join(QR_CODES_UPLOAD_BASE_DIR, registration.qrCode);

            // This log will now show the path the controller is *actually checking*
            console.error(`QR code image file not found at: ${absolutePath}`); // This log will still appear if the path is wrong

            if (!fs.existsSync(absolutePath)) {
                // This message means the file is not at 'absolutePath'
                res.status(404).json({ success: false, message: "QR code image file not found on server." });
                return;
            }

            // If we reach here, the file should exist at 'absolutePath'
            res.sendFile(absolutePath);

        } catch (error) {
            console.error(`Error retrieving QR code image for registration ${req.params.id}:`, error);
            res.status(500).json({ success: false, message: "Failed to retrieve QR code image due to a server error." });
        }
    }

}