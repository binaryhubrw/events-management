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
exports.Budget = void 0;
// src/entity/Budget.ts
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
let Budget = class Budget {
};
exports.Budget = Budget;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4', { message: 'budgetId must be a valid UUID' }),
    __metadata("design:type", String)
], Budget.prototype, "budgetId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'eventId is required' }),
    (0, class_validator_1.IsUUID)('4', { message: 'eventId must be a valid UUID' }),
    __metadata("design:type", String)
], Budget.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'expectedAmount is required' }),
    (0, class_validator_1.IsNumber)({}, { message: 'expectedAmount must be a number' }),
    __metadata("design:type", Number)
], Budget.prototype, "expectedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    (0, class_validator_1.IsNotEmpty)({ message: 'income is required' }),
    (0, class_validator_1.IsNumber)({}, { message: 'income must be a number' }),
    __metadata("design:type", Number)
], Budget.prototype, "income", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    (0, class_validator_1.IsNotEmpty)({ message: 'expenditure is required' }),
    (0, class_validator_1.IsNumber)({}, { message: 'expenditure must be a number' }),
    __metadata("design:type", Number)
], Budget.prototype, "expenditure", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(0, 1000, {
        message: 'notes must be at most $constraint2 characters long',
    }),
    __metadata("design:type", String)
], Budget.prototype, "notes", void 0);
exports.Budget = Budget = __decorate([
    (0, typeorm_1.Entity)('budgets')
], Budget);
