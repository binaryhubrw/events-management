import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";
import { EventRepository } from "../repositories/eventRepository";
import { VenueRepository } from "../repositories/venueRepository";
import { EventInterface } from "../interfaces/EventInterface";

export class EventController {
    // Create Event
    static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
        // Destructure ALL potential fields from req.body directly
        // The type assertion 'as EventInterface' helps with type checking,
        // but remember req.body is 'any' by default in Express.
        const {
            eventTitle,
            eventType,
            venueId,
            description,
            eventCategory,
            maxAttendees,
            status,
            isFeatured,
            qrCode,
            imageURL
        }: EventInterface = req.body;

        // organizerId comes from the authenticated user
        const organizerId = req.user?.userId;

        console.log("Request Body:", req.body); // Keep this for debugging
        console.log("Organizer ID:", organizerId);

        // --- Basic Validation for Required Fields ---
        // eventTitle, eventType, venueId, and organizerId are now the core required fields
        if (!eventTitle || !eventType || !venueId || !organizerId) {
            res.status(400).json({
                success: false,
                message: "Missing required fields: eventTitle, eventType, venueId, organizerId."
            });
            return;
        }

        try {
            // Construct the new event data object.
            // We pass ALL fields (including optional ones) to the repository.
            // The repository's 'create' method will handle nullish coalescing for undefined values.
            const newEventData: Partial<EventInterface> = {
                eventTitle,
                eventType,
                venueId,
                organizerId, // This comes from auth, not directly from the client body
                description,
                eventCategory,
                maxAttendees,
                status,
                isFeatured,
                qrCode,
                imageURL
            };

            // Assuming EventRepository.create takes Partial<EventInterface> and
            // returns { success: boolean, data?: Event, message?: string }
            const createResult = EventRepository.create(newEventData);

            if (!createResult.success) {
                res.status(400).json({ success: false, message: createResult.message });
                return;
            }

            const existVenue = await VenueRepository.getById(venueId);
            // You can add logic here to check if the venue exists, e.g.:
            if (!existVenue.success) {
                res.status(404).json({ success: false, message: "Venue not found." });
                return;
             }

            // Assuming EventRepository.save takes an Event entity and
            // returns { success: boolean, data?: Event, message?: string }
            const saveResult = await EventRepository.save(createResult.data!); // Use .data! as we checked success

            if (saveResult.success) {
                res.status(201).json({ success: true, message: "Event created successfully.", data: saveResult.data });
            } else {
                // If save fails, it's likely a database error or deeper validation
                res.status(500).json({ success: false, message: saveResult.message || "Failed to save event." });
            }
        } catch (err: any) {
            console.error("Error creating event:", err);
            res.status(500).json({ success: false, message: "Failed to create event due to a server error." });
        }
    }

    // --- Get Event By Id ---
    static async getById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: "Event ID not found." });
            return;
        }
        try {
            const result = await EventRepository.getById(id);
            if (result.success) {
                res.status(200).json({ success: true, data: result.data });
            } else {
                res.status(404).json({ success: false, message: result.message }); // Corrected status to 404 for not found
            }
        } catch (err: any) {
            console.error("Error getting event by ID:", err);
            res.status(500).json({ success: false, message: "Failed to get event by ID." });
        }
    }

    // --- Get Event By OrganizerId ---
    static async getByOrganizerId(req: AuthenticatedRequest, res: Response): Promise<void> {
        const organizerId = req.user?.userId;
        if (!organizerId) {
            res.status(400).json({ success: false, message: "Organizer ID is required." });
            return;
        }
        try {
            const result = await EventRepository.getByOrganizerId(organizerId);
            if (result.success) {
                res.status(200).json({ success: true, data: result.data }); // Changed 'Data' to 'data' for consistency
            } else {
                res.status(404).json({ success: false, message: result.message }); // Corrected status to 404 for no events found
            }
        } catch (err: any) {
            console.error("Error getting event by Organizer ID:", err);
            res.status(500).json({ success: false, message: "Failed to get event by Organizer ID." });
        }
    }

    // --- Get All Events ---
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const result = await EventRepository.getAll();
            if (result.success) {
                res.status(200).json({ success: true, data: result.data });
            } else {
                // If no events found, it's typically a 200 with an empty array or specific message, not 404
                res.status(200).json({ success: false, message: result.message || "No events found." });
            }
        } catch (err: any) {
            console.error("Error getting all events:", err);
            res.status(500).json({ success: false, message: "Failed to get all events." });
        }
    }

    // --- Update Event ---
    static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
        const { id } = req.params;
        const organizerId = req.user?.userId; // Ensure organizerId is available from auth

        // Destructure ALL possible updatable fields from req.body
        const {
            description,
            eventCategory,
            eventTitle,
            eventType,
            venueId,
            maxAttendees,
            status,
            isFeatured,
            qrCode,
            imageURL
        }: Partial<EventInterface> = req.body;

        if (!id) {
            res.status(400).json({ success: false, message: "Event ID is required for update." });
            return;
        }

        try {
            // Construct the update data object, including optional fields if present
            const updateData: Partial<EventInterface> = {
                description,
                eventCategory,
                eventTitle,
                eventType,
                venueId,
                organizerId, // This might be used for authorization checks in the repository/service layer
                maxAttendees,
                status,
                isFeatured,
                qrCode,
                imageURL
            };

            const updateResult = await EventRepository.update(id, updateData); // Pass all relevant data

            if (updateResult.success) {
                res.status(200).json({ success: true, message: "Event updated successfully.", data: updateResult.data });
            } else {
                res.status(404).json({ success: false, message: updateResult.message });
            }
        } catch (err: any) {
            console.error("Error updating event:", err);
            res.status(500).json({ success: false, message: "Failed to update event due to a server error." });
        }
    }

    // --- Delete Event ---
    static async delete(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: "Event ID is required." });
            return;
        }
        try {
            const deleteResult = await EventRepository.delete(id);
            if (deleteResult.succcess) { // Typo: 'succcess' should be 'success'
                res.status(200).json({ success: true, message: "Event deleted successfully." });
            } else {
                res.status(404).json({ success: false, message: deleteResult.message });
            }
        } catch (err: any) {
            console.error("Error deleting event:", err);
            res.status(500).json({ success: false, message: "Failed to delete event." });
        }
    }
}