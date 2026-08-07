'use client';

import React, { useState } from 'react';
import { useDailyTracker } from './CORE/hooks';
import { QUICK_PRESETS } from './CORE/constants';
import styles from './STYLE/index.module.scss';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coffee, Trash2, ShieldAlert, Pencil } from 'lucide-react';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/components/Expenses/CORE/constants';
import { toast } from 'sonner';

export default function DailyTrackerComponent() {
  const { expenses, summary, loading, quickLog, deleteExpense, updateExpense, format } = useDailyTracker();

  const [editOpen, setEditOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    amount: '',
    category: '',
    merchant: '',
    payment_method: '',
    notes: ''
  });

  const startEdit = (exp: any) => {
    setEditingExpense(exp);
    setEditForm({
      name: exp.name,
      amount: exp.amount.toString(),
      category: exp.category,
      merchant: exp.merchant || '',
      payment_method: exp.payment_method,
      notes: exp.notes || ''
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    const success = await updateExpense(editingExpense.id, {
      name: editForm.name,
      amount: parseFloat(editForm.amount),
      category: editForm.category,
      merchant: editForm.merchant,
      payment_method: editForm.payment_method,
      notes: editForm.notes
    });

    if (success) {
      setEditOpen(false);
      setEditingExpense(null);
    }
  };

  const [customForm, setCustomForm] = useState({
    name: '',
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    payment_method: PAYMENT_METHODS[2], // Cash/Default
    merchant: ''
  });

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.name || !customForm.amount) {
      toast.error('Name and Amount are required');
      return;
    }

    try {
      await quickLog({
        name: customForm.name,
        amount: parseFloat(customForm.amount),
        category: customForm.category,
        payment_method: customForm.payment_method,
        merchant: customForm.merchant,
        emoji: '📝'
      });

      setCustomForm({
        name: '',
        amount: '',
        category: EXPENSE_CATEGORIES[0],
        payment_method: PAYMENT_METHODS[2],
        merchant: ''
      });
    } catch {
      toast.error('Failed to log custom expense');
    }
  };

  return (
    <div className={styles['daily-tracker']}>
      {/* Header */}
      <div className={styles['daily-tracker__header']}>
        <h1 className={styles['daily-tracker__title']}>5-Second Quick Log</h1>
        <p className={styles['daily-tracker__subtitle']}>
          Log micro-spends instantly by clicking on presets or log a custom transaction on the fly.
        </p>
      </div>

      {/* Grid of presets and custom quick log form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Presets</h3>
          <div className={styles['daily-tracker__preset-grid']}>
            {QUICK_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => quickLog(preset)}
                className={styles['daily-tracker__preset-btn']}
              >
                <span className={styles['daily-tracker__preset-emoji']}>{preset.emoji}</span>
                <span className={styles['daily-tracker__preset-name']}>{preset.name}</span>
                <span className={styles['daily-tracker__preset-amount']}>{format(preset.amount)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 shadow-sm h-fit">
          <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase border-b border-border pb-2">
            📝 Log Custom Spend
          </h3>
          <form onSubmit={handleCustomSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="custom-name" className="text-xs">Title</Label>
              <Input
                id="custom-name"
                placeholder="e.g. Bus Fare, Parking"
                value={customForm.name}
                onChange={(e) => setCustomForm(prev => ({ ...prev, name: e.target.value }))}
                required
                className="h-9 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="custom-amount" className="text-xs">Amount ($)</Label>
                <Input
                  id="custom-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={customForm.amount}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  className="h-9 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="custom-payment" className="text-xs">Payment</Label>
                <select
                  id="custom-payment"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={customForm.payment_method}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, payment_method: e.target.value }))}
                >
                  {PAYMENT_METHODS.map(pm => (
                    <option key={pm} value={pm}>{pm}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="custom-category" className="text-xs">Category</Label>
                <select
                  id="custom-category"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={customForm.category}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="custom-merchant" className="text-xs">Merchant</Label>
                <Input
                  id="custom-merchant"
                  placeholder="e.g. Metro"
                  value={customForm.merchant}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, merchant: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <Button type="submit" size="sm" className="mt-2 w-full h-9">
              Log Expense
            </Button>
          </form>
        </div>
      </div>

      {/* Stats summaries */}
      <div className={styles['daily-tracker__stats-grid']}>
        <div className={styles['daily-tracker__stat-card']}>
          <span className={styles['daily-tracker__stat-title']}>Today</span>
          <span className={`${styles['daily-tracker__stat-value']} text-amber-500`}>
            {format(summary.today)}
          </span>
        </div>
        <div className={styles['daily-tracker__stat-card']}>
          <span className={styles['daily-tracker__stat-title']}>Yesterday</span>
          <span className={styles['daily-tracker__stat-value']}>
            {format(summary.yesterday)}
          </span>
        </div>
        <div className={styles['daily-tracker__stat-card']}>
          <span className={styles['daily-tracker__stat-title']}>Past 7 Days</span>
          <span className={styles['daily-tracker__stat-value']}>
            {format(summary.thisWeek)}
          </span>
        </div>
        <div className={styles['daily-tracker__stat-card']}>
          <span className={styles['daily-tracker__stat-title']}>This Month</span>
          <span className={styles['daily-tracker__stat-value']}>
            {format(summary.thisMonth)}
          </span>
        </div>
      </div>

      {/* Today's Transactions logged */}
      <div className={styles['daily-tracker__list-card']}>
        <h3 className="text-lg font-semibold border-b border-border pb-2 mb-3">Logged Today</h3>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : expenses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preset / Name</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[90px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="font-semibold">{exp.name}</TableCell>
                  <TableCell>{exp.merchant || '—'}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 text-xs font-medium text-orange-700 dark:text-orange-400">
                      {exp.category}
                    </span>
                  </TableCell>
                  <TableCell>{exp.payment_method}</TableCell>
                  <TableCell className="text-right font-bold text-red-500">
                    {format(exp.amount)}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Coffee className="h-10 w-12 mx-auto stroke-1 mb-3 opacity-50" />
            <p className="text-sm">You haven't logged any preset micro-expenses today yet.</p>
          </div>
        )}
      </div>

      {/* Edit Dialog for Daily Presets */}
      <Dialog open={editOpen} onOpenChange={(val) => { setEditOpen(val); if(!val) setEditingExpense(null); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Daily Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Expense Name / Title</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-amount">Amount ($)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={editForm.category}
                  onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-merchant">Merchant</Label>
                <Input
                  id="edit-merchant"
                  value={editForm.merchant}
                  onChange={(e) => setEditForm(prev => ({ ...prev, merchant: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-payment">Payment Method</Label>
                <Input
                  id="edit-payment"
                  value={editForm.payment_method}
                  onChange={(e) => setEditForm(prev => ({ ...prev, payment_method: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
