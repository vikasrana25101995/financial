import { ExpenseFormData } from './types';
import { toast } from 'sonner';
import { db } from '@/lib/db';

export class ExpensesActions {
  validate(data: ExpenseFormData): boolean {
    if (!data.name.trim()) {
      toast.error('Expense name is required');
      return false;
    }
    if (Number(data.amount) <= 0 || isNaN(Number(data.amount))) {
      toast.error('Amount must be greater than zero');
      return false;
    }
    if (!data.category) {
      toast.error('Category is required');
      return false;
    }
    if (!data.payment_method) {
      toast.error('Payment method is required');
      return false;
    }
    if (data.is_recurring && !data.recurring_interval) {
      toast.error('Recurring interval is required for recurring expenses');
      return false;
    }
    return true;
  }

  async checkBudgetLimit(category: string, newAmount: number) {
    try {
      const budgets = await db.getBudgets();
      const budget = budgets.find(b => b.category.toLowerCase() === category.toLowerCase());
      if (!budget) return;

      const expenses = await db.getExpenses();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      // Sum this month's expenses for this category
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
