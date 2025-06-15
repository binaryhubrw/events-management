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
exports.QrCodeService = void 0;
const uuid_1 = require("uuid");
class QrCodeService {
    /**
     * Generate a QR code for a registration
     */
    static generateQrCode(registrationId, userId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Create a unique QR code string
                // In a real implementation, you might want to use a QR code library
                const qrData = {
                    registrationId,
                    userId,
                    eventId,
                    timestamp: new Date().toISOString(),
                    hash: (0, uuid_1.v4)()
                };
                // Convert to base64 or use a QR code generation library
                const qrString = Buffer.from(JSON.stringify(qrData)).toString('base64');
                return qrString;
            }
            catch (error) {
                console.error('Error generating QR code:', error);
                throw error;
            }
        });
    }
    /**
     * Validate a QR code
     */
    static validateQrCode(qrCode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Decode the QR code
                const decodedData = JSON.parse(Buffer.from(qrCode, 'base64').toString());
                // Validate the structure
                if (!decodedData.registrationId || !decodedData.userId || !decodedData.eventId) {
                    return { valid: false };
                }
                return { valid: true, data: decodedData };
            }
            catch (error) {
                console.error('Error validating QR code:', error);
                return { valid: false };
            }
        });
    }
    /**
     * Regenerate a QR code for an existing registration
     */
    static regenerateQrCode(registrationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // In a real implementation, you would fetch the registration details
                // For now, generate a new QR code with timestamp
                const qrData = {
                    registrationId,
                    regenerated: true,
                    timestamp: new Date().toISOString(),
                    hash: (0, uuid_1.v4)()
                };
                const qrString = Buffer.from(JSON.stringify(qrData)).toString('base64');
                return qrString;
            }
            catch (error) {
                console.error('Error regenerating QR code:', error);
                throw error;
            }
        });
    }
}
exports.QrCodeService = QrCodeService;
