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
exports.EventResource = void 0;
// src/entity/EventResource.ts
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const Resources_1 = require("./Resources");
let EventResource = class EventResource {
};
exports.EventResource = EventResource;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4', { message: 'eventResourceId must be a valid UUID' }),
    __metadata("design:type", String)
], EventResource.prototype, "eventResourceId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'eventId is required' }),
    (0, class_validator_1.IsUUID)('4', { message: 'eventId must be a valid UUID' }),
    __metadata("design:type", String)
], EventResource.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'resourceId is required' }),
    (0, class_validator_1.IsUUID)('4', { message: 'resourceId must be a valid UUID' }),
    __metadata("design:type", String)
], EventResource.prototype, "resourceId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'quantity is required' }),
    (0, class_validator_1.IsInt)({ message: 'quantity must be an integer' }),
    (0, class_validator_1.IsPositive)({ message: 'quantity must be a positive integer' }),
    (0, class_validator_1.Min)(1, { message: 'quantity must be at least $constraint1' }),
    __metadata("design:type", Number)
], EventResource.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'amountSpent must be a number' }),
    (0, class_validator_1.IsPositive)({ message: 'amountSpent must be a positive number' }),
    __metadata("design:type", Object)
], EventResource.prototype, "amountSpent", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Resources_1.Resource, (resource) => resource.eventResources),
    __metadata("design:type", Resources_1.Resource)
], EventResource.prototype, "resource", void 0);
exports.EventResource = EventResource = __decorate([
    (0, typeorm_1.Entity)('event_resources')
], EventResource);
