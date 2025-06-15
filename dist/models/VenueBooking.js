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
exports.EventBooking = exports.ApprovalStatus = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const Event_1 = require("./Event");
const Venue_1 = require("./Venue");
const Organization_1 = require("./Organization");
const User_1 = require("./User");
var ApprovalStatus;
(function (ApprovalStatus) {
    ApprovalStatus["PENDING"] = "pending";
    ApprovalStatus["APPROVED"] = "approved";
    ApprovalStatus["REJECTED"] = "rejected";
})(ApprovalStatus || (exports.ApprovalStatus = ApprovalStatus = {}));
let EventBooking = class EventBooking {
};
exports.EventBooking = EventBooking;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4', { message: 'bookingId must be a valid UUID' }),
    __metadata("design:type", String)
], EventBooking.prototype, "bookingId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.bookings, { nullable: false }),
    __metadata("design:type", User_1.User)
], EventBooking.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Event_1.Event, (event) => event.bookings, { nullable: false }),
    __metadata("design:type", Event_1.Event)
], EventBooking.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Venue_1.Venue, (venue) => venue.bookings, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "venueVenueId" }) // Ensure correct mapping
    ,
    __metadata("design:type", Venue_1.Venue)
], EventBooking.prototype, "venue", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Organization_1.Organization, (organization) => organization.bookings, { nullable: false }),
    __metadata("design:type", Organization_1.Organization)
], EventBooking.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'startDate is required' }),
    (0, class_validator_1.IsDateString)({}, { message: 'startDate must be a valid ISO 8601 timestamp' }),
    __metadata("design:type", Date)
], EventBooking.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'endDate is required' }),
    (0, class_validator_1.IsDateString)({}, { message: 'endDate must be a valid ISO 8601 timestamp' }),
    __metadata("design:type", Date)
], EventBooking.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'startTime is required' }),
    (0, class_validator_1.Length)(5, 8, { message: 'startTime must be in format HH:MM or HH:MM:SS' }),
    __metadata("design:type", String)
], EventBooking.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'endTime is required' }),
    (0, class_validator_1.Length)(5, 8, { message: 'endTime must be in format HH:MM or HH:MM:SS' }),
    __metadata("design:type", String)
], EventBooking.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING }),
    __metadata("design:type", String)
], EventBooking.prototype, "approvalStatus", void 0);
exports.EventBooking = EventBooking = __decorate([
    (0, typeorm_1.Entity)('venue_bookings')
], EventBooking);
