// src/controllers/TicketTypeController.ts
import { Request, Response } from 'express';
import { TicketTypeService } from '../services/tickets/TicketTypeService';
import { TicketTypeRequestInterface } from '../interfaces/TicketTypeInterface';
import { TicketCategory } from '../interfaces/Index';

export class TicketTypeController {
    // No need for service instance since all methods are static
    
    /**
     * Handles the creation of a new TicketType.
     * Delegates to the TicketTypeService for business logic and data persistence.
     */
    static async createTicketType(req: Request, res: Response): Promise<Response> {
        try {
            const ticketTypeData: TicketTypeRequestInterface = req.body;

            // --- Basic input validation before hitting the service ---
            if (!ticketTypeData.ticketName || !ticketTypeData.price || !ticketTypeData.ticketCategory) {
                return res.status(400).json({ message: 'Missing required fields: ticketName, price, and ticketCategory.' });
            }
            if (typeof ticketTypeData.price !== 'number' || ticketTypeData.price <= 0) {
                return res.status(400).json({ message: 'Price must be a positive number.' });
            }
            if (!Object.values(TicketCategory).includes(ticketTypeData.ticketCategory)) {
                return res.status(400).json({ message: 'Invalid ticket category provided.' });
            }
            // --- End validation ---

            const newTicketType = await TicketTypeService.createTicketType(ticketTypeData);

            // Convert to response format using the service's method
            const responseData = {
                ticketTypeId: newTicketType.ticketTypeId,
                ticketName: newTicketType.ticketName,
                price: newTicketType.price,
                description: newTicketType.description,
                ticketCategory: newTicketType.ticketCategory,
                promoName: newTicketType.promoName,
                promoDescription: newTicketType.promoDescription,
                deletedAt: newTicketType.deletedAt ? newTicketType.deletedAt.toISOString() : undefined,
            };

            return res.status(201).json(responseData);

        } catch (error: any) {
            console.error('Error creating ticket type:', error);
            return res.status(500).json({ message: 'Failed to create ticket type', error: error.message || 'Internal server error' });
        }
    }

    /**
     * Retrieves all active TicketTypes.
     * Delegates to the TicketTypeService.
     */
    static async getAllTicketTypes(req: Request, res: Response): Promise<Response> {
        try {
            const ticketTypes = await TicketTypeService.getAllTicketTypeResponses();
            return res.status(200).json(ticketTypes);
        } catch (error: any) {
            console.error('Error fetching all ticket types:', error);
            return res.status(500).json({ message: 'Failed to fetch ticket types', error: error.message || 'Internal server error' });
        }
    }

    /**
     * Retrieves a single TicketType by ID.
     * Delegates to the TicketTypeService.
     */
    static async getTicketTypeById(req: Request, res: Response): Promise<Response> {
        try {
            const { ticketTypeId } = req.params;

            const ticketType = await TicketTypeService.getTicketTypeResponseById(ticketTypeId);

            if (!ticketType) {
                return res.status(404).json({ message: `Ticket type with ID ${ticketTypeId} not found.` });
            }

            return res.status(200).json(ticketType);
        } catch (error: any) {
            console.error('Error fetching ticket type by ID:', error);
            return res.status(500).json({ message: 'Failed to fetch ticket type', error: error.message || 'Internal server error' });
        }
    }

    /**
     * Updates an existing TicketType.
     * Delegates to the TicketTypeService.
     */
    static async updateTicketType(req: Request, res: Response): Promise<Response> {
        try {
            const { ticketTypeId } = req.params;
            const updateData: Partial<TicketTypeRequestInterface> = req.body;

            // --- Basic input validation for updates ---
            if (updateData.ticketCategory && !Object.values(TicketCategory).includes(updateData.ticketCategory)) {
                return res.status(400).json({ message: 'Invalid ticket category provided for update.' });
            }
            if (updateData.price !== undefined && (typeof updateData.price !== 'number' || updateData.price <= 0)) {
                return res.status(400).json({ message: 'Price must be a positive number if provided.' });
            }
            // --- End validation ---

            const updatedTicketType = await TicketTypeService.updateTicketType(ticketTypeId, updateData);

            if (!updatedTicketType) {
                return res.status(404).json({ message: `Ticket type with ID ${ticketTypeId} not found.` });
            }

            // Convert to response format
            const responseData = {
                ticketTypeId: updatedTicketType.ticketTypeId,
                ticketName: updatedTicketType.ticketName,
                price: updatedTicketType.price,
                description: updatedTicketType.description,
                ticketCategory: updatedTicketType.ticketCategory,
                promoName: updatedTicketType.promoName,
                promoDescription: updatedTicketType.promoDescription,
                deletedAt: updatedTicketType.deletedAt ? updatedTicketType.deletedAt.toISOString() : undefined,
            };

            return res.status(200).json(responseData);
        } catch (error: any) {
            console.error('Error updating ticket type:', error);
            return res.status(500).json({ message: 'Failed to update ticket type', error: error.message || 'Internal server error' });
        }
    }

    /**
     * Soft deletes a TicketType.
     * Delegates to the TicketTypeService.
     */
    static async deleteTicketType(req: Request, res: Response): Promise<Response> {
        try {
            const { ticketTypeId } = req.params;

            const success = await TicketTypeService.deleteTicketType(ticketTypeId);

            if (!success) {
                return res.status(404).json({ message: `Ticket type with ID ${ticketTypeId} not found or could not be deleted.` });
            }

            return res.status(204).send();
        } catch (error: any) {
            console.error('Error deleting ticket type:', error);
            return res.status(500).json({ message: 'Failed to delete ticket type', error: error.message || 'Internal server error' });
        }
    }

    /**
     * Gets ticket count statistics by category.
     */
    static async getTicketCountByCategory(req: Request, res: Response): Promise<Response> {
        try {
            const counts = await TicketTypeService.countTicketsByCategory();
            return res.status(200).json(counts);
        } catch (error: any) {
            console.error('Error fetching ticket counts by category:', error);
            return res.status(500).json({ message: 'Failed to fetch ticket counts', error: error.message || 'Internal server error' });
        }
    }
}