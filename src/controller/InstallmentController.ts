import { Request, Response } from 'express';
import { InstallmentPlanRepository } from '../repositories/InstallmentPlanRepository';

export const InstallmentController = {
  createInstallmentPlan: async (req: Request, res: Response): Promise<void> => {
    try {
      // Manual validation
      const { invoiceId, totalAmount, numberOfInstallments } = req.body;
      if (!invoiceId) {
         res.status(400).json({ success: false, message: 'Invoice ID is required' });
      }
      if (!totalAmount || isNaN(totalAmount) || Number(totalAmount) <= 0) {
         res.status(400).json({ success: false, message: 'Total amount must be a positive number' });
      }
      if (!numberOfInstallments || isNaN(numberOfInstallments) || Number(numberOfInstallments) < 1) {
         res.status(400).json({ success: false, message: 'Number of installments must be at least 1' });
      }

      // Create installment plan
      const plan = await InstallmentPlanRepository.createInstallmentPlan(req.body);
      res.status(201).json({ success: true, plan });
    } catch (error: any) {
      console.error('Error in createInstallmentPlan:', error);
      res.status(400).json({
        success: false,
        message: error.message,
        line: error.stack?.split('\n')[1]?.trim(),
      });
    }
  },

  getInstallmentPlanById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
         res.status(400).json({ success: false, message: 'Installment plan ID is required' });
      }

      const plan = await InstallmentPlanRepository.getInstallmentPlanById(id);
      if (!plan) {
         res.status(404).json({ success: false, message: 'Installment plan not found' });
      }
      res.json({ success: true, plan });
    } catch (error: any) {
      console.error('Error in getInstallmentPlanById:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  getInstallmentPlansByInvoiceId: async (req: Request, res: Response): Promise<void> => {
    try {
      const { invoiceId } = req.params;
      if (!invoiceId) {
         res.status(400).json({ success: false, message: 'Invoice ID is required' });
      }

      const plans = await InstallmentPlanRepository.getInstallmentPlansByInvoiceId(invoiceId);
      res.json({ success: true, plans });
    } catch (error: any) {
      console.error('Error in getInstallmentPlansByInvoiceId:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  getAllInstallmentPlans: async (req: Request, res: Response): Promise<void> => {
    try {
      const plans = await InstallmentPlanRepository.getAllInstallmentPlans();
      res.json({ success: true, plans });
    } catch (error: any) {
      console.error('Error in getAllInstallmentPlans:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  deleteInstallmentPlan: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
         res.status(400).json({ success: false, message: 'Installment plan ID is required' });
      }

      const deleted = await InstallmentPlanRepository.deleteInstallmentPlan(id);
      if (!deleted) {
         res.status(404).json({ success: false, message: 'Installment plan not found' });
      }
      res.json({ success: true, message: 'Installment plan deleted' });
    } catch (error: any) {
      console.error('Error in deleteInstallmentPlan:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  updateInstallmentPlan: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
         res.status(400).json({ success: false, message: 'Installment plan ID is required' });
      }

      const plan = await InstallmentPlanRepository.updateInstallmentPlan(id, req.body);
      if (!plan) {
         res.status(404).json({ success: false, message: 'Installment plan not found' });
      }
      res.json({ success: true, plan });
    } catch (error: any) {
      console.error('Error in updateInstallmentPlan:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },
};
