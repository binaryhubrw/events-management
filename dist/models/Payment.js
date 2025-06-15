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
exports.Payment = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const Invoice_1 = require("./Invoice");
let Payment = class Payment {
};
exports.Payment = Payment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4', { message: 'paymentId must be a valid UUID' }),
    __metadata("design:type", String)
], Payment.prototype, "paymentId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsUUID)('4', { message: 'invoiceId must be a valid UUID' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'invoiceId is required' }),
    __metadata("design:type", String)
], Payment.prototype, "invoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    (0, class_validator_1.IsDateString)({}, { message: 'paymentDate must be a valid ISO date string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'paymentDate is required' }),
    __metadata("design:type", String)
], Payment.prototype, "paymentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    (0, class_validator_1.IsNumber)({}, { message: 'paidAmount must be a number' }),
    (0, class_validator_1.IsPositive)({ message: 'paidAmount must be a positive number' }),
    __metadata("design:type", Number)
], Payment.prototype, "paidAmount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'paymentMethod is required' }),
    (0, class_validator_1.Length)(3, 50, { message: 'paymentMethod must be between $constraint1 and $constraint2 characters' }),
    __metadata("design:type", String)
], Payment.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'pending' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'paymentStatus is required' }),
    (0, class_validator_1.Length)(3, 20, { message: 'paymentStatus must be between $constraint1 and $constraint2 characters' }),
    __metadata("design:type", String)
], Payment.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(0, 500, { message: 'description must be at most $constraint2 characters' }),
    __metadata("design:type", String)
], Payment.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Invoice_1.Invoice, invoice => invoice.payments),
    (0, typeorm_1.JoinColumn)({ name: 'invoiceId' }),
    __metadata("design:type", Invoice_1.Invoice)
], Payment.prototype, "invoice", void 0);
exports.Payment = Payment = __decorate([
    (0, typeorm_1.Entity)('payments')
], Payment);
