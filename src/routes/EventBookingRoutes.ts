import express from 'express';
import { VenueBookingController } from '../controller/VenueBookingController';
import { verifyJWT } from '../middlewares/AuthMiddleware';

const router = express.Router();

/**
 * Basic CRUD Operations
 */
// Create a new event booking
router.post('/create',VenueBookingController.createEventBooking);

// Get all event bookings
router.get('/all', VenueBookingController.getAllEventBookings);

/**
 * Filtering Operations
 */
// Get bookings by date range (must come before other GET routes with parameters)
router.get('/date-range', VenueBookingController.getBookingsByDateRange);

// Get bookings by event ID
router.get('/event/:eventId', VenueBookingController.getBookingsByEventId);

// Get bookings by venue ID
router.get('/venue/:venueId', VenueBookingController.getBookingsByVenueId);

// Get bookings by organizer ID
// routes/eventBookingRoutes.ts
router.get('/organizer', verifyJWT, VenueBookingController.getBookingsByOrganizerId);
// Get bookings by organization ID
router.get('/organization/:organizationId', VenueBookingController.getBookingsByOrganizationId);

// Get bookings by approval status
router.get('/status/:status', VenueBookingController.getBookingsByStatus);

// Get a specific event booking by ID (must come after other specific GET routes)
router.get('/:id', VenueBookingController.getEventBookingById);

// Update an event booking
router.put('/:id', VenueBookingController.updateEventBooking);

// Update only the status of an event booking
router.patch('/:id/status', VenueBookingController.updateEventBookingStatus);

// Delete an event booking
router.delete('/:id', VenueBookingController.deleteEventBooking);



/**
 * Error Handlers
 */
// Handle method not allowed
router.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

export default router;