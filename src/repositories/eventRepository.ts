import { AppDataSource } from "../config/Database";
import { EventInterface } from "../interfaces/EventInterface";
import { EventStatus, EventType } from "../interfaces/Index";
import { Event } from "../models/Event"; // Assuming EventStatus enum is defined in Event model

export class EventRepository {

    /**
     * Creates a new Event instance from provided data.
     * This method prepares the Event entity, but does not save it to the database.
     * @param data Partial<EventInterface> - The data for creating the event.
     * @returns {success: boolean; data?: Event; message?: string} - Result object with success status, Event entity, or error message.
     */
    static create(data: Partial<EventInterface>): { success: boolean; data?: Event; message?: string } {
        // Basic validation for truly essential fields at the repository level if desired,
        // though typically this is handled by DTOs and validation pipelines before reaching the repository.
        if (!data.eventTitle || !data.eventType || !data.venueId || !data.organizerId) {
            return { success: false, message: "Missing required event fields: eventTitle, eventType, venueId, organizerId" };
        }

        // Map EventType string to enum
        const eventTypeMap: Record<string, EventType> = {
            public: EventType.PUBLIC,
            private: EventType.PRIVATE,
        };

        const mappedEventType = eventTypeMap[data.eventType];
        if (!mappedEventType) {
            return { success: false, message: "Invalid event type provided." };
        }

        // Map EventStatus string to enum, if provided
        const eventStatusMap: Record<string, EventStatus> = {
            draft: EventStatus.DRAFT,
            published: EventStatus.PUBLISHED,
            cancelled: EventStatus.CANCELLED,
            completed: EventStatus.COMPLETED,
            archived: EventStatus.ARCHIVED,
        };

        const mappedStatus = data.status ? eventStatusMap[data.status] : EventStatus.DRAFT; // Default to DRAFT if not provided
        if (data.status && !mappedStatus) {
            return { success: false, message: "Invalid event status provided." };
        }

        // Create and populate the event entity using the interface data
        const event = new Event();
        event.eventTitle = data.eventTitle;
        event.eventType = mappedEventType;
        event.venueId = data.venueId;
        event.organizerId = data.organizerId; // This should typically come from authentication context, not directly from data
        event.description = data.description ?? undefined; // Use undefined for optional fields
        event.eventCategory = data.eventCategory ?? undefined;
        event.maxAttendees = data.maxAttendees ?? undefined;
        event.status = mappedStatus;
        event.isFeatured = data.isFeatured ?? false; // Default to false if not provided
        event.qrCode = data.qrCode ?? undefined;
        event.imageURL = data.imageURL ?? undefined;

        return { success: true, data: event };
    }

    /**
     * Saves an Event entity to the database.
     * @param event Event - The Event entity to be saved.
     * @returns {Promise<{success: boolean; data?: Event; message?: string}>} - Result object with success status, saved Event entity, or error message.
     */
    static async save(event: Event): Promise<{ success: boolean; data?: Event; message?: string }> {
        try {
            const savedEvent = await AppDataSource.getRepository(Event).save(event);
            return { success: true, data: savedEvent, message: "Event saved successfully" };
        } catch (error) {
            console.error("Error saving event:", error);
            // In a real application, you might want to check for specific error codes (e.g., unique constraint violation)
            return { success: false, message: "Failed to save this event." };
        }
    }

    /**
     * Retrieves an event by its ID.
     * @param id string - The ID of the event to retrieve.
     * @returns {Promise<{success: boolean; data?: Event; message?: string}>} - Result object with success status, Event entity, or error message.
     */
    static async getById(id: string): Promise<{ success: boolean; data?: Event; message?: string }> {
        if (!id) {
            return { success: false, message: "Event ID is required." };
        }
        try {
            const event = await AppDataSource.getRepository(Event).findOne({
                where: { eventId: id },
                relations: ['organizer', 'organizer.role', 'venue']
            });

            if (!event) {
                return { success: false, message: "Event not found." };
            }
            return { success: true, data: event };
        } catch (error) {
            console.error("Error fetching event by ID:", error);
            return { success: false, message: "Failed to retrieve event by ID." };
        }
    }

    /**
     * Retrieves events by organizer ID.
     * @param organizerId string - The ID of the organizer.
     * @returns {Promise<{success: boolean; data?: Event[]; message?: string}>} - Result object with success status, array of Event entities, or error message.
     */
    static async getByOrganizerId(organizerId: string): Promise<{ success: boolean; data?: Event[]; message?: string }> {
        if (!organizerId) {
            return { success: false, message: "Organizer ID is required." };
        }

        try {
            const events = await AppDataSource.getRepository(Event).find({
                where: {
                    organizer: {
                        userId: organizerId
                    }
                },
                relations: ['organizer', 'organizer.role', 'venue'],
            });

            if (events.length === 0) {
                return { success: false, message: "No events found for this organizer." };
            }

            return { success: true, data: events };
        } catch (error) {
            console.error("Error fetching events by organizer ID:", error);
            return { success: false, message: "Failed to fetch events by organizer ID." };
        }
    }

    /**
     * Retrieves all events.
     * @returns {Promise<{success: boolean; data?: Event[]; message?: string}>} - Result object with success status, array of Event entities, or error message.
     */
    static async getAll(): Promise<{ success: boolean; data?: Event[]; message?: string }> {
        try {
            const events = await AppDataSource.getRepository(Event).find({
                relations: ['organizer', 'organizer.role', 'venue']
            });
            return { success: true, data: events };
        } catch (error) {
            console.error("Error fetching all events:", error);
            return { success: false, message: "Failed to retrieve all events." };
        }
    }

    /**
     * Updates an existing event.
     * @param id string - The ID of the event to update.
     * @param data Partial<EventInterface> - The partial data to update the event with.
     * @returns {Promise<{success: boolean; data?: Event; message?: string}>} - Result object with success status, updated Event entity, or error message.
     */
    static async update(id: string, data: Partial<EventInterface>): Promise<{ success: boolean; data?: Event; message?: string }> {
        if (!id) {
            return { success: false, message: "Event ID is required for update." };
        }
        try {
            const repo = AppDataSource.getRepository(Event);
            const event = await repo.findOne({ where: { eventId: id } });

            if (!event) {
                return { success: false, message: "Event not found." };
            }

            // Map EventType string to enum if provided
            let updatedEventType = event.eventType;
            if (data.eventType) {
                const eventTypeMap: Record<string, EventType> = {
                    public: EventType.PUBLIC,
                    private: EventType.PRIVATE,
                };
                const mappedType = eventTypeMap[data.eventType];
                if (mappedType) {
                    updatedEventType = mappedType;
                } else {
                    return { success: false, message: "Invalid event type for update." };
                }
            }

            // Map EventStatus string to enum if provided
            let updatedStatus = event.status;
            if (data.status) {
                const eventStatusMap: Record<string, EventStatus> = {
                    draft: EventStatus.DRAFT,
                    published: EventStatus.PUBLISHED,
                    cancelled: EventStatus.CANCELLED,
                    completed: EventStatus.COMPLETED,
                    archived: EventStatus.ARCHIVED,
                };
                const mappedStatus = eventStatusMap[data.status];
                if (mappedStatus) {
                    updatedStatus = mappedStatus;
                } else {
                    return { success: false, message: "Invalid event status for update." };
                }
            }

            // Merge the new data with the existing event,
            // using nullish coalescing to retain old values if new ones are not provided.
            repo.merge(event, {
                description: data.description ?? event.description,
                eventTitle: data.eventTitle ?? event.eventTitle,
                eventCategory: data.eventCategory ?? event.eventCategory,
                venueId: data.venueId ?? event.venueId,
                organizerId: data.organizerId ?? event.organizerId, // Be careful updating organizerId directly
                eventType: updatedEventType,
                maxAttendees: data.maxAttendees ?? event.maxAttendees,
                status: updatedStatus,
                isFeatured: data.isFeatured ?? event.isFeatured,
                qrCode: data.qrCode ?? event.qrCode,
                imageURL: data.imageURL ?? event.imageURL,
            });

            const updatedEvent = await repo.save(event);
            return { success: true, data: updatedEvent, message: "Event updated successfully." };
        } catch (error) {
            console.error("Error updating event:", error);
            return { success: false, message: "Failed to update event." };
        }
    }

    /**
     * Deletes an event by its ID.
     * @param id string - The ID of the event to delete.
     * @returns {Promise<{succcess: boolean; data?: Event; message?: string}>} - Result object with success status or error message.
     */
    static async delete(id: string): Promise<{ succcess: boolean; data?: Event; message?: string }> {
        if (!id) {
            return { succcess: false, message: "Event ID is required." };
        }
        try {
            const result = await AppDataSource.getRepository(Event).delete(id);
            if (result.affected === 0) {
                return { succcess: false, message: "Event not found or already deleted." };
            }
            return { succcess: true, message: "Event deleted successfully." };
        } catch (error) {
            console.error("Error deleting event:", error);
            return { succcess: false, message: "Failed to delete event." };
        }
    }
}