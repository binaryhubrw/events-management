// src/controllers/InvoiceController.ts

import { Request, Response, NextFunction } from 'express';
import { InvoiceService } from '../services/invoice/InvoiceService'; // Assuming InvoiceService also has static methods
import { InvoiceStatus } from '../interfaces/Enums/InvoiceStatus';

export class InvoiceController {

    // Removed the constructor as all methods will be static and won't use 'this.invoiceService'

    /**
     * Handles POST request to create a new invoice.
     * @param req Express Request object.
     * @param res Express Response object.
     * @param next Express NextFunction for error propagation.
     */
    static async createInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Data is already validated by InvoiceValidator middleware before reaching here
            const newInvoice = await InvoiceService.createInvoice(req.body); // Call static service method
            res.status(201).json(newInvoice);
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Handles GET request to retrieve an invoice by ID.
     * @param req Express Request object.
     * @param res Express Response object.
     * @param next Express NextFunction for error propagation.
     */
    static async getInvoiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const invoiceId: string = req.params.id; // ID is a UUID string
            const invoice = await InvoiceService.getInvoiceById(invoiceId); // Call static service method

            if (!invoice) {
                res.status(404).json({ message: 'Invoice not found' });
                return;
            }
            res.status(200).json(invoice);
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Handles GET request to retrieve all invoices.
     * @param req Express Request object (can include query params for filtering/pagination).
     * @param res Express Response object.
     * @param next Express NextFunction for error propagation.
     */
    static async getAllInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = {
                userId: req.query.userId ? (req.query.userId as string) : undefined,
                status: req.query.status ? (req.query.status as InvoiceStatus) : undefined,
                skip: req.query.skip ? parseInt(req.query.skip as string, 10) : undefined,
                take: req.query.take ? parseInt(req.query.take as string, 10) : undefined,
            };
            const invoices = await InvoiceService.getAllInvoices(filters); // Call static service method
            res.status(200).json(invoices);
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Handles PUT/PATCH request to update an existing invoice.
     * @param req Express Request object.
     * @param res Express Response object.
     * @param next Express NextFunction for error propagation.
     */static async updateInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const invoiceId: string = req.params.id;
        const existingInvoice = await InvoiceService.getInvoiceById(invoiceId);

        if (!existingInvoice) {
             res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        // Prevent changing unique fields causing conflicts
        if (req.body.invoiceId && req.body.invoiceId !== existingInvoice?.invoiceId ) {
             res.status(400).json({ success: false, message: 'Cannot modify invoiceId due to unique constraint.' });
        }

        const updatedInvoice = await InvoiceService.updateInvoice(invoiceId, req.body);
        res.status(200).json({ success: true, invoice: updatedInvoice });

    } catch (error: any) {
        console.error('Error in updateInvoice:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}


    /**
     * Handles DELETE request to delete an invoice by ID.
     * @param req Express Request object.
     * @param res Express Response object.
     * @param next Express NextFunction for error propagation.
     */
    static async deleteInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const invoiceId: string = req.params.id; // ID is a UUID string
            const success = await InvoiceService.deleteInvoice(invoiceId); // Call static service method

            if (!success) {
                res.status(404).json({ message: 'Invoice not found' });
                return;
            }
            res.status(204).send(); // 204 No Content for successful deletion
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Handles POST request to mark an invoice as paid.
     * @param req Express Request object.
     * @param res Express Response object.
     * @param next Express NextFunction for error propagation.
     */
    static async markInvoiceAsPaid(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const invoiceId: string = req.params.id; // ID is a UUID string
            const updatedInvoice = await InvoiceService.markInvoiceAsPaid(invoiceId, req.body.paymentDetails); // Call static service method

            if (!updatedInvoice) {
                res.status(404).json({ message: 'Invoice not found or could not be marked as paid' });
                return;
            }
            res.status(200).json(updatedInvoice);
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Handles POST request to send an invoice notification.
     * @param req Express Request object.
     * @param res Express Response object.
     * @param next Express NextFunction for error propagation.
     */
    static async sendInvoiceNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const invoiceId: string = req.params.id; // ID is a UUID string
            const success = await InvoiceService.sendInvoiceNotification(invoiceId); // Call static service method

            if (!success) {
                res.status(400).json({ message: 'Failed to send invoice notification' });
                return;
            }
            res.status(200).json({ message: 'Invoice notification sent successfully' });
        } catch (error: any) {
            next(error);
        }
    }
}