"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const RegistrationController_1 = require("../controller/RegistrationController");
const router = express_1.default.Router();
const registrationController = new RegistrationController_1.RegistrationController();
// Core Registration Management
router.post('/', RegistrationController_1.RegistrationController.createRegistration);
router.get('/', RegistrationController_1.RegistrationController.getAllRegistrations);
router.get('/:id', RegistrationController_1.RegistrationController.getRegistrationById);
router.put('/:id', RegistrationController_1.RegistrationController.updateRegistration);
router.delete('/:id', RegistrationController_1.RegistrationController.deleteRegistration);
// Event-Specific Registrations
router.get('/events/:eventId/registrations', RegistrationController_1.RegistrationController.getEventRegistrations);
router.post('/events/:eventId/register', RegistrationController_1.RegistrationController.registerForEvent);
router.get('/events/:eventId/registrations/stats', RegistrationController_1.RegistrationController.getEventRegistrationStats);
// User-Specific Registrations
router.get('/users/:userId/registrations', RegistrationController_1.RegistrationController.getUserRegistrations);
router.get('/users/:userId/registrations/upcoming', RegistrationController_1.RegistrationController.getUserUpcomingRegistrations);
router.get('/users/:userId/registrations/history', RegistrationController_1.RegistrationController.getUserRegistrationHistory);
// QR Code Management
router.get('/:id/qrcode', RegistrationController_1.RegistrationController.getRegistrationQrCode);
router.post('/:id/qrcode/regenerate', RegistrationController_1.RegistrationController.regenerateQrCode);
router.get('/qrcode/:qrCode', RegistrationController_1.RegistrationController.validateQrCode);
// Attendance Management
router.post('/:id/checkin', RegistrationController_1.RegistrationController.checkInAttendee);
router.post('/checkin/qr', RegistrationController_1.RegistrationController.checkInViaQrCode);
router.get('/:id/attendance', RegistrationController_1.RegistrationController.getAttendanceStatus);
router.put('/:id/attendance', RegistrationController_1.RegistrationController.updateAttendanceStatus);
router.get('/events/:eventId/attendance', RegistrationController_1.RegistrationController.getEventAttendanceReport);
// Payment Management
router.get('/:id/payment', RegistrationController_1.RegistrationController.getPaymentStatus);
router.post('/:id/payment', RegistrationController_1.RegistrationController.processPayment);
router.put('/:id/payment', RegistrationController_1.RegistrationController.updatePaymentStatus);
router.post('/:id/payment/refund', RegistrationController_1.RegistrationController.processRefund);
// Ticket Management
router.get('/:id/ticket', RegistrationController_1.RegistrationController.getTicketDetails);
router.post('/:id/ticket/transfer', RegistrationController_1.RegistrationController.transferTicket);
router.post('/:id/ticket/resend', RegistrationController_1.RegistrationController.resendTicket);
router.get('/:id/ticket/download', RegistrationController_1.RegistrationController.downloadTicket);
// Bulk Operations
router.post('/bulk', RegistrationController_1.RegistrationController.bulkCreateRegistrations);
router.put('/bulk/checkin', RegistrationController_1.RegistrationController.bulkCheckIn);
router.get('/export/:eventId', RegistrationController_1.RegistrationController.exportRegistrations);
// Administrative Routes
router.get('/pending', RegistrationController_1.RegistrationController.getPendingRegistrations);
router.put('/:id/approve', RegistrationController_1.RegistrationController.approveRegistration);
router.put('/:id/reject', RegistrationController_1.RegistrationController.rejectRegistration);
router.get('/reports', RegistrationController_1.RegistrationController.generateRegistrationReports);
// Venue-Specific Routes
router.get('/venues/:venueId/registrations', RegistrationController_1.RegistrationController.getVenueRegistrations);
router.get('/venues/:venueId/capacity', RegistrationController_1.RegistrationController.getVenueCapacityInfo);
exports.default = router;
