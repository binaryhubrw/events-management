// src/services/InvoiceService.ts

import { InvoiceRepository } from '../../repositories/InvoiceRepository'; // Import the static InvoiceRepository class
import { Invoice } from '../../models/Invoice'; // Import Invoice and InvoiceStatus enum
import { AppDataSource } from '../../config/Database'; // Assuming your TypeORM data source is here
import { Repository, DeepPartial } from 'typeorm'; // Import Repository and DeepPartial from TypeORM
import { InvoiceStatus } from '../../interfaces/Enums/InvoiceStatus';

export class InvoiceService {

    // Removed the private instance property and the constructor.
    // Static methods cannot use 'this', so we need a static way to get the repo.

    /**
     * Static getter to get the TypeORM Invoice Repository.
     * This ensures the repository is always accessible to static methods.
     * @returns Repository<Invoice> The TypeORM repository instance for Invoice.
     */
    private static get invoiceTypeOrmRepo(): Repository<Invoice> {
        // AppDataSource.getRepository(Invoice) will return the singleton repository instance.
        return AppDataSource.getRepository(Invoice);
    }

    /**
     * Creates a new invoice.
     * @param invoiceData Partial invoice data.
     * @returns Promise<Invoice> The created invoice.
     */
    static async createInvoice(invoiceData: DeepPartial<Invoice>): Promise<Invoice> {
        // Apply business rules:
        if (!invoiceData.status) {
            invoiceData.status = InvoiceStatus.PENDING; // Set a default status if not provided
        }
        // Placeholder for totalAmount calculation if it's not explicitly provided.
        // In a real app, this might involve fetching related items or registrations.
        if (invoiceData.totalAmount === undefined || invoiceData.totalAmount === null) {
             invoiceData.totalAmount = 0; // Default or calculate based on items/registration
        }

        // Call the static method on InvoiceRepository, passing the TypeORM repo instance
        const newInvoice = await InvoiceRepository.create(InvoiceService.invoiceTypeOrmRepo, invoiceData);
        return newInvoice;
    }

    /**
     * Retrieves an invoice by its ID.
     * @param id The ID of the invoice (UUID string).
     * @returns Promise<Invoice | null> The invoice or null if not found.
     */
    static async getInvoiceById(id: string): Promise<Invoice | null> {
        // Call the static method on InvoiceRepository
        return InvoiceRepository.findById(InvoiceService.invoiceTypeOrmRepo, id);
    }

    /**
     * Retrieves all invoices, with optional filtering and pagination.
     * @param filters Filters for invoices (e.g., userId, status).
     * @returns Promise<Invoice[]> An array of invoices.
     */
    static async getAllInvoices(filters?: {
        skip?: number;
        take?: number;
        userId?: string;
        status?: InvoiceStatus;
    }): Promise<Invoice[]> {
        // Call the static method on InvoiceRepository
        return InvoiceRepository.findAll(InvoiceService.invoiceTypeOrmRepo, filters);
    }

    /**
     * Updates an existing invoice.
     * @param id The ID of the invoice to update (UUID string).
     * @param updateData Partial invoice data to update.
     * @returns Promise<Invoice | null> The updated invoice or null if not found.
     */
    static async updateInvoice(id: string, updateData: DeepPartial<Invoice>): Promise<Invoice | null> {
        // Business logic for updates can go here.
        // Call the static method on InvoiceRepository
        const updatedInvoice = await InvoiceRepository.update(InvoiceService.invoiceTypeOrmRepo, id, updateData);
        return updatedInvoice;
    }

    /**
     * Deletes an invoice by its ID (soft delete).
     * @param id The ID of the invoice to delete (UUID string).
     * @returns Promise<boolean> True if deleted, false if not found.
     */
    static async deleteInvoice(id: string): Promise<boolean> {
        // Call the static method on InvoiceRepository
        return InvoiceRepository.softDelete(InvoiceService.invoiceTypeOrmRepo, id);
    }

    /**
     * Generates an invoice based on registration data (e.g., tickets bought).
     * @param registrationId The ID of the related registration (UUID string).
     * @param userId The ID of the user for whom the invoice is being generated (UUID string).
     * @param eventId The ID of the event the registration is for (UUID string).
     * @param numberOfTickets The number of tickets purchased.
     * @param ticketPrice The price per ticket.
     * @returns Promise<Invoice> The newly generated invoice.
     */
    static async generateInvoiceForRegistration(
        registrationId: string,
        userId: string,
        eventId: string,
        numberOfTickets: number,
        ticketPrice: number
    ): Promise<Invoice> {
        const totalAmount = numberOfTickets * ticketPrice;
        const invoiceData: DeepPartial<Invoice> = {
            registrationId,
            userId,
            eventId,
            totalAmount,
            invoiceDate: new Date(),
            dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
            status: InvoiceStatus.PENDING,
        };

        // Delegate to the createInvoice method within this static service class
        return InvoiceService.createInvoice(invoiceData);
    }

    /**
     * Marks an invoice as paid.
     * @param id The ID of the invoice to mark as paid (UUID string).
     * @param paymentDetails Optional payment transaction details.
     * @returns Promise<Invoice | null> The updated invoice or null if not found.
     */
    static async markInvoiceAsPaid(id: string, paymentDetails?: any): Promise<Invoice | null> {
        const updateData: DeepPartial<Invoice> = {
            status: InvoiceStatus.PAID,
            // Add payment details if your Invoice entity is set up for it
        };
        // Delegate to the updateInvoice method within this static service class
        return InvoiceService.updateInvoice(id, updateData);
    }

    /**
     * Sends an invoice notification (e.g., email to the user).
     * @param invoiceId The ID of the invoice to notify about (UUID string).
     * @returns Promise<boolean> True if notification sent, false otherwise.
     */
    static async sendInvoiceNotification(invoiceId: string): Promise<boolean> {
        // Call static getInvoiceById within this service
        const invoice = await InvoiceService.getInvoiceById(invoiceId);
        if (!invoice) {
            console.warn(`Invoice with ID ${invoiceId} not found for notification.`);
            return false;
        }

        console.log(`Sending invoice notification for Invoice ID: ${invoice.invoiceId} to User ID: ${invoice.userId}`);
        // Integration with an email service or messaging queue would go here.

        return true; // Assume success for now
    }

    /**
     * Calculates and returns the total amount for a set of invoices.
     * @param invoiceIds An array of invoice IDs (UUID strings).
     * @returns Promise<number> The total amount.
     */
    static async calculateTotalAmountForInvoices(invoiceIds: string[]): Promise<number> {
        let total = 0;
        for (const id of invoiceIds) {
            // Call static getInvoiceById within this service
            const invoice = await InvoiceService.getInvoiceById(id);
            if (invoice?.totalAmount) {
                total += invoice.totalAmount;
            }
        }
        return total;
    }
}