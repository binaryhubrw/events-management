import { Router, Request, Response, RequestHandler } from "express";
import { CheckAbsenceService } from "../services/bookings/CheckAbsenceService";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";

const router = Router();

/**
 * @route GET /api/v1/venues/:venueId/available-slots
 * @description Check available days and hours for a specific venue within a date range.
 * @access Private (Authenticated Users)
 */
router.get(
    "/:venueId/available-slots",
    (async (req: AuthenticatedRequest, res: Response) => {
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
            const parsedStartDate = new Date(startDate as string);
            const parsedEndDate = new Date(endDate as string);

            if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date format. Use ISO 8601 (YYYY-MM-DD)."
                });
            }

            // Fetch available slots
            const availableSlots = await CheckAbsenceService.getAvailableSlots(req, venueId, parsedStartDate, parsedEndDate);

            return res.status(200).json({ success: true, data: availableSlots });
        } catch (error) {
            console.error("Error fetching available slots:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error while checking availability."
            });
        }
    }) as unknown as RequestHandler
);

export default router;
