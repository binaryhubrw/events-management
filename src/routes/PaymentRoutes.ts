import { Router } from 'express';
import { PaymentController } from '../controller/PaymentController';

const router = Router();
const paymentController = new PaymentController();

// Get a payment by ID
router.get('/:paymentId', (req, res) => paymentController.getPayment(req, res));

// Create a new payment
router.post('/', (req, res) => paymentController.createPayment(req, res));

// Get payments by status
router.get('/status/:status', (req, res) => paymentController.getPaymentsByStatus(req, res));

// Create an installment plan
router.post('/installment-plans', (req, res) => paymentController.createInstallmentPlan(req, res));

// (Optional) Get all payments (if you implemented getAllPayments in your controller/service)
if (typeof paymentController.getAllPayments === 'function') {
    router.get('/', (req, res) => paymentController.getAllPayments!(req, res));
}

export default router;