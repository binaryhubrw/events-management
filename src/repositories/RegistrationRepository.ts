// src/repositories/RegistrationRepository.ts
import { Repository } from 'typeorm'; // getRepository is deprecated/less explicit
import { AppDataSource } from '../config/Database'; // IMPORT APPDATASOURCE
import { Registration } from '../models/Registration';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { TicketType } from '../models/TicketType';
import { Venue } from '../models/Venue';
import { RegistrationRequestInterface } from '../interfaces/RegistrationInterface'; // Use the request interface for data incoming
import { QrCodeService } from '../services/registrations/QrCodeService';
import { Request, Response, RequestHandler } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { RegistrationService } from '../services/registrations/ValidationRegistrationService';
import { PaymentStatus } from '../interfaces/Enums/PaymentStatusEnum';

export class RegistrationRepository {
    static findByQRCode(rawQrCodeDataString: string) {
        // Decode the base64 string to get the JSON payload
        const decodedData = Buffer.from(rawQrCodeDataString, 'base64').toString('utf-8');
        const qrPayload = JSON.parse(decodedData);

        // Extract the registrationId from the payload
        const { registrationId } = qrPayload;

        // Use the repository to find the registration by ID
        return this.getRepository().findOne({
            where: { registrationId },
            relations: ['event', 'user', 'buyer', 'ticketType', 'venue']
        });
    }

    // Get repository using the initialized AppDataSource
    public static getRepository(): Repository<Registration> {
        // Ensure AppDataSource is initialized before calling getRepository
        if (!AppDataSource.isInitialized) {
            throw new Error("AppDataSource is not initialized. Call AppDataSource.initialize() first.");
        }
        return AppDataSource.getRepository(Registration);
    }

    // Core Registration CRUD Operations
    // Note: registrationData should be Partial<RegistrationRequestInterface> or the full DTO
    static async create(registrationData: Partial<RegistrationRequestInterface>): Promise<Registration> {
        try {
            const repository = this.getRepository();

            // Fetch the full entity objects based on the provided IDs
            // This is crucial for TypeORM to correctly establish relationships
            const event = await AppDataSource.getRepository(Event).findOne({ where: { eventId: registrationData.eventId } });
            const user = await AppDataSource.getRepository(User).findOne({ where: { userId: registrationData.userId } });
            const buyer = registrationData.buyerId
                ? await AppDataSource.getRepository(User).findOne({ where: { userId: registrationData.buyerId } })
                : null;
            const ticketType = await AppDataSource.getRepository(TicketType).findOne({ where: { ticketTypeId: registrationData.ticketTypeId } });
            const venue = await AppDataSource.getRepository(Venue).findOne({ where: { venueId: registrationData.venueId } });

            // IMPORTANT: ValidationService already confirmed these IDs exist.
            // If any are null here, it indicates a critical bug or race condition.
            if (!event || !user || !buyer || !ticketType || !venue) {
                throw new Error("Missing required entity for registration after validation.");
            }

            // Create new registration instance with full entity objects for relationships
            const registration = repository.create({
                registrationId: registrationData.registrationId, // Ensure ID is passed if generated by controller
                event: event,
                user: user,
                buyer: buyer,
                boughtForIds: registrationData.boughtForIds || [], // Ensure array
                ticketType: ticketType,
                venue: venue,
                noOfTickets: registrationData.noOfTickets,
                registrationDate: registrationData.registrationDate,
                paymentStatus: registrationData.paymentStatus,
                qrCode: registrationData.qrCode,
                checkDate: registrationData.checkDate,
                attended: registrationData.attended || false
            });

            // Save to database
            return await repository.save(registration);
        } catch (error) {
            console.error('Error creating registration:', error);
            throw error;
        }
    }

    static async findAll(): Promise<Registration[]> {
        try {
            const repository = this.getRepository();
            return await repository.find({
                relations: ['event', 'user', 'buyer', 'ticketType', 'venue']
            });
        } catch (error) {
            console.error('Error finding all registrations:', error);
            throw error;
        }
    }

    static async findById(registrationId: string): Promise<Registration | null> {
        try {
            const repository = this.getRepository();
            const registration = await repository.findOne({
                where: { registrationId },
                relations: ['event', 'user', 'buyer', 'ticketType', 'venue']
            });

            return registration || null;
        } catch (error) {
            console.error(`Error finding registration by ID ${registrationId}:`, error);
            throw error;
        }
    }

    static async update(registrationId: string, updateData: Partial<RegistrationRequestInterface>): Promise<Registration | null> {
        try {
            const repository = this.getRepository();

            // First check if registration exists
            const registration = await this.findById(registrationId);
            if (!registration) {
                return null;
            }

            // Fetch related entities if their IDs are provided in updateData
            if (updateData.eventId) {
                registration.event = await AppDataSource.getRepository(Event).findOne({ where: { eventId: updateData.eventId } }) || registration.event;
            }
            if (updateData.userId) {
                registration.user = await AppDataSource.getRepository(User).findOne({ where: { userId: updateData.userId } }) || registration.user;
            }
            if (updateData.buyerId) { // Note: buyerId is usually tied to the original buyer, but allowing update here
                registration.buyer = await AppDataSource.getRepository(User).findOne({ where: { userId: updateData.buyerId } }) || registration.buyer;
            }
            if (updateData.ticketTypeId) {
                registration.ticketType = await AppDataSource.getRepository(TicketType).findOne({ where: { ticketTypeId: updateData.ticketTypeId } }) || registration.ticketType;
            }
            if (updateData.venueId) {
                registration.venue = await AppDataSource.getRepository(Venue).findOne({ where: { venueId: updateData.venueId } }) || registration.venue;
            }

            // Update primitive fields
            if (updateData.boughtForIds !== undefined) registration.boughtForIds = updateData.boughtForIds;
            if (updateData.noOfTickets !== undefined) registration.noOfTickets = updateData.noOfTickets;
            if (updateData.registrationDate) registration.registrationDate = new Date(updateData.registrationDate);
            if (updateData.paymentStatus) registration.paymentStatus = updateData.paymentStatus;
            if (updateData.qrCode) registration.qrCode = updateData.qrCode;
            if (updateData.checkDate !== undefined) registration.checkDate = new Date(updateData.checkDate);
            if (updateData.attended !== undefined) registration.attended = updateData.attended;

            // Save updated registration
            return await repository.save(registration);
        } catch (error) {
            console.error(`Error updating registration ${registrationId}:`, error);
            throw error;
        }
    }

    static async delete(registrationId: string): Promise<boolean> {
        try {
            const repository = this.getRepository();
            const result = await repository.delete(registrationId);
            return typeof result.affected === 'number' && result.affected > 0;
        } catch (error) {
            console.error(`Error deleting registration ${registrationId}:`, error);
            throw error;
        }
    }

    // --- Add other repository methods for event-specific, user-specific, QR code, attendance, payment, and ticket operations ---
    // Example: findByEventId (add to RegistrationRepository class)
    static async findByEventId(eventId: string): Promise<Registration[]> {
        try {
            const repository = this.getRepository();
            return await repository.find({
                where: { event: { eventId } }, // Filter by eventId
                relations: ['event', 'user', 'buyer', 'ticketType', 'venue']
            });
        } catch (error) {
            console.error(`Error finding registrations for event ${eventId}:`, error);
            throw error;
        }
    }


  /**
     * Handles the creation of a new registration.
     * This method also generates a unique QR code for the registration.
     */
    static async createRegistration(req: Request, res: Response): Promise<void> {
        try {
            const registrationData: RegistrationRequestInterface = req.body;

            const buyerId = req.user?.userId;
            if (!buyerId) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required. Buyer information not found."
                });
                return;
            }

            const registrationId = uuidv4(); // Generate a unique ID for the registration

            const dataForValidation: RegistrationRequestInterface = {
                ...registrationData,
                registrationId: registrationId,
                buyerId: buyerId,
                registrationDate: registrationData.registrationDate || new Date().toISOString(),
                paymentStatus: registrationData.paymentStatus || ('pending' as PaymentStatus),
                attended: registrationData.attended || false,
                boughtForIds: registrationData.boughtForIds || []
            };

            // Validate duplicate registration (e.g., prevent same user(s) registering for same event twice)
            const validationResult = await RegistrationService.validateDuplicateRegistration(
                dataForValidation.eventId,
                dataForValidation.userId,
                buyerId,
                dataForValidation.boughtForIds
            );
            if (!validationResult.valid) {
                res.status(400).json({
                    success: false,
                    message: validationResult.message,
                    errors: (validationResult as any).errors || []
                });
                return;
            }

            // --- Generate QR Code and get its FILENAME ---
            // The QrCodeService.generateQrCode returns *only the filename* (e.g., 'qrcode-xyz.png')
            const qrCodeFileName = await QrCodeService.generateQrCode(
                registrationId,
                dataForValidation.userId,
                dataForValidation.eventId
            );

            // Store only the filename in the database `qrCode` field
            dataForValidation.qrCode = qrCodeFileName;

            // Create the registration record in the database
            const result = await RegistrationRepository.create(dataForValidation);

            res.status(201).json({
                success: true,
                message: "Registration created successfully",
                data: {
                    ...result,
                    // Construct the full URL for the client to access the QR code image
                    qrCodeUrl: `/static/${qrCodeFileName}`
                }
            });

        } catch (error) {
            console.error('Error creating registration:', error);
            if (error instanceof Error && error.message.startsWith("Validation failed")) {
                 res.status(400).json({
                    success: false,
                    message: error.message,
                    errors: error.message.split(". ")
                 });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Failed to create registration due to an unexpected error."
                });
            }
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
                // Construct absolute path to the old file
                const QR_CODES_UPLOAD_BASE_DIR = path.join(__dirname, '..', '..', 'src', 'uploads', 'qrcodes');
                const oldQrCodePath = path.join(QR_CODES_UPLOAD_BASE_DIR, existingRegistration.qrCode);
                if (fs.existsSync(oldQrCodePath)) {
                    fs.unlinkSync(oldQrCodePath); // Synchronous for simplicity, consider async for production
                    console.log(`Deleted old QR code file: ${oldQrCodePath}`);
                }
            }

            // 3. Generate a new QR code (this now returns filename)
            const newQrCodeFileName = await QrCodeService.generateQrCode(
                existingRegistration.registrationId,
                existingRegistration.user.userId,
                existingRegistration.event.eventId
            );

            // 4. Update the registration with the new QR code filename
            const updatedRegistration = await RegistrationRepository.update(registrationId, { qrCode: newQrCodeFileName });

            if (!updatedRegistration) {
                throw new Error("Failed to update registration with new QR code path.");
            }

            res.status(200).json({
                success: true,
                message: "QR code regenerated successfully.",
                data: updatedRegistration,
                qrCodeUrl: `/static/${newQrCodeFileName}`
            });

        } catch (error) {
            console.error(`Error regenerating QR code for registration ${req.params.id}:`, error);
            res.status(500).json({ success: false, message: "Failed to regenerate QR code." });
        }
    };

    /**
     * Validates a raw QR code string (the base64 encoded data) and returns the associated registration.
     * This is typically used for check-in scenarios by event staff.
     */
    static validateQrCode: RequestHandler<{ qrCode: string }> = async (req, res) => {
        try {
            const { qrCode: rawQrCodeDataString } = req.params; // Expecting the raw base64 string from the QR code

            if (!rawQrCodeDataString) {
                res.status(400).json({ success: false, message: "QR code data string is required for validation." });
                return;
            }

            // Use the repository method that leverages QrCodeService for validation and lookup
            const registration = await RegistrationRepository.findByQRCode(rawQrCodeDataString);

            if (registration=== null) {
                res.status(404).json({ success: false, message: "Invalid or expired QR code, or registration not found." });
                return;
            }

            // Optionally, mark attendance here if validation is successful
            // For example: await RegistrationRepository.update(registration.registrationId, { attended: true });

            res.status(200).json({
                success: true,
                message: "QR code validated successfully. Registration details retrieved.",
                data: registration
            });

        } catch (error) {
            console.error(`Error validating QR code:`, error);
            res.status(500).json({ success: false, message: "Failed to validate QR code due to an internal server error." });
        }
    };

    /**
     * Gets the QR code path (filename) stored for a specific registration.
     * This method retrieves the path from the database, not the image itself.
     */
    static async getRegistrationQrCode(req: Request, res: Response): Promise<void> {
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
                qrCodeFileName: registration.qrCode, // Changed to fileName for clarity
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
    static async getRegistrationQrCodeImage(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const registration = await RegistrationRepository.findById(id);

            if (!registration || !registration.qrCode) {
                res.status(404).json({ success: false, message: "QR code not found for this registration, or it hasn't been generated yet." });
                return;
            }

            
            const QR_CODES_UPLOAD_BASE_DIR = path.join(__dirname, '..', '..', 'src', 'uploads', 'qrcodes');
            const absolutePath = path.join(QR_CODES_UPLOAD_BASE_DIR, registration.qrCode);

            // Check if the file actually exists on the server's disk
            if (!fs.existsSync(absolutePath)) {
                console.error(`QR code image file not found at: ${absolutePath}`);
                res.status(404).json({ success: false, message: "QR code image file not found on server storage." });
                return;
            }

            // Send the file to the client
            res.sendFile(absolutePath);

        } catch (error) {
            console.error(`Error retrieving QR code image for registration ${req.params.id}:`, error);
            res.status(500).json({ success: false, message: "Failed to retrieve QR code image due to a server error." });
        }
      }


}
