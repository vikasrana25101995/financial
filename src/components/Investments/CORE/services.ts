import { db, Investment } from '@/lib/db';

export class InvestmentsService {
  async getInvestments(): Promise<Investment[]> {
    return db.getInvestments();
  }

  async addInvestment(inv: Omit<Investment, 'id' | 'user_id'>): Promise<Investment> {
    return db.addInvestment(inv);
  }

  async deleteInvestment(id: string): Promise<boolean> {
    return db.deleteInvestment(id);
  }
}
