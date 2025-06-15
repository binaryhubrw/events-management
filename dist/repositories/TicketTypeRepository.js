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
exports.TicketTypeRepository = void 0;
const Database_1 = require("../config/Database");
const TicketType_1 = require("../models/TicketType");
class TicketTypeRepository {
    constructor() {
        this.repository = Database_1.AppDataSource.getRepository(TicketType_1.TicketType);
    }
    create(ticketType) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ticketType.ticketName) {
                return { success: false, message: 'Ticket name is required.' };
            }
            if (ticketType.price === undefined || ticketType.price === null) {
                return { success: false, message: 'Ticket price is required.' };
            }
            if (typeof ticketType.price !== 'number' || ticketType.price <= 0) {
                return { success: false, message: 'Ticket price must be a positive number.' };
            }
            try {
                // Check if ticket type already exists
                const existingTicketType = yield this.repository.findOneBy({ ticketName: ticketType.ticketName });
                if (existingTicketType) {
                    return { success: false, message: 'Ticket type already exists.' };
                }
                const newTicketType = this.repository.create(ticketType);
                const saved = yield this.repository.save(newTicketType);
                return { success: true, message: 'Ticket type created successfully.', data: saved };
            }
            catch (error) {
                return { success: false, message: error instanceof Error ? error.message : 'Unknown error during ticket creation.' };
            }
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tickets = yield this.repository.find();
                return { success: true, message: 'Ticket types fetched successfully.', data: tickets };
            }
            catch (error) {
                return { success: false, message: 'Failed to fetch ticket types.', data: [] };
            }
        });
    }
    findById(ticketTypeId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ticket = yield this.repository.findOne({ where: { ticketTypeId } });
                if (!ticket) {
                    return { success: false, message: 'Ticket type not found.' };
                }
                return { success: true, message: 'Ticket type found.', data: ticket };
            }
            catch (error) {
                return { success: false, message: 'Failed to find ticket type.' };
            }
        });
    }
    update(ticketTypeId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { success, data } = yield this.findById(ticketTypeId);
            if (!success || !data) {
                return { success: false, message: 'Ticket type not found.' };
            }
            try {
                Object.assign(data, updateData);
                const updated = yield this.repository.save(data);
                return { success: true, message: 'Ticket type updated.', data: updated };
            }
            catch (error) {
                return { success: false, message: 'Failed to update ticket type.' };
            }
        });
    }
    delete(ticketTypeId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if ticket type exists and if it is linked to registrations
                const existing = yield this.repository.findOne({
                    where: { ticketTypeId },
                    relations: ['registrations'], // Ensure TicketType is linked properly to Registrations
                });
                if (!existing) {
                    return { success: false, message: 'Ticket type not found.' };
                }
                // Prevent deletion if ticket type is used in registrations
                if (existing.registrations && existing.registrations.length > 0) {
                    return { success: false, message: `Cannot delete this ticket type because it is used in ${existing.registrations.length} registrations.` };
                }
                // Proceed with deletion
                const result = yield this.repository.delete({ ticketTypeId });
                if (result.affected && result.affected > 0) {
                    return { success: true, message: 'Ticket type deleted successfully.' };
                }
                else {
                    return { success: false, message: 'Ticket type could not be deleted for an unknown reason.' };
                }
            }
            catch (error) {
                return { success: false, message: 'Failed to delete ticket type. Check database constraints or ID format.' };
            }
        });
    }
}
exports.TicketTypeRepository = TicketTypeRepository;
