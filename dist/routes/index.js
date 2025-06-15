"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/apiRoutes.ts
const express_1 = require("express");
const UserRoutes_1 = require("./UserRoutes");
const RoleRoutes_1 = __importDefault(require("./RoleRoutes"));
const OrganizationRoutes_1 = __importDefault(require("./OrganizationRoutes"));
const TicketTyeRoutes_1 = __importDefault(require("./TicketTyeRoutes")); // Ensure tickets is exported from TicketType
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
const ResourceRoutes_1 = __importDefault(require("./ResourceRoutes")); // Ensure resourceRoutes is exported from ResourceRoutes
const Venue_1 = require("./Venue");
const EventRoutes_1 = require("./EventRoutes");
const EventBookingRoutes_1 = __importDefault(require("./EventBookingRoutes"));
const CheckAbsenceRoutes_1 = __importDefault(require("./CheckAbsenceRoutes")); // Ensure checkAbsenceRoutes is exported from CheckAbsenceRoutes
const RegistrationRoutes_1 = __importDefault(require("./RegistrationRoutes")); // Ensure RegistrationRoutes is exported from RegistrationRoutes
const router = (0, express_1.Router)();
// Use versioned routes
router.use('/users', UserRoutes_1.userRoutes);
router.use('/roles', RoleRoutes_1.default);
router.use('/organizations', AuthMiddleware_1.verifyJWT, OrganizationRoutes_1.default); // This makes `/api/v1/organizations/*` available
router.use("/tickets", TicketTyeRoutes_1.default); // This makes `/api/v1/tickets-type/*` available
//resources
router.use('/resources', AuthMiddleware_1.verifyJWT, ResourceRoutes_1.default);
router.use('/venue', AuthMiddleware_1.verifyJWT, Venue_1.venueRoute, CheckAbsenceRoutes_1.default); // This makes `/api/v1/venue/*` available
router.use('/event', AuthMiddleware_1.verifyJWT, EventRoutes_1.eventRoute);
// Event Booking routes
router.use('/event-bookings', AuthMiddleware_1.verifyJWT, EventBookingRoutes_1.default); // This makes `/api/v1/event-bookings/*` available
//routes for registration
router.use('/registrations', AuthMiddleware_1.verifyJWT, RegistrationRoutes_1.default); // This makes `/api/v1/registrations/*` available
exports.default = router;
