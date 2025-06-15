// src/repositories/InvoiceRepository.ts
import { Repository, FindManyOptions, FindOneOptions, DeepPartial } from 'typeorm';
import { Invoice } from '../models/Invoice';
import { InvoiceStatus } from '../interfaces/Enums/InvoiceStatus';

export class InvoiceRepository {

    // Removed the constructor because static methods don't use `this.invoiceRepository`

    /**
     * Finds an invoice by its ID.
     * @param repo The TypeORM Repository instance for Invoice.
     * @param id The ID of the invoice.
     * @returns Promise<Invoice | null> The found invoice or null if not found.
     * @throws Error If ID format is invalid.
     */
    static async findById(repo: Repository<Invoice>, id: string): Promise<Invoice | null> {
        if (!id || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id)) {
            throw new Error('Internal Error: Invalid invoice ID format provided to repository.');
        }
        const options: FindOneOptions<Invoice> = {
            where: { invoiceId: id },
            relations: ['event', 'user', 'payments', 'registration']
        };
        return repo.findOne(options);
    }

    /**
     * Finds all invoices, optionally with pagination and filtering.
     * @param repo The TypeORM Repository instance for Invoice.
     * @param options Filtering and pagination options.
     * @returns Promise<Invoice[]> An array of invoices.
     * @throws Error If filter IDs/statuses are invalid.
     */
    static async findAll(repo: Repository<Invoice>, options?: {
        skip?: number;
        take?: number;
        userId?: string;
        status?: InvoiceStatus;
    }): Promise<Invoice[]> {
        const findOptions: FindManyOptions<Invoice> = {
            skip: options?.skip,
            take: options?.take,
            relations: ['event', 'user', 'payments', 'registration'],
            order: { createdAt: 'DESC' }
        };

        const where: any = {};
        if (options?.userId) {
            if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(options.userId)) {
                throw new Error('Internal Error: Invalid user ID format provided for filter.');
            }
            where.userId = options.userId;
        }
        if (options?.status) {
            if (!Object.values(InvoiceStatus).includes(options.status)) {
                throw new Error(`Internal Error: Invalid invoice status '${options.status}' provided for filter.`);
            }
            where.status = options.status;
        }
        findOptions.where = where;

        return repo.find(findOptions);
    }

    /**
     * Saves a new invoice.
     * @param repo The TypeORM Repository instance for Invoice.
     * @param invoiceData The invoice data to save (assumed to be validated).
     * @returns Promise<Invoice> The saved invoice.
     */
    static async create(repo: Repository<Invoice>, invoiceData: DeepPartial<Invoice>): Promise<Invoice> {
        const newInvoice = repo.create(invoiceData);
        return repo.save(newInvoice);
    }

    /**
     * Updates an invoice by its ID.
     * @param repo The TypeORM Repository instance for Invoice.
     * @param id The ID of the invoice to update (assumed to be validated).
     * @param updateData The data to update (assumed to be validated).
     * @returns Promise<Invoice | null> The updated invoice or null if not found.
     */
    static async update(repo: Repository<Invoice>, id: string, updateData: DeepPartial<Invoice>): Promise<Invoice | null> {
        if (!id || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id)) {
            throw new Error('Internal Error: Invalid invoice ID format provided for update.');
        }

        const existingInvoice = await repo.findOne({ where: { invoiceId: id } });
        if (!existingInvoice) {
            return null;
        }

        const mergedInvoice = repo.merge(existingInvoice, updateData);

        await repo.save(mergedInvoice);
        return mergedInvoice;
    }

    /**
     * Deletes an invoice by its ID (soft delete).
     * @param repo The TypeORM Repository instance for Invoice.
     * @param id The ID of the invoice to delete (assumed to be validated).
     * @returns Promise<boolean> True if deleted, false if not found.
     */
     /**
     * Deletes an invoice by its ID (soft delete).
     * @param repo The TypeORM Repository instance for Invoice.
     * @param id The ID of the invoice to delete (assumed to be validated).
     * @returns Promise<boolean> True if deleted, false if not found.
     * @throws Error If ID format is invalid.
     */
    static async softDelete(repo: Repository<Invoice>, id: string): Promise<boolean> {
        if (!id || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id)) {
            throw new Error('Internal Error: Invalid invoice ID format provided for delete.');
        }

        const result = await repo.softDelete(id); // This returns DeleteResult

        // Corrected return: Handle 'affected' possibly being undefined
        // We use the nullish coalescing operator (??) to default to 0 if affected is undefined,
        // then check if it's greater than 0.
        return (result.affected ?? 0) > 0;

    }
    /**
     * Finds invoices associated with a specific user (recipient/creator).
     * @param repo The TypeORM Repository instance for Invoice.
     * @param userId The ID of the user (assumed to be validated).
     * @returns Promise<Invoice[]> An array of invoices for the user.
     */
    static async findByUserId(repo: Repository<Invoice>, userId: string): Promise<Invoice[]> {
        if (!userId || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(userId)) {
            throw new Error('Internal Error: Invalid user ID format provided to findByUserId.');
        }
        return repo.find({ where: { userId }, relations: ['event', 'user', 'payments', 'registration'] });
    }

    /**
     * Finds invoices by their status.
     * @param repo The TypeORM Repository instance for Invoice.
     * @param status The status of the invoices (assumed to be validated).
     * @returns Promise<Invoice[]> An array of invoices with the given status.
     */
    static async findByStatus(repo: Repository<Invoice>, status: InvoiceStatus): Promise<Invoice[]> {
        if (!Object.values(InvoiceStatus).includes(status)) {
            throw new Error(`Internal Error: Invalid invoice status '${status}' provided to findByStatus.`);
        }
        return repo.find({ where: { status }, relations: ['event', 'user', 'payments', 'registration'] });
    }

    /**
     * Gets the total count of invoices.
     * @param repo The TypeORM Repository instance for Invoice.
     * @param options Optional filtering criteria.
     * @returns Promise<number> The total count of invoices.
     */
    static async count(repo: Repository<Invoice>, options?: { userId?: string; status?: InvoiceStatus; }): Promise<number> {
        const where: any = {};
        if (options?.userId) {
            if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(options.userId)) {
                throw new Error('Internal Error: Invalid user ID format provided for count filter.');
            }
            where.userId = options.userId;
        }
        if (options?.status) {
            if (!Object.values(InvoiceStatus).includes(options.status)) {
                throw new Error(`Internal Error: Invalid invoice status '${options.status}' provided for count filter.`);
            }
            where.status = options.status;
        }
        return repo.count({ where });
    }
}