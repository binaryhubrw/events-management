import { Request, Response } from 'express';
import { PaymentService } from '../services/payments/PaymentService';
import { PaymentStatus } from '../interfaces/Index';

export class PaymentController {
    private paymentService: PaymentService;

    constructor() {
        this.paymentService = new PaymentService();
    }

    async getPayment(req: Request, res: Response) {
        try {
            const { paymentId } = req.params;
            const payment = await this.paymentService.getPaymentById(paymentId);
            res.json(payment);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    async createPayment(req: Request, res: Response) {
        try {
            const paymentData = req.body;
            const payment = await this.paymentService.createNewPayment(paymentData);
            res.status(201).json(payment);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getPaymentsByStatus(req: Request, res: Response) {
        try {
            const { status } = req.params;
            const payments = await this.paymentService.getPaymentsByStatus(status as PaymentStatus);
            res.json(payments);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async createInstallmentPlan(req: Request, res: Response) {
        try {
            const planData = req.body;
            const plan = await this.paymentService.createInstallmentPlan(planData);
            res.status(201).json(plan);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAllPayments(req: Request, res: Response) {
        try {
            // Optionally accept relations as query param
            const relations = req.query.relations ? (req.query.relations as string).split(',') : undefined;
            // You need to add this method to your PaymentService if not present
            const payments = await this.paymentService.getAllPayments(relations);
            res.json(payments);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}