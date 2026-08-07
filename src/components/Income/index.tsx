'use client';

import React, { useState } from 'react';
import { useIncome } from './CORE/hooks';
import { INCOME_CATEGORIES, PAYMENT_METHODS } from './CORE/constants';
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
import { Plus, Trash2, Calendar, Wallet } from 'lucide-react';

export default function IncomeComponent() {
  const { incomes, loading, addIncome, deleteIncome, format } = useIncome();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: INCOME_CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
    notes: '',
    payment_method: PAYMENT_METHODS[0]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addIncome({
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      notes: formData.notes,
      payment_method: formData.payment_method
    });

    if (success) {
      setOpen(false);
      setFormData({
        title: '',
        amount: '',
        category: INCOME_CATEGORIES[0],
        date: new Date().toISOString().split('T')[0],
        notes: '',
        payment_method: PAYMENT_METHODS[0]
      });
    }
  };

  return (
    <div className={styles.income}>
      {/* Page Header */}
      <div className={styles.income__header}>
        <div>
          <h1 className={styles.income__title}>Income Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and monitor all your income streams in one place.
          </p>
        </div>

        {/* Dialog for Recording Income */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="flex items-center gap-2" />}>
            <Plus className="h-4 w-4" /> Record Income
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Record Income Stream</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className={styles.income__form}>
              <div className={styles['income__form-group']}>
                <Label htmlFor="title">Title / Source</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Monthly Salary, Consulting"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={styles['income__form-group']}>
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
                <div className={styles['income__form-group']}>
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
                <div className={styles['income__form-group']}>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    name="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.category}
                    onChange={(e) => handleSelectChange('category', e.target.value)}
                  >
                    {INCOME_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className={styles['income__form-group']}>
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

              <div className={styles['income__form-group']}>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  name="notes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Additional details..."
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <DialogClose render={<Button type="button" variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button type="submit">Save Stream</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Income List Card */}
      <div className={styles.income__card}>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : incomes.length > 0 ? (
          <div className={styles['income__table-wrapper']}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell className="font-semibold">{inc.title}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        {inc.category}
                      </span>
                    </TableCell>
                    <TableCell>{inc.payment_method}</TableCell>
                    <TableCell>{inc.date}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">{inc.notes || '—'}</TableCell>
                    <TableCell className="text-right font-bold text-emerald-500">
                      {format(inc.amount)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => deleteIncome(inc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto stroke-1 mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">No Income Recorded</h3>
            <p className="text-sm mt-1">Start by recording your first income stream using the button above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
