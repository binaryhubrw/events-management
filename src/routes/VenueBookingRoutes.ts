import express from 'express';
import { VenueBookingController } from '../controller/VenueBookingController';
import { verifyJWT } from '../middlewares/AuthMiddleware';

const router = express.Router();

/**
 * Basic CRUD Operations
 */
// Create a new event booking
router.post('/create',VenueBookingController.createVenueBooking);

// Get all event bookings
router.get('/all', VenueBookingController.getAllVenueBookings);

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
// routes/VenueBookingRoutes.ts
router.get('/organizer', verifyJWT, VenueBookingController.getBookingsByOrganizerId);
// Get bookings by organization ID
router.get('/organization/:organizationId', VenueBookingController.getBookingsByOrganizationId);

// Get bookings by approval status
router.get('/status/:status', VenueBookingController.getBookingsByStatus);

// Get a specific event booking by ID (must come after other specific GET routes)
router.get('/:id', VenueBookingController.getVenueBookingById);

// Update an event booking
router.put('/:id', VenueBookingController.updateVenueBooking);

// Update only the status of an event booking
router.patch('/:id/status', VenueBookingController.updateVenueBookingStatus);

// Delete an event booking
router.delete('/:id', VenueBookingController.deleteVenueBooking);



/**
 * Error Handlers
 */
// Handle method not allowed
router.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

export default router;