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
exports.TicketTypeController = void 0;
const TicketTypeRepository_1 = require("../repositories/TicketTypeRepository");
const ticketTypeRepo = new TicketTypeRepository_1.TicketTypeRepository();
class TicketTypeController {
    createTicketType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ticketTypeData = req.body;
                const result = yield ticketTypeRepo.create(ticketTypeData);
                if (!result.success) {
                    res.status(400).json({ success: false, message: result.message });
                    return;
                }
                res.status(201).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            }
            catch (error) {
                console.error('Controller error:', error);
                res.status(500).json({ success: false, message: 'Failed to create ticket type' });
            }
        });
    }
    getAllTicketTypes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield ticketTypeRepo.findAll();
                res.status(200).json({
                    success: result.success,
                    message: result.message,
                    data: result.data
                });
            }
            catch (error) {
                console.error('Controller error:', error);
                res.status(500).json({ success: false, message: 'Failed to fetch ticket types' });
            }
        });
    }
    getTicketTypeById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { ticketTypeId } = req.params;
                const result = yield ticketTypeRepo.findById(ticketTypeId);
                if (!result.success) {
                    res.status(404).json({ success: false, message: result.message });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            }
            catch (error) {
                console.error('Controller error:', error);
                res.status(500).json({ success: false, message: 'Failed to fetch ticket type' });
            }
        });
    }
    updateTicketType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { ticketTypeId } = req.params;
                const updateData = req.body;
                const result = yield ticketTypeRepo.update(ticketTypeId, updateData);
                if (!result.success) {
                    res.status(404).json({ success: false, message: result.message });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            }
            catch (error) {
                console.error('Controller error:', error);
                res.status(500).json({ success: false, message: 'Failed to update ticket type' });
            }
        });
    }
    deleteTicketType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { ticketTypeId } = req.params;
                const result = yield ticketTypeRepo.delete(ticketTypeId);
                if (!result.success) {
                    res.status(404).json({ success: false, message: result.message });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: result.message
                });
            }
            catch (error) {
                console.error('Controller error:', error);
                res.status(500).json({ success: false, message: 'Failed to delete ticket type' });
            }
        });
    }
}
exports.TicketTypeController = TicketTypeController;
