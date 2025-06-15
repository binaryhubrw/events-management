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
exports.Invoice = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const Payment_1 = require("./Payment");
let Invoice = class Invoice {
};
exports.Invoice = Invoice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4', { message: 'invoiceId must be a valid UUID' }),
    __metadata("design:type", String)
], Invoice.prototype, "invoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsUUID)('4', { message: 'eventId must be a valid UUID' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'eventId is required' }),
    __metadata("design:type", String)
], Invoice.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsUUID)('4', { message: 'userId must be a valid UUID' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'userId is required' }),
    __metadata("design:type", String)
], Invoice.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    (0, class_validator_1.IsDateString)({}, { message: 'invoiceDate must be a valid ISO date string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'invoiceDate is required' }),
    __metadata("design:type", String)
], Invoice.prototype, "invoiceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    (0, class_validator_1.IsDateString)({}, { message: 'dueDate must be a valid ISO date string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'dueDate is required' }),
    __metadata("design:type", String)
], Invoice.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    (0, class_validator_1.IsNumber)({}, { message: 'totalAmount must be a number' }),
    (0, class_validator_1.IsPositive)({ message: 'totalAmount must be a positive number' }),
    __metadata("design:type", Number)
], Invoice.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'status is required' }),
    (0, class_validator_1.Length)(3, 20, { message: 'status must be between $constraint1 and $constraint2 characters' }),
    __metadata("design:type", String)
], Invoice.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Payment_1.Payment, payment => payment.invoice),
    __metadata("design:type", Array)
], Invoice.prototype, "payments", void 0);
exports.Invoice = Invoice = __decorate([
    (0, typeorm_1.Entity)('invoices')
], Invoice);
