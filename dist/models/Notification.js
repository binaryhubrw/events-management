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
exports.Notification = void 0;
// src/entity/Notification.ts
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
let Notification = class Notification {
};
exports.Notification = Notification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4', { message: 'notificationId must be a valid UUID' }),
    __metadata("design:type", String)
], Notification.prototype, "notificationId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'userId is required' }),
    (0, class_validator_1.IsUUID)('4', { message: 'userId must be a valid UUID' }),
    __metadata("design:type", String)
], Notification.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'eventId must be a valid UUID' }),
    __metadata("design:type", Object)
], Notification.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'message is required' }),
    (0, class_validator_1.Length)(1, 1000, {
        message: 'message must be between $constraint1 and $constraint2 characters',
    }),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Notification.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    (0, class_validator_1.IsBoolean)({ message: 'isDesabled must be a boolean value' }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isDesabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    (0, class_validator_1.IsBoolean)({ message: 'isRead must be a boolean value' }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isRead", void 0);
exports.Notification = Notification = __decorate([
    (0, typeorm_1.Entity)('notifications')
], Notification);
