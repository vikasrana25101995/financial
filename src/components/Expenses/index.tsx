'use client';

import React, { useState, useMemo } from 'react';
import { useExpenses } from './CORE/hooks';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from './CORE/constants';
import { QUICK_PRESETS } from '@/components/DailyTracker/CORE/constants';
import styles from './STYLE/index.module.scss';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Plus, Trash2, Search, AlertTriangle, Pencil, CalendarDays, Sparkles, Receipt } from 'lucide-react';
import { Expense } from './CORE/types';
import { toast } from 'sonner';

export default function ExpensesComponent() {
  const {
    expenses,
    rawExpenses,
    loading,
    search,
    setSearch,
    category,
    setCategory,
    paymentMethod,
    setPaymentMethod,
    tagFilter,
    setTagFilter,
    uniqueTags,
    addExpense,
    updateExpense,
    deleteExpense,
    format
  } = useExpenses();

  const [open, setOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  // Period filter tab state: 'weekly' | 'monthly' | 'yearly' | 'all'
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'yearly' | 'upcoming' | 'all'>('all');

  // Manual Custom quick log form state
  const [customForm, setCustomForm] = useState({
    name: '',
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    payment_method: PAYMENT_METHODS[2], // Cash
    merchant: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
    payment_method: PAYMENT_METHODS[0],
    merchant: '',
    notes: '',
    tagsString: '',
    is_recurring: false,
    investment_type: 'Stock',
    current_value: ''
  });

  // Timezone safe helper
  const parseDateString = (str: string) => {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  // Stats summaries
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let todaySum = 0;
    let yesterdaySum = 0;
    let weeklySum = 0;
    let monthlySum = 0;
    let upcomingSum = 0;

    rawExpenses.forEach(e => {
      const amt = Number(e.amount);
      const eDate = parseDateString(e.date);

      if (eDate.getTime() === today.getTime()) {
        todaySum += amt;
      }
      if (eDate.getTime() === yesterday.getTime()) {
        yesterdaySum += amt;
      }
      if (eDate >= sevenDaysAgo && eDate <= today) {
        weeklySum += amt;
      }
      if (eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear && eDate <= today) {
        monthlySum += amt;
      }
      if (eDate > today) {
        upcomingSum += amt;
      }
    });

    const dayOfMonth = new Date().getDate();
    const avgDailySpend = monthlySum / dayOfMonth;

    return {
      today: todaySum,
      yesterday: yesterdaySum,
      thisWeek: weeklySum,
      thisMonth: monthlySum,
      upcoming: upcomingSum,
      avgDailySpend
    };
  }, [rawExpenses]);

  // Tab Filtering logic
  const tabFilteredExpenses = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return expenses.filter(e => {
      const eDate = parseDateString(e.date);

      if (activeTab === 'weekly') {
        return eDate >= sevenDaysAgo && eDate <= today;
      }
      if (activeTab === 'monthly') {
        return eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear && eDate <= today;
      }
      if (activeTab === 'yearly') {
        return eDate.getFullYear() === currentYear && eDate <= today;
      }
      if (activeTab === 'upcoming') {
        return eDate > today;
      }
      return true; // 'all' - keeps original search/category/payment filters
    });
  }, [expenses, activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const startEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setFormData({
      name: exp.name,
      amount: exp.amount.toString(),
      category: exp.category,
      date: exp.date,
      payment_method: exp.payment_method,
      merchant: exp.merchant || '',
      notes: exp.notes || '',
      tagsString: exp.tags ? exp.tags.join(', ') : '',
      is_recurring: false,
      investment_type: exp.investment_type || 'Stock',
      current_value: exp.current_value !== undefined ? exp.current_value.toString() : ''
    });
    setOpen(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setEditingExpense(null);
      setFormData({
        name: '',
        amount: '',
        category: EXPENSE_CATEGORIES[0],
        date: new Date().toISOString().split('T')[0],
        payment_method: PAYMENT_METHODS[0],
        merchant: '',
        notes: '',
        tagsString: '',
        is_recurring: false,
        investment_type: 'Stock',
        current_value: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = formData.tagsString
      ? formData.tagsString.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
      : [];

    const payload = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      payment_method: formData.payment_method,
      merchant: formData.merchant,
      notes: formData.notes,
      tags,
      is_recurring: false,
      investment_type: formData.category === 'Investment' ? formData.investment_type : undefined,
      current_value: formData.category === 'Investment' && formData.current_value ? parseFloat(formData.current_value) : undefined
    };

    let success = false;
    if (editingExpense) {
      success = await updateExpense(editingExpense.id, payload);
    } else {
      success = await addExpense(payload);
    }

    if (success) {
      handleOpenChange(false);
    }
  };

  const handleQuickLog = async (preset: typeof QUICK_PRESETS[0]) => {
    try {
      await addExpense({
        name: preset.name,
        amount: preset.amount,
        category: preset.category,
        date: new Date().toISOString().split('T')[0],
        payment_method: preset.payment_method,
        merchant: preset.merchant,
        notes: 'Logged instantly via presets.',
        tags: ['quick-spend', preset.name.toLowerCase()],
        is_recurring: false
      });
      toast.success(`Logged ${preset.emoji} ${preset.name} of ${format(preset.amount)}!`);
    } catch {
      toast.error('Failed to log preset spend');
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.name || !customForm.amount) {
      toast.error('Name and Amount are required');
      return;
    }

    const payload: any = {
      name: customForm.name,
      amount: parseFloat(customForm.amount),
      category: customForm.category,
      date: new Date().toISOString().split('T')[0],
      payment_method: customForm.payment_method,
      merchant: customForm.merchant,
      notes: 'Custom transaction logged via unified dashboard.',
      tags: ['quick-spend'],
      is_recurring: false
    };

    if (customForm.category === 'Investment') {
      payload.investment_type = 'Stock';
      payload.current_value = parseFloat(customForm.amount);
    }

    const success = await addExpense(payload);

    if (success) {
      setCustomForm({
        name: '',
        amount: '',
        category: EXPENSE_CATEGORIES[0],
        payment_method: PAYMENT_METHODS[2],
        merchant: ''
      });
      toast.success('Custom spend logged successfully');
    }
  };

  return (
    <div className={styles.expenses}>
      {/* Page Header */}
      <div className={styles.expenses__header}>
        <div>
          <h1 className={styles.expenses__title}>Spends & Expenses</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Log transactions instantly, manage overall logs, and review weekly, monthly, or yearly spend budgets.
          </p>
        </div>

        {/* Record Expense Trigger Dialog */}
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger render={<Button className="flex items-center gap-2" />}>
            <Plus className="h-4 w-4" /> Record Custom Expense
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'Edit Expense' : 'Record Expense'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className={styles.expenses__form}>
              <div className={styles['expenses__form-group']}>
                <Label htmlFor="name">Expense Name / Title</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Weekly Grocery, Petrol"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={styles['expenses__form-group']}>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles['expenses__form-group']}>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={styles['expenses__form-group']}>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    name="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.category}
                    onChange={(e) => handleSelectChange('category', e.target.value)}
                  >
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className={styles['expenses__form-group']}>
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <select
                    id="payment_method"
                    name="payment_method"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.payment_method}
                    onChange={(e) => handleSelectChange('payment_method', e.target.value)}
                  >
                    {PAYMENT_METHODS.map(pm => (
                      <option key={pm} value={pm}>{pm}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.category === 'Investment' && (
                <div className="grid grid-cols-2 gap-4 border border-blue-500/20 bg-blue-500/5 p-3 rounded-lg mb-2">
                  <div className={styles['expenses__form-group']}>
                    <Label htmlFor="investment_type" className="text-blue-500 dark:text-blue-400 font-semibold text-xs">Investment Class</Label>
                    <select
                      id="investment_type"
                      name="investment_type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={formData.investment_type}
                      onChange={(e) => handleSelectChange('investment_type', e.target.value)}
                    >
                      <option value="Stock">Stock</option>
                      <option value="Crypto">Crypto</option>
                      <option value="Mutual Fund">Mutual Fund</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Retirement">Retirement</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className={styles['expenses__form-group']}>
                    <Label htmlFor="current_value" className="text-blue-500 dark:text-blue-400 font-semibold text-xs">Current Value ($)</Label>
                    <Input
                      id="current_value"
                      name="current_value"
                      type="number"
                      step="0.01"
                      placeholder={formData.amount || "0.00"}
                      value={formData.current_value}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className={styles['expenses__form-group']}>
                  <Label htmlFor="merchant">Merchant (Optional)</Label>
                  <Input
                    id="merchant"
                    name="merchant"
                    placeholder="e.g. WholeFoods, Uber"
                    value={formData.merchant}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles['expenses__form-group']}>
                  <Label htmlFor="tagsString">Tags (Comma-separated)</Label>
                  <Input
                    id="tagsString"
                    name="tagsString"
                    placeholder="food, grocery, cash"
                    value={formData.tagsString}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className={styles['expenses__form-group']}>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  name="notes"
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Additional details..."
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>



              <div className="flex justify-end gap-3 mt-1">
                <DialogClose render={<Button type="button" variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button type="submit">{editingExpense ? 'Update Transaction' : 'Save Transaction'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Unification Section: Presets Quick Log & Custom Spend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-muted/10 p-5 rounded-2xl border border-border mb-6">
        {/* Left Column: Quick presets */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-border pb-2 mb-1">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">5-Second Quick Presets</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUICK_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleQuickLog(preset)}
                className="bg-card hover:bg-muted/50 border border-border rounded-xl p-3.5 flex flex-col items-center gap-1.5 transition-all active:scale-[0.97]"
              >
                <span className="text-2xl">{preset.emoji}</span>
                <span className="text-xs font-semibold">{preset.name}</span>
                <span className="text-[10px] text-muted-foreground">{format(preset.amount)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Custom quick logger form */}
        <div className="bg-card border border-border rounded-xl p-4.5 flex flex-col gap-3.5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Receipt className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">Log Custom Daily Spend</h3>
          </div>
          <form onSubmit={handleCustomSubmit} className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <Label htmlFor="custom-name" className="text-[10px] uppercase font-semibold text-muted-foreground">Title</Label>
              <Input
                id="custom-name"
                placeholder="Bus fare, parking..."
                value={customForm.name}
                onChange={(e) => setCustomForm(prev => ({ ...prev, name: e.target.value }))}
                required
                className="h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <Label htmlFor="custom-amount" className="text-[10px] uppercase font-semibold text-muted-foreground">Amount ($)</Label>
                <Input
                  id="custom-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={customForm.amount}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="custom-payment" className="text-[10px] uppercase font-semibold text-muted-foreground">Payment</Label>
                <select
                  id="custom-payment"
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={customForm.payment_method}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, payment_method: e.target.value }))}
                >
                  {PAYMENT_METHODS.map(pm => (
                    <option key={pm} value={pm}>{pm}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <Label htmlFor="custom-category" className="text-[10px] uppercase font-semibold text-muted-foreground">Category</Label>
                <select
                  id="custom-category"
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={customForm.category}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="custom-merchant" className="text-[10px] uppercase font-semibold text-muted-foreground">Merchant</Label>
                <Input
                  id="custom-merchant"
                  placeholder="Uber, Shell..."
                  value={customForm.merchant}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, merchant: e.target.value }))}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <Button type="submit" size="sm" className="mt-1 w-full h-8 text-xs">
              Log spend
            </Button>
          </form>
        </div>
      </div>

      {/* Stats summaries Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4.5 flex flex-col gap-1 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Logged Today</span>
          <span className="text-2xl font-bold text-amber-500">{format(stats.today)}</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-4.5 flex flex-col gap-1 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Yesterday</span>
          <span className="text-2xl font-bold text-foreground">{format(stats.yesterday)}</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-4.5 flex flex-col gap-1 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Last 7 Days</span>
          <span className="text-2xl font-bold text-foreground">{format(stats.thisWeek)}</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-4.5 flex flex-col gap-1 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">This Month (Avg / Day)</span>
          <span className="text-2xl font-bold text-violet-500">
            {format(stats.thisMonth)} <span className="text-xs font-normal text-muted-foreground">({format(stats.avgDailySpend)}/d)</span>
          </span>
        </div>
        <div className="bg-card border border-border rounded-xl p-4.5 flex flex-col gap-1 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Upcoming Spends</span>
          <span className="text-2xl font-bold text-sky-500">{format(stats.upcoming)}</span>
        </div>
      </div>

      {/* Spends History with Period Filtering Tabs */}
      <div className="flex flex-col gap-4 border border-border rounded-2xl bg-card p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-3">
          {/* Tab toggles */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'weekly' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Weekly Spends
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'monthly' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly Spends
            </button>
            <button
              onClick={() => setActiveTab('yearly')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'yearly' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly Spends
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'upcoming' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Upcoming Spends
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'all' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Ledger
            </button>
          </div>

          <span className="text-xs font-medium text-muted-foreground italic flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            Showing filtered records for selected range ({tabFilteredExpenses.length} items)
          </span>
        </div>

        {/* Filters Dashboard (Only active when in 'All Ledger' view to keep interface clean, otherwise showing tabs) */}
        <div className={`${styles.expenses__filters} ${activeTab !== 'all' ? 'opacity-60 pointer-events-none' : ''}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={activeTab !== 'all' ? "Select 'All Ledger' to search..." : "Search name, merchant or notes..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              disabled={activeTab !== 'all'}
            />
          </div>

          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={activeTab !== 'all'}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="All">All Categories</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={activeTab !== 'all'}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="All">All Payments</option>
              {PAYMENT_METHODS.map(pm => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              disabled={activeTab !== 'all'}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="All">All Tags</option>
              {uniqueTags.map(tag => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Expenses Table */}
        <div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : tabFilteredExpenses.length > 0 ? (
            <div className={styles['expenses__table-wrapper']}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expense</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[90px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tabFilteredExpenses.map((exp) => (
                    <TableRow
                      key={exp.id}
                      className={
                        exp.is_subscription
                          ? "bg-amber-500/[0.04] hover:bg-amber-500/[0.08] dark:bg-amber-500/[0.02] dark:hover:bg-amber-500/[0.06] border-l-2 border-l-amber-500 transition-colors"
                          : ""
                      }
                    >
                      <TableCell className="font-semibold">
                        <div className="flex flex-col">
                          <span>{exp.name}</span>
                          {exp.is_subscription && (
                            <span className="text-[9px] text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 w-fit px-1.5 py-0.5 rounded font-semibold mt-1">
                              🔄 Subscription Auto-Pay
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{exp.merchant || '—'}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-violet-50 dark:bg-violet-950/30 px-2 py-1 text-xs font-medium text-violet-700 dark:text-violet-400">
                          {exp.category}
                        </span>
                      </TableCell>
                      <TableCell>{exp.payment_method}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {exp.tags && exp.tags.map(t => (
                            <span key={t} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              #{t}
                            </span>
                          ))}
                          {(!exp.tags || exp.tags.length === 0) && '—'}
                        </div>
                      </TableCell>
                      <TableCell>{exp.date}</TableCell>
                      <TableCell className={`text-right font-bold ${exp.is_subscription ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}`}>
                        {format(exp.amount)}
                      </TableCell>
                      <TableCell>
                        {exp.is_subscription ? (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 italic font-semibold whitespace-nowrap bg-amber-500/10 dark:bg-amber-500/20 px-2 py-1 rounded">
                            Manage in Subs
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-accent-foreground hover:bg-accent"
                              onClick={() => startEdit(exp)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteExpense(exp.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto stroke-1 mb-4 opacity-50 text-amber-500" />
              <h3 className="text-lg font-semibold">No Spends Found</h3>
              <p className="text-sm mt-1">There are no recorded transactions matching this active period or filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
