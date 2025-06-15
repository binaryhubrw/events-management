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
exports.Venue = void 0;
// src/entity/Venue.ts
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
// src/entity/Venue.ts
const typeorm_2 = require("typeorm");
const class_validator_2 = require("class-validator");
const User_1 = require("./User");
const VenueBooking_1 = require("./VenueBooking");
const Event_1 = require("./Event");
const Registration_1 = require("./Registration");
let Venue = class Venue {
};
exports.Venue = Venue;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4', { message: 'venueId must be a valid UUID' }),
    __metadata("design:type", String)
], Venue.prototype, "venueId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'venueName is required' }),
    (0, class_validator_1.Length)(3, 100, {
        message: 'venueName must be between $constraint1 and $constraint2 characters',
    }),
    __metadata("design:type", String)
], Venue.prototype, "venueName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNumber)({}, { message: 'capacity must be a number' }),
    (0, class_validator_1.IsPositive)({ message: 'capacity must be a positive number' }),
    __metadata("design:type", Number)
], Venue.prototype, "capacity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'location is required' }),
    (0, class_validator_1.Length)(3, 200, {
        message: 'location must be between $constraint1 and $constraint2 characters',
    }),
    __metadata("design:type", String)
], Venue.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsUUID)('4', { message: 'managerId must be a valid UUID' }),
    __metadata("design:type", String)
], Venue.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    (0, class_validator_2.IsBoolean)({ message: 'isAvailable must be a boolean' }),
    __metadata("design:type", Boolean)
], Venue.prototype, "isAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    (0, class_validator_2.IsBoolean)({ message: 'isBooked must be a boolean' }),
    __metadata("design:type", Boolean)
], Venue.prototype, "isBooked", void 0);
__decorate([
    (0, typeorm_2.ManyToOne)(() => User_1.User, user => user.managedVenues),
    (0, typeorm_2.JoinColumn)({ name: 'managerId' }),
    __metadata("design:type", User_1.User)
], Venue.prototype, "manager", void 0);
__decorate([
    (0, typeorm_2.OneToMany)(() => VenueBooking_1.EventBooking, eventBooking => eventBooking.venue),
    __metadata("design:type", Array)
], Venue.prototype, "bookings", void 0);
__decorate([
    (0, typeorm_2.OneToMany)(() => Event_1.Event, event => event.venueId),
    __metadata("design:type", Array)
], Venue.prototype, "events", void 0);
__decorate([
    (0, typeorm_2.OneToMany)(() => Registration_1.Registration, registration => registration.venue),
    __metadata("design:type", Array)
], Venue.prototype, "registrations", void 0);
exports.Venue = Venue = __decorate([
    (0, typeorm_1.Entity)('venues')
], Venue);
