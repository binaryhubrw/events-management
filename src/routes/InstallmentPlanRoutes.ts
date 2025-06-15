import { RequestHandler, Router } from 'express';
import { InstallmentController } from '../controller/InstallmentController';

const router = Router();

router.post('/installment-plans', (req, res) => InstallmentController.createInstallmentPlan(req, res));

//@ts-check
router.get('/installment-plans/invoice/:invoiceId', (req, res) => InstallmentController.getInstallmentPlansByInvoiceId(req, res));
router.get('/installment-plans', (req, res) => InstallmentController.getAllInstallmentPlans(req, res));
router.put('/installment-plans/:id', (req, res) => InstallmentController.updateInstallmentPlan(req, res));
router.delete('/installment-plans/:id', (req, res) => InstallmentController.deleteInstallmentPlan(req, res));
export default router;
