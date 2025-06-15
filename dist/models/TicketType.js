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
exports.TicketType = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const Registration_1 = require("./Registration");
let TicketType = class TicketType {
};
exports.TicketType = TicketType;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4', { message: 'ticketTypeId must be a valid UUID' }),
    __metadata("design:type", String)
], TicketType.prototype, "ticketTypeId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'ticketName is required' }),
    (0, class_validator_1.Length)(3, 50, { message: 'ticketName must be between $constraint1 and $constraint2 characters' }),
    __metadata("design:type", String)
], TicketType.prototype, "ticketName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    (0, class_validator_1.IsNumber)({}, { message: 'price must be a valid number' }),
    (0, class_validator_1.IsPositive)({ message: 'price must be a positive number' }),
    __metadata("design:type", Number)
], TicketType.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(0, 500, { message: 'description must be at most $constraint2 characters' }),
    __metadata("design:type", String)
], TicketType.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deletedAt', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TicketType.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Registration_1.Registration, (registration) => registration.ticketTypes) // <--- THIS LINE
    ,
    __metadata("design:type", Array)
], TicketType.prototype, "registrations", void 0);
exports.TicketType = TicketType = __decorate([
    (0, typeorm_1.Entity)('ticket_types')
], TicketType);
