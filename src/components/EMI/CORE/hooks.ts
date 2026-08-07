import { useState, useEffect } from 'react';
import { EmiService } from './services';
import { EmiActions } from './actions';
import { Emi, EmiFormData } from './types';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export function useEmi() {
  const [emis, setEmis] = useState<Emi[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const service = new EmiService();
  const actions = new EmiActions();

  const loadEmis = async () => {
    try {
      setLoading(true);
      const list = await service.getEmis();
      setEmis(list);
    } catch (err) {
      toast.error('Failed to load EMI records');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmi = async (formData: EmiFormData) => {
    if (!actions.validate(formData)) return false;
    try {
      await service.addEmi({
        loan_name: formData.loan_name,
        bank: formData.bank,
        principal_amount: Number(formData.principal_amount),
        interest_rate: Number(formData.interest_rate),
        monthly_emi: Number(formData.monthly_emi),
        remaining_balance: Number(formData.remaining_balance),
        start_date: formData.start_date,
        end_date: formData.end_date,
        due_date: Number(formData.due_date),
        auto_reminder: formData.auto_reminder,
        status: formData.status
      });
      toast.success('Loan EMI recorded successfully');
      loadEmis();
      actions.notifyUpdate();
      return true;
    } catch (err) {
      toast.error('Failed to save EMI record');
      return false;
    }
  };

  const handlePayEmi = async (id: string, paymentAmount: number) => {
    try {
      const emi = emis.find(e => e.id === id);
      if (!emi) return;

      const newBalance = Math.max(0, Number(emi.remaining_balance) - paymentAmount);
      const isPaid = newBalance <= 0;

      await service.updateEmi(id, {
        remaining_balance: newBalance,
        status: isPaid ? 'Paid' : 'Active'
      });

      // Also trigger a mock expense entry for this EMI pay!
      // This is a premium touch: pay EMI automatically creates a corresponding expense!
      try {
        const { db } = await import('@/lib/db');
        await db.addExpense({
          name: `EMI Payment: ${emi.loan_name}`,
          amount: paymentAmount,
          category: 'Rent', // Or add a category like Debt repayment
          date: new Date().toISOString().split('T')[0],
          payment_method: 'Bank Transfer',
          merchant: emi.bank,
          notes: `Automatic EMI payment log. Remaining Balance: $${newBalance.toFixed(2)}`,
          tags: ['emi-payment', 'loan'],
          is_recurring: false
        });
      } catch (ex) {
        console.error('Failed to auto-log expense for EMI payment', ex);
      }

      toast.success(isPaid ? '🎉 Congratulations! The loan is fully paid off!' : `Paid EMI of $${paymentAmount}. Remaining: $${newBalance.toFixed(2)}`);
      loadEmis();
      actions.notifyUpdate();
    } catch (err) {
      toast.error('Failed to log payment');
    }
  };

  const handleUpdateEmi = async (id: string, formData: EmiFormData) => {
    if (!actions.validate(formData)) return false;
    try {
      await service.updateEmi(id, {
        loan_name: formData.loan_name,
        bank: formData.bank,
        principal_amount: Number(formData.principal_amount),
        interest_rate: Number(formData.interest_rate),
        monthly_emi: Number(formData.monthly_emi),
        remaining_balance: Number(formData.remaining_balance),
        start_date: formData.start_date,
        end_date: formData.end_date,
        due_date: Number(formData.due_date),
        auto_reminder: formData.auto_reminder,
        status: formData.status
      });
      toast.success('Loan EMI updated successfully');
      loadEmis();
      actions.notifyUpdate();
      return true;
    } catch (err) {
      toast.error('Failed to update EMI record');
      return false;
    }
  };

  const handleDeleteEmi = async (id: string) => {
    try {
      await service.deleteEmi(id);
      toast.success('Loan EMI schedule deleted');
      loadEmis();
      actions.notifyUpdate();
      return true;
    } catch (err) {
      toast.error('Failed to delete EMI schedule');
      return false;
    }
  };

  useEffect(() => {
    loadEmis();
  }, []);

  return {
    emis,
    loading,
    currency,
    addEmi: handleAddEmi,
    updateEmi: handleUpdateEmi,
    deleteEmi: handleDeleteEmi,
    payEmi: handlePayEmi,
    format: (val: number) => actions.formatCurrency(val, currency)
  };
}
