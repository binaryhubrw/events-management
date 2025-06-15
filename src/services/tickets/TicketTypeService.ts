// src/services/tickets/TicketTypeService.ts
import { Repository, IsNull } from 'typeorm';
import { TicketType } from '../../models/TicketType';
import { AppDataSource } from '../../config/Database';
import { TicketTypeRequestInterface, TicketTypeResponseInterface } from '../../interfaces/TicketTypeInterface';
import { TicketCategory } from '../../interfaces/Index';

/**
 * Service class for managing TicketType entities.
 * This class encapsulates the business logic for creating, retrieving,
 * updating, and deleting ticket types.
 */
export class TicketTypeService {
    // Use DataSource to get repository
    private static get ticketTypeRepository(): Repository<TicketType> {
        return AppDataSource.getRepository(TicketType);
    }

    /**
     * Converts a TicketType entity to a TicketTypeResponse interface.
     * This is useful for shaping the data returned to the client,
     * ensuring only necessary fields are exposed and in the correct format.
     * @param ticketType - The TicketType entity to convert.
     * @returns The TicketTypeResponse representation of the entity.
     */
private static convertToResponse(ticketType: TicketType): TicketTypeResponseInterface {
    return {
        ticketTypeId: ticketType.ticketTypeId,
        ticketName: ticketType.ticketName,
        price: ticketType.price,
        description: ticketType.description,
        ticketCategory: ticketType.ticketCategory,
        promoName: ticketType.promoName,
        promoDescription: ticketType.promoDescription,
        capacity: ticketType.capacity,
        minQuantity: ticketType.minQuantity,
        maxQuantity: ticketType.maxQuantity,
        isActive: ticketType.isActive,
        perks: ticketType.perks,
        deletedAt: ticketType.deletedAt ? ticketType.deletedAt.toISOString() : undefined,
        availableFrom: ticketType.availableFrom ? ticketType.availableFrom.toISOString() : undefined,
        availableUntil: ticketType.availableUntil ? ticketType.availableUntil.toISOString() : undefined,
        createdAt: ticketType.createdAt ? ticketType.createdAt.toISOString() : undefined,
        updatedAt: ticketType.updatedAt ? ticketType.updatedAt.toISOString() : undefined,
    };
}


    /**
     * Creates a new TicketType.
     * @param ticketTypeData - The data for the new ticket type, conforming to TicketTypeRequest.
     * @returns A promise that resolves to the created TicketType entity.
     */
    static async createTicketType(ticketTypeData: TicketTypeRequestInterface): Promise<TicketType> {
        const newTicketType = this.ticketTypeRepository.create(ticketTypeData);
        await this.ticketTypeRepository.save(newTicketType);
        return newTicketType;
    }

    /**
     * Retrieves a single TicketType by its ID.
     * @param ticketTypeId - The UUID of the ticket type to retrieve.
     * @returns A promise that resolves to the TicketType entity if found, otherwise null.
     */
    static async getTicketTypeById(ticketTypeId: string): Promise<TicketType | null> {
        const ticketType = await this.ticketTypeRepository.findOne({
            where: {
                ticketTypeId: ticketTypeId,
                deletedAt: IsNull(),
            },
        });
        return ticketType;
    }

    /**
     * Retrieves all active TicketTypes.
     * @returns A promise that resolves to an array of TicketType entities.
     */
    static async getAllTicketTypes(): Promise<TicketType[]> {
        const ticketTypes = await this.ticketTypeRepository.find({
            where: {
                deletedAt: IsNull(),
            },
            order: {
                ticketName: 'ASC',
            },
        });
        return ticketTypes;
    }

    /**
     * Updates an existing TicketType.
     * @param ticketTypeId - The UUID of the ticket type to update.
     * @param updateData - The partial data to update the ticket type with.
     * @returns A promise that resolves to the updated TicketType entity if found, otherwise null.
     */
    static async updateTicketType(
        ticketTypeId: string,
        updateData: Partial<TicketTypeRequestInterface>
    ): Promise<TicketType | null> {
        const ticketType = await this.ticketTypeRepository.findOne({ where: { ticketTypeId } });

        if (!ticketType) {
            return null;
        }

        Object.assign(ticketType, updateData);
        await this.ticketTypeRepository.save(ticketType);
        return ticketType;
    }

    /**
     * Soft deletes a TicketType by setting its deletedAt timestamp.
     * @param ticketTypeId - The UUID of the ticket type to soft delete.
     * @returns A promise that resolves to true if the ticket type was deleted, otherwise false.
     */
    static async deleteTicketType(ticketTypeId: string): Promise<boolean> {
        const ticketType = await this.ticketTypeRepository.findOne({ where: { ticketTypeId } });

        if (!ticketType) {
            return false;
        }

        ticketType.deletedAt = new Date();
        await this.ticketTypeRepository.save(ticketType);
        return true;
    }

    /**
     * Retrieves a single TicketType by its ID and returns it as a response object.
     * @param ticketTypeId - The UUID of the ticket type to retrieve.
     * @returns A promise that resolves to the TicketTypeResponse if found, otherwise null.
     */
    static async getTicketTypeResponseById(ticketTypeId: string): Promise<TicketTypeResponseInterface | null> {
        const ticketType = await this.getTicketTypeById(ticketTypeId);
        return ticketType ? this.convertToResponse(ticketType) : null;
    }

    /**
     * Retrieves all active TicketTypes and returns them as an array of response objects.
     * @returns A promise that resolves to an array of TicketTypeResponse.
     */
    static async getAllTicketTypeResponses(): Promise<TicketTypeResponseInterface[]> {
        const ticketTypes = await this.getAllTicketTypes();
        return ticketTypes.map(this.convertToResponse);
    }

    /**
     * Counts active tickets by category.
     * @returns A promise that resolves to a record of TicketCategory to count.
     */
    static async countTicketsByCategory(): Promise<Record<TicketCategory, number>> {
        const result = await this.ticketTypeRepository.createQueryBuilder("ticketType")
            .select("ticketType.ticketCategory", "category")
            .addSelect("COUNT(ticketType.ticketTypeId)", "count")
            .where("ticketType.deletedAt IS NULL")
            .groupBy("ticketType.ticketCategory")
            .getRawMany();

        const counts: Record<TicketCategory, number> = {} as Record<TicketCategory, number>;
        for (const cat of Object.values(TicketCategory)) {
            counts[cat] = 0;
        }
        result.forEach(row => {
            if (Object.values(TicketCategory).includes(row.category)) {
                counts[row.category as TicketCategory] = parseInt(row.count, 10);
            }
        });
        return counts;
    }
}