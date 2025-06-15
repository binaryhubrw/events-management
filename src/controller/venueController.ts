import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware"; // Assuming this middleware provides req.user
import { VenueRepository } from "../repositories/venueRepository";
import { VenueInterface } from "../interfaces/VenueInterface";

export class VenueController {
    /**
     * Creates a new venue.
     * Requires authentication.
     * @param req AuthenticatedRequest - The request object containing venue data in body.
     * @param res Response - The response object.
     */
    static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
        // Destructure all potential fields from req.body directly
        const {
            venueName,
            capacity,
            location,
            isAvailable,
            isBooked,
            latitude,
            longitude,
            googleMapsLink,
            // managerId should typically come from auth if the creating user is the manager,
            // or be explicitly provided by an admin. For now, we'll allow it from body or auth.
            managerId // This might be from req.body if an admin assigns it, or req.user.userId
        }: VenueInterface = req.body;

        const actingManagerId = req.user?.userId; // The ID of the user making the request

        // Basic validation for core required fields
        if (!venueName || !capacity || !location) {
            res.status(400).json({
                success: false,
                message: "Missing required fields: venueName, capacity, location."
            });
            return;
        }

        try {
            // Construct the new venue data object, ensuring managerId is handled
            const newVenueData: Partial<VenueInterface> = {
                venueName,
                capacity,
                location,
                isAvailable,
                isBooked,
                latitude,
                longitude,
                googleMapsLink,
                // Prioritize managerId from body if provided (e.g., by an admin assigning a manager)
                // Otherwise, use the acting user's ID if they are implicitly the manager.
                managerId: managerId || actingManagerId // Decide how managerId is set
            };

            // Create the venue entity
            const createResult = VenueRepository.create(newVenueData);

            if (!createResult.success) {
                res.status(400).json({ success: false, message: createResult.message });
                return;
            }

            // Save the venue entity to the database
            const saveResult = await VenueRepository.save(createResult.data!);

            if (saveResult.success) {
                res.status(201).json({ success: true, message: "Venue created successfully.", data: saveResult.data });
            } else {
                res.status(400).json({ success: false, message: saveResult.message || "Failed to save venue." });
            }
        } catch (err: any) {
            console.error("Error creating venue:", err);
            res.status(500).json({ success: false, message: "Failed to create venue due to a server error." });
        }
    }

    /**
     * Retrieves a venue by its ID.
     * @param req Request - The request object containing venue ID in params.
     * @param res Response - The response object.
     */
    static async getById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: "Venue ID is required." });
            return;
        }
        try {
            const result = await VenueRepository.getById(id);
            if (result.success) {
                res.status(200).json({ success: true, data: result.data });
            } else {
                res.status(404).json({ success: false, message: result.message });
            }
        } catch (err: any) {
            console.error("Error getting venue by ID:", err);
            res.status(500).json({ success: false, message: "Failed to get venue by ID." });
        }
    }

    /**
     * Retrieves all venues.
     * @param req Request - The request object.
     * @param res Response - The response object.
     */
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const result = await VenueRepository.getAll();
            if (result.success) {
                res.status(200).json({ success: true, data: result.data });
            } else {
                // If no venues found, it's typically a 200 with an empty array or specific message
                res.status(200).json({ success: false, message: result.message || "No venues found." });
            }
        } catch (err: any) {
            console.error("Error getting all venues:", err);
            res.status(500).json({ success: false, message: "Failed to get all venues." });
        }
    }

    /**
     * Retrieves venues managed by a specific user.
     * Requires authentication.
     * @param req AuthenticatedRequest - The request object. Manager ID is taken from authenticated user.
     * @param res Response - The response object.
     */
    static async getByManagerId(req: AuthenticatedRequest, res: Response): Promise<void> {
        const managerId = req.user?.userId;
        if (!managerId) {
            res.status(401).json({ success: false, message: "Authentication required to get venues by manager." });
            return;
        }
        try {
            const result = await VenueRepository.getByManagerId(managerId);
            if (result.success) {
                res.status(200).json({ success: true, data: result.data });
            } else {
                res.status(404).json({ success: false, message: result.message });
            }
        } catch (err: any) {
            console.error("Error getting venues by manager ID:", err);
            res.status(500).json({ success: false, message: "Failed to get venues by manager ID." });
        }
    }

    /**
     * Updates an existing venue.
     * Requires authentication.
     * @param req AuthenticatedRequest - The request object containing venue ID in params and update data in body.
     * @param res Response - The response object.
     */
    static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
        const { id } = req.params;
        const updateData: Partial<VenueInterface> = req.body; // All fields from body are update candidates

        if (!id) {
            res.status(400).json({ success: false, message: "Venue ID is required for update." });
            return;
        }

        try {
            const updateResult = await VenueRepository.update(id, updateData);

            if (updateResult.success) {
                res.status(200).json({ success: true, message: "Venue updated successfully.", data: updateResult.data });
            } else {
                res.status(400).json({ success: false, message: updateResult.message }); // Use 400 for validation/not found issues
            }
        } catch (err: any) {
            console.error("Error updating venue:", err);
            res.status(500).json({ success: false, message: "Failed to update venue due to a server error." });
        }
    }

    /**
     * Updates the manager of a specific venue.
     * Requires authentication (likely by an Admin or another authorized role).
     * @param req AuthenticatedRequest - The request object containing venue ID in params and new managerId in body.
     * @param res Response - The response object.
     */
    static async updateVenueManager(req: AuthenticatedRequest, res: Response): Promise<void> {
        const { id: venueId } = req.params; // Renaming 'id' from params to 'venueId'
        const { managerId } = req.body; // New manager's ID from request body

        if (!venueId || !managerId) {
            res.status(400).json({ success: false, message: "Venue ID and new manager ID are required." });
            return;
        }

        try {
            const updateResult = await VenueRepository.updateVenueManager(venueId, managerId);

            if (updateResult.success) {
                res.status(200).json({ success: true, message: "Venue manager updated successfully.", data: updateResult.data });
            } else {
                res.status(400).json({ success: false, message: updateResult.message });
            }
        } catch (err: any) {
            console.error("Error updating venue manager:", err);
            res.status(500).json({ success: false, message: "Failed to update venue manager due to a server error." });
        }
    }

    /**
     * Soft-deletes a venue by its ID.
     * Requires authentication.
     * @param req Request - The request object containing venue ID in params.
     * @param res Response - The response object.
     */
    static async delete(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: "Venue ID is required." });
            return;
        }
        try {
            const deleteResult = await VenueRepository.delete(id);
            if (deleteResult.success) {
                res.status(200).json({ success: true, message: deleteResult.message });
            } else {
                res.status(404).json({ success: false, message: deleteResult.message });
            }
        } catch (err: any) {
            console.error("Error deleting venue:", err);
            res.status(500).json({ success: false, message: "Failed to delete venue." });
        }
    }

    // --- New Functions (Beyond Basic CRUD) ---

    /**
     * Checks the availability of a venue for a specific date range.
     * @param req Request - Contains venueId in params, startDate and endDate in query.
     * @param res Response - The response object.
     */
    static async checkVenueAvailability(req: Request, res: Response): Promise<void> {
        const { id: venueId } = req.params;
        const { startDate, endDate } = req.query; // Dates as strings from query parameters

        if (!venueId || !startDate || !endDate) {
            res.status(400).json({ success: false, message: "Venue ID, startDate, and endDate are required query parameters." });
            return;
        }

        // Convert date strings to Date objects for repository
        const startDateTime = new Date(startDate as string);
        const endDateTime = new Date(endDate as string);

        // Basic date validation
        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            res.status(400).json({ success: false, message: "Invalid date format for startDate or endDate." });
            return;
        }
        if (startDateTime > endDateTime) {
            res.status(400).json({ success: false, message: "startDate cannot be after endDate." });
            return;
        }

        try {
            const result = await VenueRepository.checkVenueAvailability(venueId, startDateTime, endDateTime);
            if (result.success) {
                res.status(200).json({ success: true, available: result.available, message: result.message });
            } else {
                res.status(404).json({ success: false, message: result.message });
            }
        } catch (err: any) {
            console.error("Error checking venue availability:", err);
            res.status(500).json({ success: false, message: "Failed to check venue availability due to a server error." });
        }
    }

    /**
     * Sets the general availability status of a venue.
     * Requires authentication (e.g., by an Admin or Venue Manager).
     * @param req AuthenticatedRequest - Contains venueId in params and status (boolean) in body.
     * @param res Response - The response object.
     */
    static async setVenueGeneralAvailability(req: AuthenticatedRequest, res: Response): Promise<void> {
        const { id: venueId } = req.params;
        const { status } = req.body; // Expecting a boolean value

        if (!venueId || typeof status !== 'boolean') {
            res.status(400).json({ success: false, message: "Venue ID and a boolean 'status' are required." });
            return;
        }

        try {
            const result = await VenueRepository.setVenueGeneralAvailability(venueId, status);
            if (result.success) {
                res.status(200).json({ success: true, message: result.message, data: result.data });
            } else {
                res.status(400).json({ success: false, message: result.message });
            }
        } catch (err: any) {
            console.error("Error setting venue general availability:", err);
            res.status(500).json({ success: false, message: "Failed to set venue general availability due to a server error." });
        }
    }

    /**
     * Searches for venues based on various criteria.
     * @param req Request - Contains search criteria in query parameters.
     * @param res Response - The response object.
     */
    static async searchVenues(req: Request, res: Response): Promise<void> {
        const { name, location, minCapacity, maxCapacity, isAvailable, hasManager } = req.query;

        // Construct criteria object, converting types as necessary
        const criteria: {
            name?: string;
            location?: string;
            minCapacity?: number;
            maxCapacity?: number;
            isAvailable?: boolean;
            hasManager?: boolean;
        } = {};

        if (typeof name === 'string') criteria.name = name;
        if (typeof location === 'string') criteria.location = location;
        if (typeof minCapacity === 'string') criteria.minCapacity = parseInt(minCapacity, 10);
        if (typeof maxCapacity === 'string') criteria.maxCapacity = parseInt(maxCapacity, 10);
        // Convert 'true'/'false' strings to booleans
        if (typeof isAvailable === 'string') criteria.isAvailable = isAvailable === 'true';
        if (typeof hasManager === 'string') criteria.hasManager = hasManager === 'true';


        try {
            const result = await VenueRepository.searchVenues(criteria);
            if (result.success) {
                res.status(200).json({ success: true, data: result.data });
            } else {
                res.status(500).json({ success: false, message: result.message });
            }
        } catch (err: any) {
            console.error("Error searching venues:", err);
            res.status(500).json({ success: false, message: "Failed to search venues due to a server error." });
        }
    }

    /**
     * Gets the total count of active venues.
     * @param req Request - The request object.
     * @param res Response - The response object.
     */
    static async getVenueCount(req: Request, res: Response): Promise<void> {
        try {
            const result = await VenueRepository.getVenueCount();
            if (result.success) {
                res.status(200).json({ success: true, count: result.count });
            } else {
                res.status(500).json({ success: false, message: result.message });
            }
        } catch (err: any) {
            console.error("Error getting venue count:", err);
            res.status(500).json({ success: false, message: "Failed to get venue count due to a server error." });
        }
    }

    /**
     * Removes the assigned manager from a venue.
     * Requires authentication (e.g., by an Admin).
     * @param req AuthenticatedRequest - Contains venueId in params.
     * @param res Response - The response object.
     */
    static async removeVenueManager(req: AuthenticatedRequest, res: Response): Promise<void> {
        const { id: venueId } = req.params;

        if (!venueId) {
            res.status(400).json({ success: false, message: "Venue ID is required." });
            return;
        }

        try {
            const result = await VenueRepository.removeVenueManager(venueId);
            if (result.success) {
                res.status(200).json({ success: true, message: result.message, data: result.data });
            } else {
                res.status(400).json({ success: false, message: result.message });
            }
        } catch (err: any) {
            console.error("Error removing venue manager:", err);
            res.status(500).json({ success: false, message: "Failed to remove venue manager due to a server error." });
        }
    }
}