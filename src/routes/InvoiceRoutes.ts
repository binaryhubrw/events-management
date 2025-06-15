// src/routes/InvoiceRoutes.ts
import { Router } from 'express';
import { InvoiceController } from '../controller/InvoiceController';
import { 
    createInvoiceValidation,
    getInvoiceByIdValidation,
    updateInvoiceValidation,
    markInvoiceAsPaidValidation,
    deleteInvoiceValidation 
} from '../middlewares/validation/InvoiceValidation';

const router = Router();

// POST /api/invoices - Create a new invoice
router.post(
    '/',
    createInvoiceValidation,
    InvoiceController.createInvoice
);

// GET /api/invoices/:id - Retrieve an invoice by ID
// Pattern removed: now simply expects :id
router.get(
    '/:id', 
    getInvoiceByIdValidation,
    InvoiceController.getInvoiceById
);

// GET /api/invoices - Retrieve all invoices (with optional filters)
router.get(
    '/',
    InvoiceController.getAllInvoices
);

// PATCH /api/invoices/:id - Update an existing invoice
// Pattern removed: now simply expects :id
router.patch(
    '/:id', 
    updateInvoiceValidation,
    InvoiceController.updateInvoice
);

// DELETE /api/invoices/:id - Delete an invoice (soft delete)
// Pattern removed: now simply expects :id
router.delete(
    '/:id', 
    deleteInvoiceValidation,
    InvoiceController.deleteInvoice
);

// POST /api/invoices/:id/mark-paid - Mark an invoice as paid
// Pattern removed: now simply expects :id
router.post(
    '/:id/mark-paid', 
    markInvoiceAsPaidValidation,
    InvoiceController.markInvoiceAsPaid
);

// POST /api/invoices/:id/send-notification - Send invoice notification
// Pattern removed: now simply expects :id
router.post(
    '/:id/send-notification', 
    getInvoiceByIdValidation,
    InvoiceController.sendInvoiceNotification
);

export default router;