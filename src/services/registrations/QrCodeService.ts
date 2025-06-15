// src/services/QrCodeService.ts

import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

// Define the absolute upload directory
// Inside regenerateQrCode method
            const QR_CODES_UPLOAD_BASE_DIR = path.join(__dirname, '../../uploads', 'qrcodes'); // CORRECTED LINE
// const oldQrCodePath = path.join(QR_CODES_UPLOAD_BASE_DIR, existingRegistration.qrCode);
if (!fs.existsSync(QR_CODES_UPLOAD_BASE_DIR)) {
    try {
        fs.mkdirSync(QR_CODES_UPLOAD_BASE_DIR, { recursive: true });
        console.log(`[QrCodeService] Successfully created directory: ${QR_CODES_UPLOAD_BASE_DIR}`);
    } catch (dirError) {
        console.error(`[QrCodeService] ERROR: Failed to create directory ${QR_CODES_UPLOAD_BASE_DIR}:`, dirError);
        // Re-throw to ensure the server recognizes a setup issue immediately
        const errorMessage = (dirError instanceof Error) ? dirError.message : String(dirError);
        throw new Error(`Failed to initialize QR code upload directory: ${errorMessage}`);
    }
} else {
    console.log(`[QrCodeService] Directory already exists: ${QR_CODES_UPLOAD_BASE_DIR}`);
}


export class QrCodeService {
    static async generateQrCode(registrationId: string, userId: string, eventId: string): Promise<string> {
        try {
            const qrPayload = {
                registrationId,
                userId,
                eventId,
                timestamp: new Date().toISOString(),
                uniqueHash: uuidv4()
            };

            const qrDataString = Buffer.from(JSON.stringify(qrPayload)).toString('base64');

            const filename = `qrcode-${registrationId}.png`;
            const absoluteFilePath = path.join(QR_CODES_UPLOAD_BASE_DIR, filename);

            console.log(`[QrCodeService] Attempting to generate QR code for registration ${registrationId}`);
            console.log(`[QrCodeService] Saving file to absolute path: ${absoluteFilePath}`); // Log the exact path where it's trying to save

            await QRCode.toFile(absoluteFilePath, qrDataString);

            console.log(`[QrCodeService] Successfully saved QR code to: ${absoluteFilePath}`); // Confirmation log
            console.log('*** RAW QR DATA STRING FOR VALIDATION (COPY THIS!):', qrDataString);

            return filename; // Return only the filename for database storage

        } catch (error) {
            console.error(`[QrCodeService] CRITICAL ERROR generating and saving QR code for ${registrationId}:`, error); // More specific error log
            throw new Error('Failed to generate and save QR code image.'); // Re-throw for controller to catch
        }
    }
    /**
     * Validate/decode a QR code string. This method is used when checking in.
     * It expects the raw base64 encoded JSON payload (the content encoded in the QR image).
     *
     * @param qrDataString The base64 encoded JSON payload from the QR code.
     * @returns The decoded payload or null if invalid.
     */
    static async validateQrCode(qrDataString: string): Promise<{ registrationId: string; userId: string; eventId: string } | null> {
        try {
            // Decode the base64 string back to JSON
            const decodedString = Buffer.from(qrDataString, 'base64').toString('utf8');
            const qrPayload = JSON.parse(decodedString);

            if (qrPayload && qrPayload.registrationId && qrPayload.userId && qrPayload.eventId) {
                return {
                    registrationId: qrPayload.registrationId,
                    userId: qrPayload.userId,
                    eventId: qrPayload.eventId
                };
            }
            return null; // Invalid QR code format
        } catch (error) {
            console.error('Error validating QR code:', error);
            return null; // Failed to parse or validate
        }
    }
}