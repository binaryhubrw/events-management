import { 
    InstallmentPlanInterface, 
    InstallmentPlanRequestInterface, 
    PaymentInterface, 
    PaymentRequestInterface,
    PaymentStatus 
} from "../Index";

export interface CreatePaymentRequestInterface extends Omit<PaymentRequestInterface, 'paymentId' | 'isSuccessful' | 'isInstallment'> {
    isSuccessful?: boolean;
    isInstallment?: boolean;
}

export interface UpdatePaymentRequestInterface extends Partial<PaymentRequestInterface> {}

export interface InstallmentPaymentRepositoryInterface {
    // --- Payment Operations ---
    findAllPayments(options?: { relations?: string[] }): Promise<PaymentInterface[]>;
    findPaymentById(paymentId: string, options?: { relations?: string[] }): Promise<PaymentInterface | null>;
    findPaymentsByInvoiceId(invoiceId: string, options?: { relations?: string[] }): Promise<PaymentInterface[]>;
    findPaymentsByRegistrationId(registrationId: string, options?: { relations?: string[] }): Promise<PaymentInterface[]>;
    findPaymentByTxRef(txRef: string): Promise<PaymentInterface | null>;
    findPaymentsByStatus(status: PaymentStatus): Promise<PaymentInterface[]>;
    findPaymentsByEventId(eventId: string, options?: { relations?: string[] }): Promise<PaymentInterface[]>;
    createPayment(paymentData: CreatePaymentRequestInterface): Promise<PaymentInterface>;
    updatePayment(paymentId: string, updateData: UpdatePaymentRequestInterface): Promise<PaymentInterface | null>;
    softDeletePayment(paymentId: string): Promise<boolean>;
    hardDeletePayment(paymentId: string): Promise<void>;

    // --- Installment Plan Operations ---
    findInstallmentPlanById(planId: string, options?: { relations?: string[] }): Promise<InstallmentPlanInterface | null>;
    findInstallmentPlansByInvoiceId(invoiceId: string, options?: { relations?: string[] }): Promise<InstallmentPlanInterface[]>;
    createInstallmentPlan(planData: InstallmentPlanRequestInterface): Promise<InstallmentPlanInterface>;
    updateInstallmentPlan(planId: string, updateData: Partial<InstallmentPlanRequestInterface>): Promise<InstallmentPlanInterface | null>;
    softDeleteInstallmentPlan(planId: string): Promise<boolean>;
    hardDeleteInstallmentPlan(planId: string): Promise<void>;
}
