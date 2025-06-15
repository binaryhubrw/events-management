"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VenueBookingController_1 = require("../controller/VenueBookingController");
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
const router = express_1.default.Router();
/**
 * Basic CRUD Operations
 */
// Create a new event booking
router.post('/create', VenueBookingController_1.VenueBookingController.createEventBooking);
// Get all event bookings
router.get('/all', VenueBookingController_1.VenueBookingController.getAllEventBookings);
/**
 * Filtering Operations
 */
// Get bookings by date range (must come before other GET routes with parameters)
router.get('/date-range', VenueBookingController_1.VenueBookingController.getBookingsByDateRange);
// Get bookings by event ID
router.get('/event/:eventId', VenueBookingController_1.VenueBookingController.getBookingsByEventId);
// Get bookings by venue ID
router.get('/venue/:venueId', VenueBookingController_1.VenueBookingController.getBookingsByVenueId);
// Get bookings by organizer ID
// routes/eventBookingRoutes.ts
router.get('/organizer', AuthMiddleware_1.verifyJWT, VenueBookingController_1.VenueBookingController.getBookingsByOrganizerId);
// Get bookings by organization ID
router.get('/organization/:organizationId', VenueBookingController_1.VenueBookingController.getBookingsByOrganizationId);
// Get bookings by approval status
router.get('/status/:status', VenueBookingController_1.VenueBookingController.getBookingsByStatus);
// Get a specific event booking by ID (must come after other specific GET routes)
router.get('/:id', VenueBookingController_1.VenueBookingController.getEventBookingById);
// Update an event booking
router.put('/:id', VenueBookingController_1.VenueBookingController.updateEventBooking);
// Update only the status of an event booking
router.patch('/:id/status', VenueBookingController_1.VenueBookingController.updateEventBookingStatus);
// Delete an event booking
router.delete('/:id', VenueBookingController_1.VenueBookingController.deleteEventBooking);
/**
 * Error Handlers
 */
// Handle method not allowed
router.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});
exports.default = router;
