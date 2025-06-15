"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = exports.EventType = void 0;
// src/entity/Event.ts
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const Venue_1 = require("./Venue");
const User_1 = require("./User");
const VenueBooking_1 = require("./VenueBooking");
const Registration_1 = require("./Registration");
var EventType;
(function (EventType) {
    EventType["PUBLIC"] = "public";
    EventType["PRIVATE"] = "private";
})(EventType || (exports.EventType = EventType = {}));
let Event = class Event {
};
exports.Event = Event;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    (0, class_validator_1.IsUUID)("4", { message: "eventId must be a valid UUID" }),
    __metadata("design:type", String)
], Event.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Event title is required" }),
    (0, class_validator_1.Length)(3, 100, {
        message: "Event title must be between $constraint1 and $constraint2 characters",
    }),
    __metadata("design:type", String)
], Event.prototype, "eventTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(0, 1000, {
        message: "Description must be at most $constraint2 characters long",
    }),
    __metadata("design:type", String)
], Event.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(0, 50, {
        message: "Event category must be at most $constraint2 characters long",
    }),
    __metadata("design:type", String)
], Event.prototype, "eventCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: EventType,
        default: EventType.PUBLIC,
    }),
    (0, class_validator_1.IsEnum)(EventType, {
        message: "Event type must be one of: public, private",
    }),
    __metadata("design:type", String)
], Event.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Organizer ID is required" }),
    (0, class_validator_1.IsUUID)("4", { message: "Organizer ID must be a valid UUID" }),
    __metadata("design:type", String)
], Event.prototype, "organizerId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Venue ID is required" }),
    (0, class_validator_1.IsUUID)("4", { message: "Venue ID must be a valid UUID" }),
    __metadata("design:type", String)
], Event.prototype, "venueId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Venue_1.Venue, (venue) => venue.events),
    (0, typeorm_1.JoinColumn)({ name: "venueId" }),
    __metadata("design:type", Venue_1.Venue)
], Event.prototype, "venue", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.eventsOrganizer),
    (0, typeorm_1.JoinColumn)({ name: "organizerId" }),
    __metadata("design:type", User_1.User)
], Event.prototype, "organizer", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => VenueBooking_1.EventBooking, (booking) => booking.event),
    __metadata("design:type", Array)
], Event.prototype, "bookings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Registration_1.Registration, registration => registration.event, { cascade: true }),
    __metadata("design:type", Array)
], Event.prototype, "registrations", void 0);
exports.Event = Event = __decorate([
    (0, typeorm_1.Entity)("events")
], Event);
