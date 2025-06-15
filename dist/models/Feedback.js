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
exports.Feedback = void 0;
// src/entity/Feedback.ts
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
let Feedback = class Feedback {
};
exports.Feedback = Feedback;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4', { message: 'feedbackId must be a valid UUID' }),
    __metadata("design:type", String)
], Feedback.prototype, "feedbackId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'eventId is required' }),
    (0, class_validator_1.IsUUID)('4', { message: 'eventId must be a valid UUID' }),
    __metadata("design:type", String)
], Feedback.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'userId is required' }),
    (0, class_validator_1.IsUUID)('4', { message: 'userId must be a valid UUID' }),
    __metadata("design:type", String)
], Feedback.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'rating is required' }),
    (0, class_validator_1.IsInt)({ message: 'rating must be an integer' }),
    (0, class_validator_1.Min)(1, { message: 'rating must be at least $constraint1' }),
    (0, class_validator_1.Max)(5, { message: 'rating must be at most $constraint1' }),
    __metadata("design:type", Number)
], Feedback.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(0, 1000, {
        message: 'comments must be at most $constraint2 characters long',
    }),
    __metadata("design:type", String)
], Feedback.prototype, "comments", void 0);
exports.Feedback = Feedback = __decorate([
    (0, typeorm_1.Entity)('feedback')
], Feedback);
