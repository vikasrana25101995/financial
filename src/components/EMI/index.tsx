'use client';

import React, { useState } from 'react';
import { useEmi } from './CORE/hooks';
import { Emi } from './CORE/types';
import { POPULAR_BANKS, EMI_STATUSES } from './CORE/constants';
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
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, Plus, Bell, ArrowRight, Pencil, Trash2 } from 'lucide-react';

export default function EmiComponent() {
  const { emis, loading, addEmi, updateEmi, deleteEmi, payEmi, format } = useEmi();
  const [open, setOpen] = useState(false);
  const [payOpen, setPayOpen] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [editingEmi, setEditingEmi] = useState<Emi | null>(null);

  const [formData, setFormData] = useState(() => ({
    loan_name: '',
    bank: POPULAR_BANKS[0],
    principal_amount: '',
    interest_rate: '',
    monthly_emi: '',
    remaining_balance: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
    due_date: '5',
    auto_reminder: true,
    status: 'Active'
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Sync remaining balance with principal initially
      if (name === 'principal_amount' && !prev.remaining_balance) {
        updated.remaining_balance = value;
      }
      return updated;
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, auto_reminder: checked }));
  };

  const startEdit = (item: Emi) => {
    setEditingEmi(item);
    setFormData({
      loan_name: item.loan_name,
      bank: item.bank,
      principal_amount: item.principal_amount.toString(),
      interest_rate: item.interest_rate.toString(),
      monthly_emi: item.monthly_emi.toString(),
      remaining_balance: item.remaining_balance.toString(),
      start_date: item.start_date,
      end_date: item.end_date,
      due_date: item.due_date.toString(),
      auto_reminder: item.auto_reminder,
      status: item.status
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      loan_name: formData.loan_name,
      bank: formData.bank,
      principal_amount: parseFloat(formData.principal_amount),
      interest_rate: parseFloat(formData.interest_rate),
      monthly_emi: parseFloat(formData.monthly_emi),
      remaining_balance: parseFloat(formData.remaining_balance || formData.principal_amount),
      start_date: formData.start_date,
      end_date: formData.end_date,
      due_date: parseInt(formData.due_date),
      auto_reminder: formData.auto_reminder,
      status: formData.status
    };

    let success = false;
    if (editingEmi) {
      success = await updateEmi(editingEmi.id, payload);
    } else {
      success = await addEmi(payload);
    }

    if (success) {
      setOpen(false);
      setEditingEmi(null);
      setFormData({
        loan_name: '',
        bank: POPULAR_BANKS[0],
        principal_amount: '',
        interest_rate: '',
        monthly_emi: '',
        remaining_balance: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
        due_date: '5',
        auto_reminder: true,
        status: 'Active'
      });
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!payAmount || isNaN(parseFloat(payAmount))) return;
    payEmi(id, parseFloat(payAmount));
    setPayOpen(null);
    setPayAmount('');
  };

  return (
    <div className={styles.emi}>
      {/* Page Header */}
      <div className={styles.emi__header}>
        <div>
          <h1 className={styles.emi__title}>Equated Monthly Installments (EMIs)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Repay loans systematically. Set auto reminders and track remaining loan outstanding values.
          </p>
        </div>

        {/* Add Loan trigger */}
        <Dialog open={open} onOpenChange={(o) => {
          setOpen(o);
          if (!o) {
            setEditingEmi(null);
            setFormData({
              loan_name: '',
              bank: POPULAR_BANKS[0],
              principal_amount: '',
              interest_rate: '',
              monthly_emi: '',
              remaining_balance: '',
              start_date: new Date().toISOString().split('T')[0],
              end_date: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
              due_date: '5',
              auto_reminder: true,
              status: 'Active'
            });
          }
        }}>
          <Button className="flex items-center gap-2" onClick={() => {
            setEditingEmi(null);
            setFormData({
              loan_name: '',
              bank: POPULAR_BANKS[0],
              principal_amount: '',
              interest_rate: '',
              monthly_emi: '',
              remaining_balance: '',
              start_date: new Date().toISOString().split('T')[0],
              end_date: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
              due_date: '5',
              auto_reminder: true,
              status: 'Active'
            });
            setOpen(true);
          }}>
            <Plus className="h-4 w-4" /> Add Loan EMI
          </Button>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>{editingEmi ? 'Edit Loan EMI Details' : 'Setup Loan EMI Schedule'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className={styles.emi__form}>
              <div className="grid grid-cols-2 gap-4">
                <div className={styles['emi__form-group']}>
                  <Label htmlFor="loan_name">Loan Name</Label>
                  <Input
                    id="loan_name"
                    name="loan_name"
                    placeholder="e.g. Home Loan, Car Loan"
                    value={formData.loan_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles['emi__form-group']}>
                  <Label htmlFor="bank">Bank / Lender</Label>
                  <select
                    id="bank"
                    name="bank"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.bank}
                    onChange={(e) => handleSelectChange('bank', e.target.value)}
                  >
                    {POPULAR_BANKS.map(bank => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={styles['emi__form-group']}>
                  <Label htmlFor="principal_amount">Principal Principal ($)</Label>
                  <Input
                    id="principal_amount"
                    name="principal_amount"
                    type="number"
                    placeholder="0.00"
                    value={formData.principal_amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles['emi__form-group']}>
                  <Label htmlFor="interest_rate">Interest Rate (% p.a.)</Label>
                  <Input
                    id="interest_rate"
                    name="interest_rate"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 5.5"
                    value={formData.interest_rate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={styles['emi__form-group']}>
                  <Label htmlFor="monthly_emi">Monthly EMI ($)</Label>
                  <Input
                    id="monthly_emi"
                    name="monthly_emi"
                    type="number"
                    placeholder="0.00"
                    value={formData.monthly_emi}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles['emi__form-group']}>
                  <Label htmlFor="remaining_balance">Remaining Principal ($)</Label>
                  <Input
                    id="remaining_balance"
                    name="remaining_balance"
                    type="number"
                    placeholder="Same as principal if new"
                    value={formData.remaining_balance}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className={styles['emi__form-group']}>
                  <Label htmlFor="due_date">Due Day (1-31)</Label>
                  <Input
                    id="due_date"
                    name="due_date"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.due_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles['emi__form-group']}>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles['emi__form-group']}>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {editingEmi && (
                <div className={styles['emi__form-group']}>
                  <Label htmlFor="status">Loan Status</Label>
                  <select
                    id="status"
                    name="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.status}
                    onChange={(e) => handleSelectChange('status', e.target.value)}
                  >
                    {EMI_STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Notification Switch */}
              <div className="flex items-center space-x-2 border border-border p-3 rounded-lg bg-muted/20">
                <Checkbox
                  id="auto_reminder"
                  checked={formData.auto_reminder}
                  onCheckedChange={handleCheckboxChange}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="auto_reminder"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Enable Auto Reminders
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Sends an alert notification 3 days prior to the due date.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-1">
                <DialogClose render={<Button type="button" variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button type="submit">{editingEmi ? 'Save Changes' : 'Create Schedule'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* EMI Grid Listing */}
      <div className={styles.emi__grid}>
        {loading ? (
          <div className="flex justify-center py-8 col-span-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : emis.map((item) => {
          const paidPercentage = Math.round(
            ((item.principal_amount - item.remaining_balance) / item.principal_amount) * 100
          );

          return (
            <div key={item.id} className={styles.emi__card}>
              <div className={styles['emi__card-header']}>
                <div>
                  <h3 className={styles['emi__card-title']}>{item.loan_name}</h3>
                  <p className={styles['emi__card-subtitle']}>{item.bank} • {item.interest_rate}% interest</p>
                </div>
                <span
                  className={`${styles.emi__badge} ${
                    item.status === 'Active'
                      ? styles['emi__badge--active']
                      : styles['emi__badge--paid']
                  }`}
                >
                  {item.status}
                </span>
              </div>

              {/* Progress Tracker */}
              <div className="space-y-1.5 my-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Repaid: {paidPercentage}%</span>
                  <span>{format(item.principal_amount - item.remaining_balance)} / {format(item.principal_amount)}</span>
                </div>
                <Progress value={paidPercentage} className="h-2" />
              </div>

              {/* Stats Box */}
              <div className={styles.emi__metrics}>
                <div className={styles['emi__metric-box']}>
                  <span className={styles['emi__metric-label']}>Monthly EMI</span>
                  <span className={styles['emi__metric-value']}>{format(item.monthly_emi)}</span>
                </div>
                <div className={styles['emi__metric-box']}>
                  <span className={styles['emi__metric-label']}>Remaining Bal.</span>
                  <span className={styles['emi__metric-value']}>{format(item.remaining_balance)}</span>
                </div>
                <div className={styles['emi__metric-box']}>
                  <span className={styles['emi__metric-label']}>Next Due Day</span>
                  <span className="font-semibold text-xs flex items-center gap-1 mt-0.5 text-amber-500">
                    <Bell className="h-3 w-3" /> Day {item.due_date}
                  </span>
                </div>
                <div className={styles['emi__metric-box']}>
                  <span className={styles['emi__metric-label']}>Term Duration</span>
                  <span className="text-[10px] truncate text-muted-foreground mt-0.5">
                    {item.start_date} to {item.end_date}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                {/* Pay trigger */}
                {item.status === 'Active' && (
                  <Dialog open={payOpen === item.id} onOpenChange={(o) => setPayOpen(o ? item.id : null)}>
                    <DialogTrigger
                      render={
                        <Button
                          variant="outline"
                          className="w-full flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
                          onClick={() => {
                            setPayOpen(item.id);
                            setPayAmount(item.monthly_emi.toString());
                          }}
                        />
                      }
                    >
                      Record Payment <ArrowRight className="h-4 w-4" />
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px]">
                      <DialogHeader>
                        <DialogTitle>Log Loan Repayment</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={(e) => handlePaymentSubmit(e, item.id)} className="space-y-4 py-2">
                        <div className="space-y-2">
                          <Label htmlFor="pay_amount">Repayment Amount ($)</Label>
                          <Input
                            id="pay_amount"
                            type="number"
                            step="0.01"
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            required
                          />
                          <p className="text-[11px] text-muted-foreground">
                            Enter your monthly installment amount or a lump sum prepay. This will reduce your remaining principal balance and record a mock rent/bill transaction.
                          </p>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                          <DialogClose render={<Button type="button" variant="outline" />}>
                            Cancel
                          </DialogClose>
                          <Button type="submit">Submit Payment</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-1.5"
                    onClick={() => startEdit(item)}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center gap-1.5 border border-dashed border-border"
                    onClick={() => deleteEmi(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {emis.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg col-span-full">
            <CreditCard className="h-12 w-12 mx-auto stroke-1 mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">No EMIs Tracked</h3>
            <p className="text-sm mt-1">Setup your credit card loan, car loan or mortgages here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
