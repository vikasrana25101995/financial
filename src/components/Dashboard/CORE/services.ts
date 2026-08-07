import { db } from '@/lib/db';

export class DashboardService {
  async fetchAllData() {
    const [profile, incomes, expenses, emis, subscriptions, investments] = await Promise.all([
      db.getProfile(),
      db.getIncomes(),
      db.getExpenses(),
      db.getEmis(),
      db.getSubscriptions(),
      db.getInvestments()
    ]);

    return {
      profile,
      incomes,
      expenses,
      emis,
      subscriptions,
      investments,
      debts: []
    };
  }
}
