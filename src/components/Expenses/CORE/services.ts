import { db, Expense } from '@/lib/db';

export class ExpensesService {
  async getExpenses(): Promise<Expense[]> {
    return db.getExpenses();
  }

  async addExpense(expense: Omit<Expense, 'id' | 'user_id'>): Promise<Expense> {
    return db.addExpense(expense);
  }

  async deleteExpense(id: string): Promise<boolean> {
    return db.deleteExpense(id);
  }

  async updateExpense(id: string, expense: Partial<Omit<Expense, 'id' | 'user_id'>>): Promise<Expense> {
    return db.updateExpense(id, expense);
  }
}
