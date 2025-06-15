"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VenueRepository = void 0;
const Database_1 = require("../config/Database");
const User_1 = require("../models/User");
const Venue_1 = require("../models/Venue");
class VenueRepository {
    // Create venue
    static create(data) {
        var _a, _b, _c, _d, _e, _f;
        if (!data.capacity || !data.location || !data.venueName) {
            return { success: false, message: "All fields are required" };
        }
        const venue = new Venue_1.Venue();
        venue.venueName = (_a = data.venueName) !== null && _a !== void 0 ? _a : "";
        venue.isBooked = (_b = data.isBooked) !== null && _b !== void 0 ? _b : false;
        venue.capacity = (_c = data.capacity) !== null && _c !== void 0 ? _c : 0;
        venue.isAvailable = (_d = data.isAvailable) !== null && _d !== void 0 ? _d : true;
        venue.location = (_e = data.location) !== null && _e !== void 0 ? _e : "";
        venue.managerId = (_f = data.managerId) !== null && _f !== void 0 ? _f : "";
        return { success: true, data: venue };
    }
    // Save venue
    static save(venue) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!venue.capacity || !venue.venueName || !venue.location) {
                return { success: false, message: "All fields are required" };
            }
            try {
                // Check if venue already exists
                const existingVenue = yield Database_1.AppDataSource.getRepository(Venue_1.Venue).findOne({
                    where: [{ venueName: venue.venueName, location: venue.location }],
                });
                if (existingVenue) {
                    return { success: false, message: "Venue location and name already exist", data: existingVenue };
                }
                // Save the new venue
                const savedVenue = yield Database_1.AppDataSource.getRepository(Venue_1.Venue).save(venue);
                return { success: true, data: savedVenue, message: "Venue saved successfully" };
            }
            catch (error) {
                console.error("Error saving venue:", error);
                return { success: false, message: "Failed to save venue" };
            }
        });
    }
    // Get venue by ID
    static getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id) {
                return { success: false, message: "Venue ID is required" };
            }
            try {
                const venue = yield Database_1.AppDataSource.getRepository(Venue_1.Venue).findOne({
                    where: { venueId: id },
                    relations: ["manager", "manager.role"],
                });
                if (!venue) {
                    return { success: false, message: "Venue not found" };
                }
                return { success: true, data: venue };
            }
            catch (error) {
                return { success: false, message: "Failed to fetch venue by ID" };
            }
        });
    }
    // Get all venues
    static getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const venues = yield Database_1.AppDataSource.getRepository(Venue_1.Venue).find({
                    relations: ["manager", "manager.role"],
                });
                return { success: true, data: venues };
            }
            catch (error) {
                return { success: false, message: "Failed to fetch all venues" };
            }
        });
    }
    // Get venue by manager ID
    static getByManagerId(managerId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!managerId) {
                return { success: false, message: "Manager ID is required" };
            }
            try {
                const venues = yield Database_1.AppDataSource.getRepository(Venue_1.Venue).find({
                    where: { manager: { userId: managerId } }, // Ensure correct relation mapping
                    relations: ["manager", "manager.role"],
                });
                if (venues.length === 0) {
                    return { success: false, message: "No venues found for this manager" };
                }
                return { success: true, data: venues };
            }
            catch (error) {
                return { success: false, message: "Failed to fetch venues by manager ID" };
            }
        });
    }
    // Update venue
    static update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            if (!id) {
                return { success: false, message: "Venue ID is required" };
            }
            try {
                const repo = Database_1.AppDataSource.getRepository(Venue_1.Venue);
                const venue = yield repo.findOne({ where: { venueId: id } });
                if (!venue) {
                    return { success: false, message: "Venue not found" };
                }
                repo.merge(venue, {
                    venueName: (_a = data.venueName) !== null && _a !== void 0 ? _a : venue.venueName,
                    location: (_b = data.location) !== null && _b !== void 0 ? _b : venue.location,
                    capacity: (_c = data.capacity) !== null && _c !== void 0 ? _c : venue.capacity,
                    isAvailable: (_d = data.isAvailable) !== null && _d !== void 0 ? _d : venue.isAvailable,
                    isBooked: (_e = data.isBooked) !== null && _e !== void 0 ? _e : venue.isBooked,
                });
                const updatedVenue = yield repo.save(venue);
                return { success: true, data: updatedVenue };
            }
            catch (error) {
                return { success: false, message: "Failed to update venue" };
            }
        });
    }
    // Update venue manager
    static updateVenueManager(venueId, managerId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!venueId || !managerId) {
                return { success: false, message: "Both venueId and managerId are required" };
            }
            try {
                const venueRepo = Database_1.AppDataSource.getRepository(Venue_1.Venue);
                const userRepo = Database_1.AppDataSource.getRepository(User_1.User);
                const venue = yield venueRepo.findOne({ where: { venueId }, relations: ["manager"] });
                if (!venue) {
                    return { success: false, message: "Venue not found" };
                }
                const manager = yield userRepo.findOne({ where: { userId: managerId }, relations: ["role"] });
                if (!manager) {
                    return { success: false, message: "Manager user not found" };
                }
                if (manager.role.roleName.toLowerCase() !== "venue_manager") {
                    return { success: false, message: "User is not a venue manager" };
                }
                // Assign new manager
                venue.manager = manager;
                venue.managerId = manager.userId;
                const updatedVenue = yield venueRepo.save(venue);
                return { success: true, data: updatedVenue };
            }
            catch (error) {
                return { success: false, message: "Failed to update venue manager" };
            }
        });
    }
    // Delete venue
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id) {
                return { success: false, message: "Venue ID is required" };
            }
            try {
                const result = yield Database_1.AppDataSource.getRepository(Venue_1.Venue).delete(id);
                if (result.affected === 0) {
                    return { success: false, message: "Venue not found or already deleted" };
                }
                return { success: true, message: "Venue deleted successfully" };
            }
            catch (error) {
                return { success: false, message: "Failed to delete venue" };
            }
        });
    }
}
exports.VenueRepository = VenueRepository;
