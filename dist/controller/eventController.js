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
exports.EventController = void 0;
const eventRepository_1 = require("../repositories/eventRepository");
class EventController {
    // Create Event
    static create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { description, eventCategory, eventTitle, eventType, venueId } = req.body;
            const organizerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            console.log("Organizer ID:", organizerId);
            if (!description || !eventCategory || !eventTitle || !eventType || !venueId) {
                res.status(400).json({ success: false, message: "All fields are required." });
                return;
            }
            try {
                const createEvent = eventRepository_1.EventRepository.create({
                    eventTitle,
                    eventType,
                    eventCategory,
                    description,
                    venueId,
                    organizerId,
                }); // Explicitly using EventInterface structure
                if (!createEvent.success) {
                    res.status(400).json({ success: false, message: createEvent.message });
                    return;
                }
                const saveEvent = yield eventRepository_1.EventRepository.save(createEvent.data);
                if (saveEvent.success) {
                    res.status(201).json({ success: true, message: "Event created successfully.", data: saveEvent.data });
                }
                else {
                    res.status(400).json({ success: false, message: saveEvent.message });
                }
            }
            catch (err) {
                res.status(500).json({ success: false, message: "Failed to save event." });
            }
        });
    }
    //get Event ById
    static getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ success: false, message: "Event id not found" });
                return;
            }
            try {
                const result = yield eventRepository_1.EventRepository.getById(id);
                if (result.success) {
                    res.status(200).json({ success: true, data: result.data });
                }
                else {
                    res.status(404).json({ success: true, message: result.message });
                }
            }
            catch (err) {
                res.status(500).json({ success: false, message: " failed to get event by id" });
            }
        });
    }
    static getByOrganizerId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const organizerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!organizerId) {
                res.status(400).json({ success: false, message: "Organizer Id is required" });
                return;
            }
            try {
                const result = yield eventRepository_1.EventRepository.getByOrganizerId(organizerId);
                if (result.success) {
                    res.status(200).json({ success: true, Data: result.data });
                }
                else {
                    res.status(404).json({ success: false, message: result.message });
                }
            }
            catch (err) {
                res.status(500).json({ success: false, message: "failed to get event by OrganizerId" });
            }
        });
    }
    static getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield eventRepository_1.EventRepository.getAll();
                if (result.success) {
                    res.status(200).json({ success: true, data: result.data });
                }
                else {
                    res.status(404).json({ success: false, message: result.message });
                }
            }
            catch (err) {
                res.status(500).json({ success: false, message: "failed to get all event" });
            }
        });
    }
    static update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id } = req.params;
            const organizerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { description, eventCategory, eventTitle, eventType, venueId } = req.body;
            if (!id) {
                res.status(400).json({ success: false, message: "Event ID is required." });
                return;
            }
            try {
                const updateEvent = yield eventRepository_1.EventRepository.update(id, {
                    description,
                    eventCategory,
                    eventTitle,
                    eventType,
                    venueId,
                    organizerId, // Corrected camelCase naming
                });
                if (updateEvent.success) {
                    res.status(200).json({ success: true, data: updateEvent.data });
                }
                else {
                    res.status(404).json({ success: false, message: updateEvent.message });
                }
            }
            catch (err) {
                res.status(500).json({ success: false, message: "Failed to update event." });
            }
        });
    }
    static delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ success: false, message: "event id is required" });
                return;
            }
            try {
                const deleteResult = yield eventRepository_1.EventRepository.delete(id);
                if (deleteResult.succcess) {
                    res.status(200).json({ success: true, message: "event deleted successfully" });
                    return;
                }
                else {
                    res.status(404).json({ success: false, message: deleteResult.message });
                }
            }
            catch (err) {
                res.status(500).json({ success: false, message: "failed to delete event" });
            }
        });
    }
}
exports.EventController = EventController;
