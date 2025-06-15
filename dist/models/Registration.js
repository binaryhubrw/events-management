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
exports.Registration = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const TicketType_1 = require("./TicketType");
const Event_1 = require("./Event");
const User_1 = require("./User");
const Venue_1 = require("./Venue");
let Registration = class Registration {
};
exports.Registration = Registration;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4', { message: 'registrationId must be a valid UUID' }),
    __metadata("design:type", String)
], Registration.prototype, "registrationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Event_1.Event, event => event.registrations, { nullable: false, eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'eventId' }),
    __metadata("design:type", Event_1.Event)
], Registration.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.registrations, { nullable: false, eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", User_1.User)
], Registration.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.registrations, { nullable: false, eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'buyerId' }),
    __metadata("design:type", User_1.User)
], Registration.prototype, "buyer", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: false, default: [] }),
    (0, class_validator_1.IsArray)({ message: 'boughtForIds must be an array' }),
    (0, class_validator_1.ArrayMinSize)(0, { message: 'boughtForIds must contain at least 0 elements' }),
    (0, class_validator_1.ValidateIf)(o => o.boughtForIds && o.boughtForIds.length > 0),
    (0, class_validator_1.IsUUID)('4', { each: true, message: 'Each boughtForId must be a valid UUID' }),
    __metadata("design:type", Array)
], Registration.prototype, "boughtForIds", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => TicketType_1.TicketType, ticket => ticket.registrations, { eager: true }),
    (0, typeorm_1.JoinTable)({ name: 'registration_tickets' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'At least one ticketTypeId is required' }),
    __metadata("design:type", Array)
], Registration.prototype, "ticketTypes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Venue_1.Venue, venue => venue.registrations, { nullable: false, eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'venueId' }),
    __metadata("design:type", Venue_1.Venue)
], Registration.prototype, "venue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    (0, class_validator_1.IsNumber)({}, { message: 'noOfTickets must be a number' }),
    (0, class_validator_1.IsPositive)({ message: 'noOfTickets must be a positive number' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'noOfTickets is required' }),
    __metadata("design:type", Number)
], Registration.prototype, "noOfTickets", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    (0, class_validator_1.IsDateString)({}, { message: 'registrationDate must be a valid ISO date string', always: true }),
    __metadata("design:type", String)
], Registration.prototype, "registrationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'pending' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'paymentStatus is required' }),
    (0, class_validator_1.Length)(3, 50, { message: 'paymentStatus must be between 3 and 50 characters', always: true }),
    __metadata("design:type", String)
], Registration.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'qrCode must be a valid UUID if provided', always: true }),
    __metadata("design:type", String)
], Registration.prototype, "qrCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'checkDate must be a valid ISO date string if provided', always: true }),
    __metadata("design:type", String)
], Registration.prototype, "checkDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    (0, class_validator_1.IsBoolean)({ message: 'attended must be a boolean value' }),
    __metadata("design:type", Boolean)
], Registration.prototype, "attended", void 0);
exports.Registration = Registration = __decorate([
    (0, typeorm_1.Entity)('registrations')
], Registration);
