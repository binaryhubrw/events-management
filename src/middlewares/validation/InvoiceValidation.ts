// src/validation/InvoiceValidator.ts

import { body, param, ValidationChain } from 'express-validator';
import { InvoiceStatus } from '../../interfaces/Enums/InvoiceStatus';

/**
 * Custom validator for UUIDs
 * This regex looks correct for UUID v4.
 */
const isUUIDv4 = (message?: string) => (value: string) => {
    // Corrected regex to be more robust, ensuring it's exactly 36 characters for v4.
    // The pattern 4[0-9a-fA-F]{3} correctly validates the version 4 bit.
    // The pattern [89abAB][0-9a-fA-F]{3} correctly validates the variant bit.
    if (!value || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value)) {
        throw new Error(message || 'ID must be a valid UUID v4 string.');
    }
    return true;
};

/**
 * Validation rules for creating a new invoice.
 */
export const createInvoiceValidation: ValidationChain[] = [
    // Good practice: invoiceId is generated, not provided by client.

    body('eventId')
        .exists()
        .withMessage('Event ID is required.')
        .bail()
        .custom(isUUIDv4('Event ID must be a valid UUID v4 string.')),

    body('userId')
        .exists()
        .withMessage('User ID is required.')
        .bail()
        .custom(isUUIDv4('User ID must be a valid UUID v4 string.')),

    body('invoiceDate')
        .isISO8601()
        .withMessage('Invoice date must be a valid ISO 8601 date string (e.g., YYYY-MM-DDTHH:mm:ssZ).')
        .custom((value: string) => {
            // This is good. Invoice date usually shouldn't be in the future.
            if (new Date(value) > new Date()) {
                throw new Error('Invoice date cannot be in the future.');
            }
            return true;
        }),

    body('dueDate')
        .isISO8601()
        .withMessage('Due date must be a valid ISO 8601 date string (e.g., YYYY-MM-DDTHH:mm:ssZ).')
        .custom((value: string, { req }) => {
            // Ensures due date is not in the past relative to current time.
            if (new Date(value) < new Date()) {
                throw new Error('Due date cannot be in the past.');
            }
            // More robust: ensure dueDate is after invoiceDate if both are provided
            if (req.body.invoiceDate) {
                const invoiceDate = new Date(req.body.invoiceDate);
                const dueDate = new Date(value);
                if (dueDate < invoiceDate) {
                    throw new Error('Due date cannot be before invoice date.');
                }
            }
            return true;
        }),

    body('totalAmount')
        .isFloat({ gt: 0 })
        .withMessage('Total amount must be a positive number.'),

    body('status')
        .optional() // Correct, as the service sets PENDING by default
        .isIn(Object.values(InvoiceStatus)) // Validates against your enum values
        .withMessage(`Invalid invoice status. Must be one of: ${Object.values(InvoiceStatus).join(', ')}.`),

    body('registrationId')
        .optional()
        .custom(isUUIDv4('Registration ID must be a valid UUID v4 string.')),
];

/**
 * Validation rules for updating an existing invoice.
 */
export const updateInvoiceValidation: ValidationChain[] = [
    param('id') // Correctly validates the ID from the URL parameter
        .exists()
        .withMessage('Invoice ID is required in parameters.')
        .bail()
        .custom(isUUIDv4('Invoice ID in parameters must be a valid UUID v4 string.')),

    // All body fields are optional, which is correct for a PATCH/partial update.
    body('eventId')
        .optional()
        .custom(isUUIDv4('Event ID must be a valid UUID v4 string.')),

    body('userId')
        .optional()
        .custom(isUUIDv4('User ID must be a valid UUID v4 string.')),

    body('invoiceDate')
        .optional()
        .isISO8601()
        .withMessage('Invoice date must be a valid ISO 8601 date string (e.g., YYYY-MM-DDTHH:mm:ssZ).')
        .custom((value: string) => {
            if (new Date(value) > new Date()) {
                throw new Error('Invoice date cannot be in the future.');
            }
            return true;
        }),

    body('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid ISO 8601 date string (e.g., YYYY-MM-DDTHH:mm:ssZ).')
        .custom((value: string, { req }) => {
            if (new Date(value) < new Date()) {
                throw new Error('Due date cannot be in the past.');
            }
            // If invoiceDate is also being updated or is already present, ensure consistency
            if (req.body.invoiceDate) {
                const invoiceDate = new Date(req.body.invoiceDate);
                const dueDate = new Date(value);
                if (dueDate < invoiceDate) {
                    throw new Error('Due date cannot be before invoice date.');
                }
            }
            return true;
        }),

    body('totalAmount')
        .optional()
        .isFloat({ gt: 0 })
        .withMessage('Amount must be a positive number.'),

    body('status')
        .optional()
        .isIn(Object.values(InvoiceStatus))
        .withMessage(`Invalid invoice status. Must be one of: ${Object.values(InvoiceStatus).join(', ')}.`),

    body('registrationId')
        .optional()
        .custom(isUUIDv4('Registration ID must be a valid UUID v4 string.')),

    // Added validation for paymentDetails if you expect it in the update payload for mark as paid
    body('paymentDetails')
        .optional()
        .isObject()
        .withMessage('Payment details must be an object.')
        .bail()
        .custom((value: any) => {
            if (value && typeof value.transactionId !== 'string') {
                throw new Error('paymentDetails.transactionId must be a string.');
            }
            if (value && typeof value.amountPaid !== 'number' && typeof value.amountPaid !== 'undefined') {
                throw new Error('paymentDetails.amountPaid must be a number.');
            }
            if (value && typeof value.method !== 'string' && typeof value.method !== 'undefined') {
                throw new Error('paymentDetails.method must be a string.');
            }
            if (value && value.paidAt && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(value.paidAt)) {
                throw new Error('paymentDetails.paidAt must be a valid ISO 8601 date string.');
            }
            return true;
        }),
];

/**
 * Validation rules for getting a single invoice by ID.
 */
export const getInvoiceByIdValidation: ValidationChain[] = [
    param('id')
        .exists()
        .withMessage('Invoice ID is required in parameters.')
        .bail()
        .custom(isUUIDv4('Invoice ID must be a valid UUID v4 string.')),
];

/**
 * Validation rules for deleting an invoice by ID.
 * This is effectively the same as getInvoiceByIdValidation for just the ID check.
 */
export const deleteInvoiceValidation: ValidationChain[] = [
    param('id')
        .exists()
        .withMessage('Invoice ID is required in parameters for deletion.')
        .bail()
        .custom(isUUIDv4('Invoice ID must be a valid UUID v4 string.')),
];

/**
 * Validation rules for marking an invoice as paid.
 * This can be simple if only the ID is needed, or more complex if payment details are expected.
 */
export const markInvoiceAsPaidValidation: ValidationChain[] = [
    param('id')
        .exists()
        .withMessage('Invoice ID is required in parameters.')
        .bail()
        .custom(isUUIDv4('Invoice ID must be a valid UUID v4 string.')),
    
    // Optional: If you expect payment details to be passed in the body for mark-paid endpoint
    body('paymentDetails')
        .optional()
        .isObject()
        .withMessage('Payment details must be an object.')
        .bail()
        .custom((value: any) => {
            if (value && typeof value.transactionId !== 'string') {
                throw new Error('paymentDetails.transactionId must be a string.');
            }
            if (value && typeof value.amountPaid !== 'number' && typeof value.amountPaid !== 'undefined') {
                throw new Error('paymentDetails.amountPaid must be a number.');
            }
            if (value && typeof value.method !== 'string' && typeof value.method !== 'undefined') {
                throw new Error('paymentDetails.method must be a string.');
            }
            if (value && value.paidAt && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(value.paidAt)) {
                throw new Error('paymentDetails.paidAt must be a valid ISO 8601 date string.');
            }
            return true;
        }),
];