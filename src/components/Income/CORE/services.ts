import { db, Income } from '@/lib/db';

export class IncomeService {
  async getIncomes(): Promise<Income[]> {
    return db.getIncomes();
  }

  async addIncome(income: Omit<Income, 'id' | 'user_id'>): Promise<Income> {
    return db.addIncome(income);
  }

  async deleteIncome(id: string): Promise<boolean> {
    return db.deleteIncome(id);
  }
}
