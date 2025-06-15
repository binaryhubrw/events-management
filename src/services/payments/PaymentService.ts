import { PaymentRepository } from '../../repositories/PaymentRepository';
import { PaymentStatus } from '../../interfaces/Enums/PaymentStatusEnum';

export class PaymentService {
    /**
     * Example method using the repository
     */
   async getPaymentById(paymentId: string) {
    try {
        const payment = await PaymentRepository.findPaymentById(paymentId, { relations: ['invoice', 'registration', 'event'] });
        if (!payment) throw new Error(`Payment with ID ${paymentId} not found`);
        return payment;
    } catch (error) {
        console.error('Error in PaymentService.getPaymentById:', error);
        throw error;
    }
}


    /**
     * Example method for creating a payment
     */
    async createNewPayment(paymentData: {
        invoiceId: string;
        registrationId?: string;
        paymentDate: string;
        paidAmount: number;
        paymentMethod: string;
        paymentStatus: string;
        description?: string;
        txRef?: string;
        flwRef?: string;
        isSuccessful?: boolean;
        isInstallment?: boolean;
        installmentNumber?: number;
        installmentPlanId?: string;
        paidBy?: string;
    }) {
        try {
            // 1. Fetch the installment plan (if any)
            let plan = null;
            if (paymentData.installmentPlanId) {
                plan = await PaymentRepository.findInstallmentPlanById(paymentData.installmentPlanId);
                if (!plan) throw new Error('Installment plan not found');
            }

            // 2. Fetch all payments for this invoice/plan
            const payments = await PaymentRepository.findPaymentsByInvoiceId(paymentData.invoiceId);
            const planPayments = paymentData.installmentPlanId
                ? payments.filter(p => p.installmentPlanId === paymentData.installmentPlanId)
                : payments;

            // 3. Calculate total paid and remaining
            const totalPaid = planPayments.reduce((sum, p) => sum + Number(p.paidAmount), 0);
            const totalAmount = plan ? Number(plan.totalAmount) : planPayments[0]?.paidAmount || 0;
            const numberOfInstallments = plan ? plan.numberOfInstallments : 1;
            const remainingAmount = totalAmount - totalPaid;

            // 4. Check if all installments are paid
            if (planPayments.length >= numberOfInstallments) {
                throw new Error('You are not allowed to pay again this invoice, no reversal, etc.');
            }

            // 5. If this payment exceeds the remaining amount, adjust or throw error
            if (paymentData.paidAmount > remainingAmount) {
                throw new Error(`You cannot pay more than the remaining amount (${remainingAmount})`);
            }

            // 6. Save the payment
            const newPayment = await PaymentRepository.createPayment(paymentData as any);

            // 7. Calculate new remaining amount and remaining transactions
            const newTotalPaid = totalPaid + paymentData.paidAmount;
            const newRemainingAmount = totalAmount - newTotalPaid;
            const newRemainingTransactions = numberOfInstallments - (planPayments.length + 1);

            return {
                payment: newPayment,
                remainingAmount: newRemainingAmount,
                remainingTransactions: newRemainingTransactions < 0 ? 0 : newRemainingTransactions,
                message: newRemainingTransactions === 0
                    ? 'All installments paid. No further payments allowed.'
                    : 'Payment successful. You can continue paying remaining installments.'
            };
        } catch (error) {
            console.error('Error in PaymentService.createNewPayment:', error);
            throw error;
        }
    }

    /**
     * Example method for getting payments by status
     */
    async getPaymentsByStatus(status: PaymentStatus) {
        try {
            return await PaymentRepository.findPaymentsByStatus(status);
        } catch (error) {
            console.error('Error in PaymentService.getPaymentsByStatus:', error);
            throw error;
        }
    }

    /**
     * Example method for creating an installment plan
     */
    async createInstallmentPlan(planData: {
        invoiceId: string;
        totalAmount: number;
        numberOfInstallments: number;
        completedInstallments?: number;
        isCompleted?: boolean;
    }) {
        try {
            return await PaymentRepository.createInstallmentPlan(planData as any);
        } catch (error) {
            console.error('Error in PaymentService.createInstallmentPlan:', error);
            throw error;
        }
    }
 async getAllPayments(relations?: string[]) {
    return await PaymentRepository.findAllPayments({ 
        relations: ['invoice', 'registration', 'event'] 
    });
}

}