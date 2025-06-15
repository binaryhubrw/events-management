// src/repositories/TicketTypeRepository.ts
import { AppDataSource } from '../config/Database';
import { TicketType } from '../models/TicketType';
import { IsNull } from 'typeorm'; // Import IsNull for checking soft-deleted records

export class TicketTypeRepository {
    private repository = AppDataSource.getRepository(TicketType);

    /**
     * Creates a new TicketType record in the database.
     * Includes basic validation and checks for existing ticket names.
     * @param ticketType - The partial TicketType object containing data for creation.
     * @returns An object indicating success, a message, and the created data if successful.
     */
    async create(ticketType: Partial<TicketType>): Promise<{
        success: boolean;
        message: string;
        data?: TicketType;
    }> {
        // --- Validation (can be moved to service/validation layer for better separation) ---
        if (!ticketType.ticketName) {
            return { success: false, message: 'Ticket name is required.' };
        }
        if (ticketType.price === undefined || typeof ticketType.price !== 'number' || ticketType.price <= 0) {
            return { success: false, message: 'Ticket price must be a positive number.' };
        }
        if (!ticketType.ticketCategory) { // ADDED: Check for ticketCategory
            return { success: false, message: 'Ticket category is required.' };
        }
        // --- End Validation ---

        try {
            // Check if ticket type with the same name already exists and is not soft-deleted
            const existingTicketType = await this.repository.findOne({
                where: {
                    ticketName: ticketType.ticketName,
                    deletedAt: IsNull(), // Only check active tickets
                },
            });
            if (existingTicketType) {
                return { success: false, message: `Ticket type with name '${ticketType.ticketName}' already exists.` };
            }

            const newTicketType = this.repository.create(ticketType);
            const saved = await this.repository.save(newTicketType);
            return { success: true, message: 'Ticket type created successfully.', data: saved };
        } catch (error) {
            // Log the full error for debugging in development
            console.error("Error in TicketTypeRepository.create:", error);
            return { success: false, message: error instanceof Error ? error.message : 'Unknown error during ticket creation.' };
        }
    }

    /**
     * Retrieves all active TicketType records from the database.
     * Includes relations for 'registrations' and filters out soft-deleted records.
     * @returns An object indicating success, a message, and an array of TicketType data.
     */
    async findAll(): Promise<{ success: boolean; message: string; data: TicketType[] }> {
        try {
            const tickets = await this.repository.find({
                where: {
                    deletedAt: IsNull(), // ADDED: Filter out soft-deleted records
                },
                relations: ['registrations'], // Ensure TicketType is linked properly to Registrations
                order: {
                    ticketName: 'ASC', // Optional: Order for consistent results
                }
            });
            return { success: true, message: 'Ticket types fetched successfully.', data: tickets };
        } catch (error) {
            console.error("Error in TicketTypeRepository.findAll:", error);
            return { success: false, message: 'Failed to fetch ticket types.', data: [] };
        }
    }

    /**
     * Finds a single active TicketType record by its ID.
     * Filters out soft-deleted records.
     * @param ticketTypeId - The UUID of the ticket type to find.
     * @returns An object indicating success, a message, and the TicketType data if found.
     */
    async findById(ticketTypeId: string): Promise<{ success: boolean; message: string; data?: TicketType }> {
        try {
            const ticket = await this.repository.findOne({
                where: {
                    ticketTypeId: ticketTypeId, // Use the parameter directly
                    deletedAt: IsNull(), // ADDED: Only find active tickets
                },
                relations: ['registrations'], // Optional: Load registrations if needed for immediate checks
            });

            if (!ticket) {
                return { success: false, message: 'Ticket type not found or is deleted.' };
            }

            return { success: true, message: 'Ticket type found.', data: ticket };
        } catch (error) {
            console.error("Error in TicketTypeRepository.findById:", error);
            return { success: false, message: 'Failed to find ticket type.' };
        }
    }

    /**
     * Updates an existing TicketType record.
     * Applies updates to the found entity and persists changes.
     * @param ticketTypeId - The UUID of the ticket type to update.
     * @param updateData - The partial data to apply as updates.
     * @returns An object indicating success, a message, and the updated TicketType data.
     */
    async update(ticketTypeId: string, updateData: Partial<TicketType>): Promise<{ success: boolean; message: string; data?: TicketType }> {
        // Retrieve the existing ticket, making sure it's not soft-deleted
        const { success, data: existingTicket } = await this.findById(ticketTypeId);
        if (!success || !existingTicket) {
            return { success: false, message: 'Ticket type not found or is deleted.' };
        }

        // --- Validation for updates (can be moved to service/validation layer) ---
        if (updateData.price !== undefined && (typeof updateData.price !== 'number' || updateData.price <= 0)) {
            return { success: false, message: 'Ticket price must be a positive number if provided.' };
        }
        // You might want to add validation for `ticketCategory` here if it's being updated.
        // For example: if (updateData.ticketCategory && !Object.values(TicketCategory).includes(updateData.ticketCategory)) { ... }
        // But this is usually handled by the service or a dedicated validator.
        // --- End Validation ---

        try {
            // Apply updates to the existing entity
            Object.assign(existingTicket, updateData);
            const updated = await this.repository.save(existingTicket);
            return { success: true, message: 'Ticket type updated successfully.', data: updated };
        } catch (error) {
            console.error("Error in TicketTypeRepository.update:", error);
            return { success: false, message: 'Failed to update ticket type.' };
        }
    }

    /**
     * Soft deletes a TicketType record by setting its `deletedAt` timestamp.
     * Prevents deletion if the ticket type is linked to active registrations.
     * @param ticketTypeId - The UUID of the ticket type to soft delete.
     * @returns An object indicating success and a message.
     */
    async delete(ticketTypeId: string): Promise<{ success: boolean; message: string }> {
        try {
            // Find the ticket type, ensuring it's not already soft-deleted
            const existing = await this.repository.findOne({
                where: {
                    ticketTypeId,
                    deletedAt: IsNull(), // Only target non-deleted tickets
                },
                relations: ['registrations'],
            });

            if (!existing) {
                return { success: false, message: 'Ticket type not found or already deleted.' };
            }

            // Check if there are any ACTIVE registrations associated with this ticket type
            const activeRegistrations = existing.registrations?.filter(reg => reg.deletedAt === null || reg.deletedAt === undefined);

            if (activeRegistrations && activeRegistrations.length > 0) {
                return { success: false, message: `Cannot delete this ticket type because it is used in ${activeRegistrations.length} active registrations.` };
            }

            // Perform soft deletion
            existing.deletedAt = new Date(); // Set the deletion timestamp
            await this.repository.save(existing); // Save the updated entity

            return { success: true, message: 'Ticket type soft-deleted successfully.' };
        } catch (error) {
            console.error("Error in TicketTypeRepository.delete:", error);
            return { success: false, message: 'Failed to soft delete ticket type. Check database constraints or ID format.' };
        }
    }
}