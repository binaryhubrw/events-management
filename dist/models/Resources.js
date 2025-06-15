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
exports.Resource = void 0;
// src/entity/Resource.ts
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const EventResource_1 = require("./EventResource");
let Resource = class Resource {
};
exports.Resource = Resource;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4', { message: 'resourceId must be a valid UUID' }),
    __metadata("design:type", String)
], Resource.prototype, "resourceId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'resourceName is required' }),
    (0, class_validator_1.Length)(3, 100, {
        message: 'resourceName must be between $constraint1 and $constraint2 characters',
    }),
    __metadata("design:type", String)
], Resource.prototype, "resourceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(0, 500, {
        message: 'description must be at most $constraint2 characters',
    }),
    __metadata("design:type", String)
], Resource.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    (0, class_validator_1.IsNumber)({}, { message: 'costPerUnit must be a number' }),
    (0, class_validator_1.IsPositive)({ message: 'costPerUnit must be a positive value' }),
    __metadata("design:type", Number)
], Resource.prototype, "costPerUnit", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => EventResource_1.EventResource, (eventResource) => eventResource.resource),
    __metadata("design:type", Array)
], Resource.prototype, "eventResources", void 0);
exports.Resource = Resource = __decorate([
    (0, typeorm_1.Entity)('resources')
], Resource);
