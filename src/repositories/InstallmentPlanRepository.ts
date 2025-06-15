import { AppDataSource } from '../config/Database';
import { Repository } from 'typeorm';
import { InstallmentPlan } from '../models/InstallmentPlan';

export class InstallmentPlanRepository {
  private static repo: Repository<InstallmentPlan> = AppDataSource.getRepository(InstallmentPlan);

  static async createInstallmentPlan(data: Partial<InstallmentPlan>): Promise<InstallmentPlan> {
    if (!data) throw new Error('Installment plan data is required');
    
    const plan = this.repo.create(data);
    return await this.repo.save(plan);
  }

  static async getInstallmentPlanById(id: string): Promise<InstallmentPlan | null> {
  if (!id) throw new Error('Installment plan ID is required');
  
  const plan = await this.repo.findOne({
  where: { id },
  relations: ['payments', 'payments.invoice', 'payments.registration', 'payments.event']
  });
  return plan || null;
  }
  
  static async getInstallmentPlansByInvoiceId(invoiceId: string): Promise<InstallmentPlan[]> {
  if (!invoiceId) throw new Error('Invoice ID is required');
  
  const plans = await this.repo.find({
  where: { invoiceId },
  relations: ['payments', 'payments.invoice', 'payments.registration', 'payments.event']
  });
  return plans.length ? plans : [];
  }
  
  static async getAllInstallmentPlans(): Promise<InstallmentPlan[]> {
  const plans = await this.repo.find({
  relations: ['payments', 'payments.invoice', 'payments.registration', 'payments.event']
  });
  return plans.length ? plans : [];
  }

  static async updateInstallmentPlan(id: string, data: Partial<InstallmentPlan>): Promise<InstallmentPlan | null> {
    if (!id) throw new Error('Installment plan ID is required');
    if (!data || Object.keys(data).length === 0) throw new Error('Update data cannot be empty');

    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) return null;

    Object.assign(plan, data);
    return await this.repo.save(plan);
  }

  static async deleteInstallmentPlan(id: string): Promise<boolean> {
    if (!id) throw new Error('Installment plan ID is required');

    const result = await this.repo.softDelete(id);
    return result.affected !== 0;
  }
}
