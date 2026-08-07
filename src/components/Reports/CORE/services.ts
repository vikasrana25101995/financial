import { db, Income, Expense, Emi, Subscription, Budget } from '@/lib/db';

export class ReportsService {
  async fetchFinancialData() {
    const [incomes, expenses, emis, subscriptions, budgets] = await Promise.all([
      db.getIncomes(),
      db.getExpenses(),
      db.getEmis(),
      db.getSubscriptions(),
      db.getBudgets()
    ]);
    return { incomes, expenses, emis, subscriptions, budgets };
  }
}
