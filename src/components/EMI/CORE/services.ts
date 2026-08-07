import { db, Emi } from '@/lib/db';

export class EmiService {
  async getEmis(): Promise<Emi[]> {
    return db.getEmis();
  }

  async addEmi(emi: Omit<Emi, 'id' | 'user_id'>): Promise<Emi> {
    return db.addEmi(emi);
  }

  async updateEmi(id: string, emi: Partial<Emi>): Promise<Emi> {
    return db.updateEmi(id, emi);
  }

  async deleteEmi(id: string): Promise<boolean> {
    return db.deleteEmi(id);
  }
}
