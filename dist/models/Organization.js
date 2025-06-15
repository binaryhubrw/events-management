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
exports.Organization = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const User_1 = require("./User");
const VenueBooking_1 = require("./VenueBooking");
let Organization = class Organization {
};
exports.Organization = Organization;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], Organization.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(3, 100),
    __metadata("design:type", String)
], Organization.prototype, "organizationName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(0, 500),
    __metadata("design:type", String)
], Organization.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Organization.prototype, "contactEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], Organization.prototype, "contactPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(0, 200),
    __metadata("design:type", String)
], Organization.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(0, 50),
    __metadata("design:type", String)
], Organization.prototype, "organizationType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.organizations),
    __metadata("design:type", User_1.User)
], Organization.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => VenueBooking_1.EventBooking, (booking) => booking.organization),
    __metadata("design:type", Array)
], Organization.prototype, "bookings", void 0);
exports.Organization = Organization = __decorate([
    (0, typeorm_1.Entity)('organizations')
], Organization);
