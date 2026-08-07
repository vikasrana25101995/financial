import { useState, useEffect, useMemo } from 'react';
import { ExpensesService } from './services';
import { ExpensesActions } from './actions';
import { Expense, ExpenseFormData } from './types';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { db, Subscription } from '@/lib/db';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');

  const service = new ExpensesService();
  const actions = new ExpensesActions();

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const [list, subscriptionsList] = await Promise.all([
        service.getExpenses(),
        db.getSubscriptions()
      ]);

      const mappedSubs = subscriptionsList.map((sub: Subscription) => ({
        id: `sub-${sub.id}`,
        user_id: sub.user_id || '',
        name: sub.service_name,
        amount: sub.monthly_cost,
        category: sub.category,
        date: sub.renewal_date,
        payment_method: sub.payment_method,
        merchant: 'Subscription Auto-Pay',
        notes: 'Upcoming active subscription renewal.',
        is_recurring: false,
        is_subscription: true
      }));

      setExpenses([...list, ...mappedSubs]);
    } catch (err) {
      toast.error('Failed to load expense records');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (formData: ExpenseFormData) => {
    if (!actions.validate(formData)) return false;
    try {
      // Run budget limit alert check before inserting
      await actions.checkBudgetLimit(formData.category, Number(formData.amount));

      await service.addExpense({
        name: formData.name,
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date || new Date().toISOString().split('T')[0],
        payment_method: formData.payment_method,
        merchant: formData.merchant,
        notes: formData.notes,
        receipt_url: formData.receipt_url,
        tags: formData.tags || [],
        is_recurring: formData.is_recurring,
        recurring_interval: formData.is_recurring ? formData.recurring_interval : undefined
      });
      toast.success('Expense recorded successfully');
      loadExpenses();
      actions.notifyUpdate();
      return true;
    } catch (err) {
      toast.error('Failed to save expense record');
      return false;
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await service.deleteExpense(id);
      toast.success('Expense record deleted');
      loadExpenses();
      actions.notifyUpdate();
    } catch (err) {
      toast.error('Failed to delete expense record');
    }
  };

  useEffect(() => {
    loadExpenses();
    window.addEventListener('pf_data_updated', loadExpenses);
    return () => window.removeEventListener('pf_data_updated', loadExpenses);
  }, []);

  // Filtered Expenses Memo
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
                            (e.merchant && e.merchant.toLowerCase().includes(search.toLowerCase())) ||
                            (e.notes && e.notes.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = category === 'All' || e.category === category;
      const matchesPayment = paymentMethod === 'All' || e.payment_method === paymentMethod;
      const matchesTag = tagFilter === 'All' || (e.tags && e.tags.includes(tagFilter));

      return matchesSearch && matchesCategory && matchesPayment && matchesTag;
    });
  }, [expenses, search, category, paymentMethod, tagFilter]);

  // Extract all unique tags
  const uniqueTags = useMemo(() => {
    const tagsSet = new Set<string>();
    expenses.forEach(e => {
      if (e.tags) {
        e.tags.forEach(t => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [expenses]);

  const handleUpdateExpense = async (id: string, formData: ExpenseFormData) => {
    if (!actions.validate(formData)) return false;
    try {
      await service.updateExpense(id, {
        name: formData.name,
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date || new Date().toISOString().split('T')[0],
        payment_method: formData.payment_method,
        merchant: formData.merchant,
        notes: formData.notes,
        receipt_url: formData.receipt_url,
        tags: formData.tags || [],
        is_recurring: formData.is_recurring,
        recurring_interval: formData.is_recurring ? formData.recurring_interval : undefined
      });
      toast.success('Expense updated successfully');
      loadExpenses();
      actions.notifyUpdate();
      return true;
    } catch (err) {
      toast.error('Failed to update expense record');
      return false;
    }
  };

  return {
    expenses: filteredExpenses,
    rawExpenses: expenses,
    loading,
    currency,
    search,
    setSearch,
    category,
    setCategory,
    paymentMethod,
    setPaymentMethod,
    tagFilter,
    setTagFilter,
    uniqueTags,
    addExpense: handleAddExpense,
    updateExpense: handleUpdateExpense,
    deleteExpense: handleDeleteExpense,
    format: (val: number) => actions.formatCurrency(val, currency)
  };
}
