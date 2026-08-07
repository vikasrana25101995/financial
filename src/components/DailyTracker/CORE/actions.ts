import { PresetItem } from './types';
import { toast } from 'sonner';
import { db } from '@/lib/db';

export class DailyTrackerActions {
  async checkBudgetLimit(category: string, newAmount: number) {
    try {
      const budgets = await db.getBudgets();
      const budget = budgets.find(b => b.category.toLowerCase() === category.toLowerCase());
      if (!budget) return;

      const expenses = await db.getExpenses();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const currentSpent = expenses
        .filter(e => {
          const d = new Date(e.date);
          return e.category.toLowerCase() === category.toLowerCase() &&
                 d.getMonth() === currentMonth &&
                 d.getFullYear() === currentYear;
        })
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

      const totalSpent = currentSpent + newAmount;
      const pct = (totalSpent / budget.monthly_limit) * 100;

      if (totalSpent >= budget.monthly_limit) {
        toast.warning(
          `🔴 BUDGET EXCEEDED: You have spent $${totalSpent.toFixed(2)} / $${budget.monthly_limit.toFixed(2)} in "${category}" this month!`
        );
      } else if (pct >= budget.alert_threshold) {
        toast.warning(
          `⚠️ BUDGET WARNING: You have used ${pct.toFixed(0)}% ($${totalSpent.toFixed(2)} / $${budget.monthly_limit.toFixed(2)}) of your "${category}" budget!`
        );
      }
    } catch (err) {
      console.error('Failed to run budget checks', err);
    }
  }

  notifyUpdate() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('pf_data_updated'));
    }
  }

  formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  }
}
