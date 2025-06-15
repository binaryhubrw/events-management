import { Repository, FindOneOptions, FindManyOptions } from 'typeorm';
import { AppDataSource } from '../config/Database';
import { Payment } from '../models/Payment';
import { InstallmentPlan } from '../models/InstallmentPlan';
import { PaymentInterface, PaymentRequestInterface } from '../interfaces/PaymentInterface';
import { InstallmentPlanInterface, InstallmentPlanRequestInterface } from '../interfaces/InstallmentPlanInterface';
import { PaymentStatus } from '../interfaces/Enums/PaymentStatusEnum';

/**
 * Concrete implementation of PaymentRepository using TypeORM with static methods.
 */
export class PaymentRepository {
  public static paymentRepo: Repository<Payment> = AppDataSource.getRepository(Payment);
  public static installmentPlanRepo: Repository<InstallmentPlan> = AppDataSource.getRepository(InstallmentPlan);

  // --- Payment Operations ---

  static async findAllPayments(options?: { relations?: string[] }): Promise<PaymentInterface[]> {
    try {
      const findOptions: FindManyOptions<Payment> = {
        relations: options?.relations || [
          'invoice',
          'registration',
          'installmentPlan',
          'event',
          'invoice.event',
          'registration.event',
          'installmentPlan.payments',
          'installmentPlan.invoice',
        ],
      };

      const payments = await this.paymentRepo.find(findOptions);
      return payments.map((p) => PaymentInterface.fromEntity(p));
    } catch (error) {
      throw new Error(`Failed to retrieve payments: ${(error as Error).message}`);
    }
  }

  static async findPaymentById(paymentId: string, options?: { relations?: string[] }): Promise<PaymentInterface | null> {
    try {
      if (!paymentId) throw new Error('paymentId is required');
      const findOptions: FindOneOptions<Payment> = {
        where: { paymentId },
        relations: options?.relations || [
          'invoice',
          'registration',
          'installmentPlan',
          'event',
          'invoice.event',
          'registration.event',
          'installmentPlan.payments',
          'installmentPlan.invoice',
        ],
      };
      const payment = await this.paymentRepo.findOne(findOptions);
      return payment ? PaymentInterface.fromEntity(payment) : null;
    } catch (error) {
      throw new Error(`Failed to retrieve payment with ID ${paymentId}: ${(error as Error).message}`);
    }
  }

  static async findPaymentsByInvoiceId(invoiceId: string): Promise<PaymentInterface[]> {
    try {
      if (!invoiceId) throw new Error('invoiceId is required');
      const payments = await this.paymentRepo.find({
        where: { invoiceId },
        relations: ['invoice', 'registration', 'installmentPlan', 'event'],
      });
      return payments.map((p) => PaymentInterface.fromEntity(p));
    } catch (error) {
      throw new Error(`Failed to retrieve payments for invoice ID ${invoiceId}: ${(error as Error).message}`);
    }
  }

  static async findPaymentsByRegistrationId(registrationId: string): Promise<PaymentInterface[]> {
    try {
      if (!registrationId) throw new Error('registrationId is required');
      const payments = await this.paymentRepo.find({
        where: { registrationId },
        relations: ['invoice', 'registration', 'installmentPlan', 'event'],
      });
      return payments.map((p) => PaymentInterface.fromEntity(p));
    } catch (error) {
      throw new Error(`Failed to retrieve payments for registration ID ${registrationId}: ${(error as Error).message}`);
    }
  }

  static async findPaymentByTxRef(txRef: string): Promise<PaymentInterface | null> {
    try {
      if (!txRef) throw new Error('txRef is required');
      const payment = await this.paymentRepo.findOne({
        where: { txRef },
        relations: ['invoice', 'registration', 'installmentPlan', 'event'],
      });
      return payment ? PaymentInterface.fromEntity(payment) : null;
    } catch (error) {
      throw new Error(`Failed to retrieve payment with txRef ${txRef}: ${(error as Error).message}`);
    }
  }

  static async findPaymentsByStatus(status: PaymentStatus): Promise<PaymentInterface[]> {
    try {
      if (!Object.values(PaymentStatus).includes(status)) {
        throw new Error(`Invalid payment status: ${status}`);
      }
      const payments = await this.paymentRepo.find({
        where: { paymentStatus: status },
        relations: ['invoice', 'registration', 'installmentPlan', 'event'],
      });
      return payments.map((p) => PaymentInterface.fromEntity(p));
    } catch (error) {
      throw new Error(`Failed to retrieve payments with status ${status}: ${(error as Error).message}`);
    }
  }

  static async findPaymentsByEventId(eventId: string): Promise<PaymentInterface[]> {
    try {
      if (!eventId) throw new Error('eventId is required');
      const payments = await this.paymentRepo.find({
        where: { eventId },
        relations: ['invoice', 'registration', 'installmentPlan', 'event'],
      });
      return payments.map((p) => PaymentInterface.fromEntity(p));
    } catch (error) {
      throw new Error(`Failed to retrieve payments for event ID ${eventId}: ${(error as Error).message}`);
    }
  }

  static toPaymentEntity(data: PaymentRequestInterface): Partial<Payment> {
    return {
      paymentId: data.paymentId,
      invoiceId: data.invoiceId,
      registrationId: data.registrationId,
      eventId: data.eventId,
      paymentDate: new Date(data.paymentDate),
      paidAmount: data.paidAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      description: data.description,
      txRef: data.txRef,
      flwRef: data.flwRef,
      isSuccessful: data.isSuccessful ?? false,
      paymentResponse: data.paymentResponse,
      isInstallment: data.isInstallment ?? false,
      installmentNumber: data.installmentNumber,
      installmentPlanId: data.installmentPlanId,
      paidBy: data.paidBy,
      // createdAt, updatedAt, deletedAt are handled by TypeORM
    };
  }

  static async createPayment(paymentData: PaymentRequestInterface): Promise<PaymentInterface> {
    try {
      const errors = PaymentInterface.validate(paymentData as any);
      if (errors.length) throw new Error(`Validation failed: ${errors.join(', ')}`);
      const payment = this.toPaymentEntity(paymentData) as any;
      const newPayment = this.paymentRepo.create(payment);
      const savedPayment = await this.paymentRepo.save(newPayment);
      return PaymentInterface.fromEntity(savedPayment as any);
    } catch (error) {
      throw new Error(`Failed to create payment: ${(error as Error).message}`);
    }
  }

  static async updatePayment(paymentId: string, updateData: Partial<PaymentRequestInterface>): Promise<PaymentInterface | null> {
    try {
      if (!paymentId) throw new Error('paymentId is required');
      const payment = await this.paymentRepo.findOne({ where: { paymentId } });
      if (!payment) return null;
      // Merge the current entity with the update data (in request shape)
      const mergedRequestData = {
        ...PaymentInterface.toRequest(PaymentInterface.fromEntity(payment)),
        ...updateData,
      };
      // Validate the merged request data
      const errors = PaymentInterface.validate(mergedRequestData as any);
      if (errors.length) throw new Error(`Validation failed: ${errors.join(', ')}`);
      // Map the merged request data to the entity shape
      const updatedEntityData = this.toPaymentEntity(mergedRequestData) as any;
      this.paymentRepo.merge(payment, updatedEntityData);
      const savedPayment = await this.paymentRepo.save(payment);
      return PaymentInterface.fromEntity(savedPayment as any);
    } catch (error) {
      throw new Error(`Failed to update payment with ID ${paymentId}: ${(error as Error).message}`);
    }
  }

  static async softDeletePayment(paymentId: string): Promise<void> {
    try {
      if (!paymentId) throw new Error('paymentId is required');
      await this.paymentRepo.softDelete(paymentId);
    } catch (error) {
      throw new Error(`Failed to soft-delete payment with ID ${paymentId}: ${(error as Error).message}`);
    }
  }

  static async hardDeletePayment(paymentId: string): Promise<void> {
    try {
      if (!paymentId) throw new Error('paymentId is required');
      await this.paymentRepo.delete(paymentId);
    } catch (error) {
      throw new Error(`Failed to hard-delete payment with ID ${paymentId}: ${(error as Error).message}`);
    }
  }

  // --- Installment Plan Operations ---

  static async findInstallmentPlanById(planId: string, options?: { relations?: string[] }): Promise<InstallmentPlanInterface | null> {
    try {
      if (!planId) throw new Error('planId is required');
      const findOptions: FindOneOptions<InstallmentPlan> = {
        where: { id: planId },
        relations: options?.relations || [],
      };
      const plan = await this.installmentPlanRepo.findOne(findOptions);
      return plan ? InstallmentPlanInterface.fromEntity(plan) : null;
    } catch (error) {
      throw new Error(`Failed to retrieve installment plan with ID ${planId}: ${(error as Error).message}`);
    }
  }

static async findInstallmentPlansByInvoiceId(invoiceId: string): Promise<InstallmentPlanInterface[]> {
  try {
    if (!invoiceId) throw new Error('invoiceId is required');
    const plans = await this.installmentPlanRepo.find({
      where: { invoiceId },
      relations: [],
    });
    const result = plans.map(item => InstallmentPlanInterface.fromEntity(item as any)) as any;
    return result;
  } catch (error) {
    throw new Error(`Failed to retrieve installment plans for invoice ID ${invoiceId}: ${(error as Error).message}`);
  }
}
static async createInstallmentPlan(planData: InstallmentPlanRequestInterface): Promise<InstallmentPlanInterface> {
  try {
    const plan = InstallmentPlanRequestInterface.toEntity(planData);
    const errors = InstallmentPlanInterface.validate(plan);
    if (errors.length) throw new Error(`Validation failed: ${errors.join(', ')}`);
    const newPlan = this.installmentPlanRepo.create(plan);
    const savedPlan = await this.installmentPlanRepo.save(newPlan);
    const result = InstallmentPlanInterface.fromEntity(savedPlan);
    if (!result) throw new Error('Failed to map saved plan to interface');
return (InstallmentPlanInterface.fromEntity(savedPlan as any) as any) as InstallmentPlanInterface;

  } catch (error) {
    throw new Error(`Failed to create installment plan: ${(error as Error).message}`);
  }
}


  static async softDeleteInstallmentPlan(planId: string): Promise<void> {
    try {
      if (!planId) throw new Error('planId is required');
      await this.installmentPlanRepo.softDelete(planId);
    } catch (error) {
      throw new Error(`Failed to soft-delete installment plan with ID ${planId}: ${(error as Error).message}`);
    }
  }

  static async hardDeleteInstallmentPlan(planId: string): Promise<void> {
    try {
      if (!planId) throw new Error('planId is required');
      await this.installmentPlanRepo.delete(planId);
    } catch (error) {
      throw new Error(`Failed to hard-delete installment plan with ID ${planId}: ${(error as Error).message}`);
    }
  }
}