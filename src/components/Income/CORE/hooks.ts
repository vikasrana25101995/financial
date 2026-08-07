import { useState, useEffect } from 'react';
import { IncomeService } from './services';
import { IncomeActions } from './actions';
import { Income, IncomeFormData } from './types';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export function useIncome() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const service = new IncomeService();
  const actions = new IncomeActions();

  const loadIncomes = async () => {
    try {
      setLoading(true);
      const list = await service.getIncomes();
      setIncomes(list);
    } catch (err) {
      toast.error('Failed to load income records');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = async (formData: IncomeFormData) => {
    if (!actions.validate(formData)) return false;
    try {
      await service.addIncome({
        title: formData.title,
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date || new Date().toISOString().split('T')[0],
        notes: formData.notes,
        payment_method: formData.payment_method
      });
      toast.success('Income recorded successfully');
      loadIncomes();
      actions.notifyUpdate();
      return true;
    } catch (err) {
      toast.error('Failed to save income record');
      return false;
    }
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      await service.deleteIncome(id);
      toast.success('Income record deleted');
      loadIncomes();
      actions.notifyUpdate();
    } catch (err) {
      toast.error('Failed to delete income record');
    }
  };

  useEffect(() => {
    loadIncomes();
  }, []);

  return {
    incomes,
    loading,
    currency,
    addIncome: handleAddIncome,
    deleteIncome: handleDeleteIncome,
    format: (val: number) => actions.formatCurrency(val, currency)
  };
}
