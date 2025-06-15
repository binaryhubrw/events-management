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
exports.VenueController = void 0;
const venueRepository_1 = require("../repositories/venueRepository");
class VenueController {
    // Create Venue
    static create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { venueName, location, capacity } = req.body;
            const managerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!venueName || !location || !capacity) {
                res.status(400).json({ success: false, message: "All fields are required." });
                return;
            }
            try {
                const createVenue = venueRepository_1.VenueRepository.create({
                    venueName,
                    location,
                    capacity,
                    managerId,
                });
                if (!createVenue.success) {
                    res.status(400).json({ success: false, message: createVenue.message });
                    return;
                }
                const saveVenue = yield venueRepository_1.VenueRepository.save(createVenue.data);
                if (saveVenue.success) {
                    res.status(201).json({ success: true, message: "Venue created successfully", data: saveVenue.data });
                }
                else {
                    res.status(400).json({ success: false, message: saveVenue.message });
                }
            }
            catch (err) {
                res.status(500).json({ success: false, message: "Failed to create venue." });
            }
        });
    }
    // Get Venue by ID
    static getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ success: false, message: "Venue ID is required." });
                return;
            }
            try {
                const result = yield venueRepository_1.VenueRepository.getById(id);
                if (result.success) {
                    res.status(200).json({ success: true, data: result.data });
                }
                else {
                    res.status(404).json({ success: false, message: result.message });
                }
            }
            catch (err) {
                res.status(500).json({ success: false, message: "Failed to fetch venue." });
            }
        });
    }
    // Get Venue by Manager ID
    static getByManagerId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const managerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!managerId) {
                res.status(400).json({ success: false, message: "Manager ID is required." });
                return;
            }
            try {
                const result = yield venueRepository_1.VenueRepository.getByManagerId(managerId);
                if (result.success) {
                    res.status(200).json({ success: true, data: result.data });
                }
                else {
                    res.status(404).json({ success: false, message: result.message });
                }
            }
            catch (err) {
                res.status(500).json({ success: false, message: "Failed to fetch venue by manager ID." });
            }
        });
    }
    // Get All Venues
    static getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield venueRepository_1.VenueRepository.getAll();
                if (result.success) {
                    res.status(200).json({ success: true, data: result.data });
                }
                else {
                    res.status(500).json({ success: false, message: result.message });
                }
            }
            catch (err) {
                res.status(500).json({ success: false, message: "Failed to fetch venues." });
            }
        });
    }
    // Update Venue
    static update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id } = req.params;
            const managerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { location, capacity, venueName, isAvailable, isBooked } = req.body;
            if (!id) {
                res.status(400).json({ success: false, message: "Venue ID is required." });
                return;
            }
            try {
                const updateResult = yield venueRepository_1.VenueRepository.update(id, {
                    location,
                    capacity,
                    venueName,
                    isAvailable,
                    isBooked,
                    managerId,
                });
                if (updateResult.success) {
                    res.status(200).json({ success: true, message: "Venue updated successfully", data: updateResult.data });
                }
                else {
                    res.status(404).json({ success: false, message: updateResult.message });
                }
            }
            catch (err) {
                res.status(500).json({ success: false, message: "Failed to update venue." });
            }
        });
    }
    static updateVenueManager(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params; // venueId
            // Extract managerId from request body
            const { managerId } = req.body;
            // Venue ID validation
            if (!id) {
                res.status(400).json({ success: false, message: 'Venue ID is required' });
                return;
            }
            if (!managerId) {
                res.status(400).json({ success: false, message: 'managerId is required in body' });
            }
            try {
                // Call repository method to update venue manager
                const result = yield venueRepository_1.VenueRepository.updateVenueManager(id, managerId);
                // Handle success or failure response
                if (result.success) {
                    res.status(200).json({
                        success: true,
                        message: 'Venue manager updated successfully',
                        data: result.data,
                    });
                }
                else {
                    res.status(404).json({ success: false, message: result.message });
                }
            }
            catch (err) {
                res.status(500).json({ success: false, message: 'Failed to update venue manager' });
            }
        });
    }
    //delete venue
    static delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ success: false, message: "venue Id is required" });
            }
            try {
                const deleteResult = yield venueRepository_1.VenueRepository.delete(id);
                if (deleteResult.success) {
                    res.status(200).json({ success: true, message: "venue deleted successfuly" });
                }
                else {
                    res.status(404).json({ success: false, message: deleteResult.message });
                }
            }
            catch (err) {
                res.status(500).json({ succcess: false, message: "failed to delete venue" });
            }
        });
    }
}
exports.VenueController = VenueController;
