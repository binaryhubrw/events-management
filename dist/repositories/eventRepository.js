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
exports.EventRepository = void 0;
const Database_1 = require("../config/Database");
const Event_1 = require("../models/Event");
class EventRepository {
    static createBooking(arg0) {
        throw new Error('Method not implemented.');
    }
    static createEvent(eventData) {
        throw new Error("Method not implemented.");
    }
    //create event
    static create(data) {
        if (!data.description || !data.eventCategory || !data.eventTitle || !data.eventType || !data.venueId || !data.organizerId) {
            return { success: false, message: "all Field are required" };
        }
        // Map EventType string to enum
        const eventTypeMap = {
            public: Event_1.EventType.PUBLIC,
            private: Event_1.EventType.PRIVATE,
        };
        const mappedEventType = eventTypeMap[data.eventType];
        if (!mappedEventType) {
            return { success: false, message: "Invalid event type" };
        }
        // Create and populate the event
        const event = new Event_1.Event();
        event.description = data.description;
        event.eventCategory = data.eventCategory;
        event.eventTitle = data.eventTitle;
        event.eventType = mappedEventType;
        event.venueId = data.venueId;
        event.organizerId = data.organizerId;
        return { success: true, data: event };
    }
    //save event
    static save(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!event.description || !event.eventCategory || !event.eventTitle || !event.eventType || !event.venueId || !event.organizerId) {
                return { success: false, message: "all Field are required" };
            }
            try {
                //save event
                const savedEvent = yield Database_1.AppDataSource.getRepository(Event_1.Event).save(event);
                return { success: true, data: savedEvent, message: "Eventsaved successfully" };
            }
            catch (error) {
                console.error("Error saving event:", error);
                return { success: false, message: "failed to  save this event" };
            }
        });
    }
    // get event by Id
    static getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id) {
                return { success: false, message: "Event Id is required" };
            }
            try {
                const event = yield Database_1.AppDataSource.getRepository(Event_1.Event).findOne({ where: { eventId: id },
                    relations: ['organizer', 'organizer.role', 'venue'] });
                if (!event) {
                    return { success: false, message: "event not found" };
                }
                return { success: true, data: event };
            }
            catch (error) {
                return { success: false, message: "failed to get event by Id" };
            }
        });
    }
    //get event by organizerId
    static getByOrganizerId(organizerId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!organizerId) {
                return { success: false, message: " organizer id is required" };
            }
            try {
                const events = yield Database_1.AppDataSource.getRepository(Event_1.Event).find({ where: { organizer: {
                            userId: organizerId
                        }, }, relations: ['organizer', 'organizer.role', 'venue'], });
                if (events.length === 0) {
                    return { success: false, message: "no event found for this organizer" };
                }
                return { success: true, data: events };
            }
            catch (error) {
                return { success: false, message: "failed to fetch event by organizerId" };
            }
        });
    }
    // get all event
    static getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const event = yield Database_1.AppDataSource.getRepository(Event_1.Event).find({
                    relations: ['organizer', 'organizer.role', 'venue']
                });
                return { success: true, data: event };
            }
            catch (error) {
                return { success: false, message: "failed to get all event" };
            }
        });
    }
    //update event
    static update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            if (!id) {
                return { success: false, message: "event id is required" };
            }
            try {
                const repo = Database_1.AppDataSource.getRepository(Event_1.Event);
                const event = yield repo.findOne({ where: { eventId: id } });
                if (!event) {
                    return { success: false, message: "event not found" };
                }
                let updatedEventType = event.eventType;
                if (data.eventType && (data.eventType === "public" || data.eventType === "private")) {
                    updatedEventType = data.eventType;
                }
                repo.merge(event, {
                    description: (_a = data.description) !== null && _a !== void 0 ? _a : event.description,
                    eventTitle: (_b = data.eventTitle) !== null && _b !== void 0 ? _b : event.eventTitle,
                    eventCategory: (_c = data.eventCategory) !== null && _c !== void 0 ? _c : event.eventCategory,
                    venueId: (_d = data.venueId) !== null && _d !== void 0 ? _d : event.venueId,
                    organizerId: (_e = data.organizerId) !== null && _e !== void 0 ? _e : event.organizerId,
                    eventType: updatedEventType,
                });
                const updateEvent = yield repo.save(event);
                return { success: true, data: updateEvent };
            }
            catch (error) {
                return { success: false, message: "failed to update event" };
            }
        });
    }
    //update event orginizer
    //delete event
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id) {
                return { succcess: false, message: " Event Id is required" };
            }
            try {
                const result = yield Database_1.AppDataSource.getRepository(Event_1.Event).delete(id);
                if (result.affected === 0) {
                    return { succcess: false, message: "event not found ar alredy deleted" };
                }
                return { succcess: true, message: "venue deleted successfully" };
            }
            catch (error) {
                return { succcess: false, message: "failed to delete event" };
            }
        });
    }
}
exports.EventRepository = EventRepository;
