import { useState, useEffect } from 'react';
import { DailyTrackerService } from './services';
import { DailyTrackerActions } from './actions';
import { Expense, PresetItem, SpendSummary } from './types';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export function useDailyTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const [summary, setSummary] = useState<SpendSummary>({
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    thisMonth: 0
  });

  const service = new DailyTrackerService();
  const actions = new DailyTrackerActions();

  const loadDailyStats = async () => {
    try {
      setLoading(true);
      const list = await service.getExpenses();
      setExpenses(list);

      // Calculations
      const todayStr = new Date().toISOString().split('T')[0];
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Weekly calculation (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Monthly calculation (this current calendar month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      let todaySum = 0;
      let yesterdaySum = 0;
      let weeklySum = 0;
      let monthlySum = 0;

      list.forEach(e => {
        const amt = Number(e.amount);
        const eDate = new Date(e.date);
        const eDateStr = e.date;

        if (eDateStr === todayStr) {
          todaySum += amt;
        }
        if (eDateStr === yesterdayStr) {
          yesterdaySum += amt;
        }
        if (eDate >= sevenDaysAgo) {
          weeklySum += amt;
        }
        if (eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear) {
          monthlySum += amt;
        }
      });

      setSummary({
        today: todaySum,
        yesterday: yesterdaySum,
        thisWeek: weeklySum,
        thisMonth: monthlySum
      });
    } catch (err) {
      toast.error('Failed to update daily statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLog = async (preset: PresetItem) => {
    try {
      await actions.checkBudgetLimit(preset.category, preset.amount);

      await service.quickLogExpense({
        name: preset.name,
        amount: preset.amount,
        category: preset.category,
        date: new Date().toISOString().split('T')[0],
        payment_method: preset.payment_method,
        merchant: preset.merchant,
        notes: `Logged instantly using the 5-second Quick Tracker.`,
        tags: ['quick-spend', preset.name.toLowerCase()],
        is_recurring: false
      });

      toast.success(`Logged ${preset.emoji} ${preset.name} of ${actions.formatCurrency(preset.amount, currency)}!`);
      loadDailyStats();
      actions.notifyUpdate();
    } catch (err) {
      toast.error('Failed to log expense preset');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await service.deleteExpense(id);
      toast.success('Expense record deleted');
      loadDailyStats();
      actions.notifyUpdate();
    } catch (err) {
      toast.error('Failed to delete expense record');
    }
  };

  const handleUpdateExpense = async (id: string, payload: { name: string; amount: number; category: string; merchant: string; payment_method: string; notes: string }) => {
    try {
      await service.updateExpense(id, {
        name: payload.name,
        amount: payload.amount,
        category: payload.category,
        merchant: payload.merchant,
        payment_method: payload.payment_method,
        notes: payload.notes
      });
      toast.success('Expense updated successfully');
      loadDailyStats();
      actions.notifyUpdate();
      return true;
    } catch (err) {
      toast.error('Failed to update expense record');
      return false;
    }
  };

  useEffect(() => {
    loadDailyStats();
    window.addEventListener('pf_data_updated', loadDailyStats);
    return () => window.removeEventListener('pf_data_updated', loadDailyStats);
  }, []);

  return {
    expenses: expenses.filter(e => e.date === new Date().toISOString().split('T')[0]),
    summary,
    loading,
    currency,
    quickLog: handleQuickLog,
    deleteExpense: handleDeleteExpense,
    updateExpense: handleUpdateExpense,
    format: (val: number) => actions.formatCurrency(val, currency)
  };
}
