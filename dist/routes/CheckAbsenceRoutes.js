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
const express_1 = require("express");
const CheckAbsenceService_1 = require("../services/bookings/CheckAbsenceService");
const router = (0, express_1.Router)();
/**
 * @route GET /api/v1/venues/:venueId/available-slots
 * @description Check available days and hours for a specific venue within a date range.
 * @access Private (Authenticated Users)
 */
router.get("/:venueId/available-slots", ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { venueId } = req.params;
        const { startDate, endDate } = req.query;
        // Validate required parameters
        if (!venueId || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: venueId, startDate, and endDate are required."
            });
        }
        // Convert dates to Date format
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format. Use ISO 8601 (YYYY-MM-DD)."
            });
        }
        // Fetch available slots
        const availableSlots = yield CheckAbsenceService_1.CheckAbsenceService.getAvailableSlots(req, venueId, parsedStartDate, parsedEndDate);
        return res.status(200).json({ success: true, data: availableSlots });
    }
    catch (error) {
        console.error("Error fetching available slots:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while checking availability."
        });
    }
})));
exports.default = router;
