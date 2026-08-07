'use client';

import React, { useState } from 'react';
import { useSubscriptions } from './CORE/hooks';
import { Subscription } from './CORE/types';
import { SUBSCRIPTION_CATEGORIES, BILLING_CYCLES, PAYMENT_METHODS } from './CORE/constants';
import styles from './STYLE/index.module.scss';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tv, Plus, Trash2, Calendar, CreditCard, RefreshCw, Pencil } from 'lucide-react';

export default function SubscriptionsComponent() {
  const { subscriptions, loading, addSubscription, updateSubscription, deleteSubscription, format } = useSubscriptions();
  const [open, setOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState(() => ({
    service_name: '',
    monthly_cost: '',
    billing_cycle: BILLING_CYCLES[0], // Monthly
    renewal_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    auto_renew: true,
    category: SUBSCRIPTION_CATEGORIES[0],
    payment_method: PAYMENT_METHODS[0]
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, auto_renew: checked }));
  };

  const startEdit = (item: Subscription) => {
    setEditingSubscription(item);
    setFormData({
      service_name: item.service_name,
      monthly_cost: item.monthly_cost.toString(),
      billing_cycle: item.billing_cycle,
      renewal_date: item.renewal_date,
      auto_renew: item.auto_renew,
      category: item.category,
      payment_method: item.payment_method
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      service_name: formData.service_name,
      monthly_cost: parseFloat(formData.monthly_cost),
      billing_cycle: formData.billing_cycle,
      renewal_date: formData.renewal_date,
      auto_renew: formData.auto_renew,
      category: formData.category,
      payment_method: formData.payment_method
    };

    let success = false;
    if (editingSubscription) {
      success = await updateSubscription(editingSubscription.id, payload);
    } else {
      success = await addSubscription(payload);
    }

    if (success) {
      setOpen(false);
      setEditingSubscription(null);
      setFormData({
        service_name: '',
        monthly_cost: '',
        billing_cycle: BILLING_CYCLES[0],
        renewal_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        auto_renew: true,
        category: SUBSCRIPTION_CATEGORIES[0],
        payment_method: PAYMENT_METHODS[0]
      });
    }
  };

  // Calculate total monthly costs (convert yearly to monthly for sum)
  const totalMonthlyCost = subscriptions.reduce((acc, curr) => {
    const cost = Number(curr.monthly_cost);
    if (curr.billing_cycle === 'Yearly') {
      return acc + (cost / 12);
    }
    return acc + cost;
  }, 0);

  return (
    <div className={styles.subscriptions}>
      {/* Page Header */}
      <div className={styles.subscriptions__header}>
        <div>
          <h1 className={styles.subscriptions__title}>Subscriptions Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Keep tabs on active subscriptions, gym memberships, SaaS, and media bills.
          </p>
        </div>

        {/* Add subscription dialog trigger */}
        <Dialog open={open} onOpenChange={(o) => {
          setOpen(o);
          if (!o) {
            setEditingSubscription(null);
            setFormData({
              service_name: '',
              monthly_cost: '',
              billing_cycle: BILLING_CYCLES[0],
              renewal_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
              auto_renew: true,
              category: SUBSCRIPTION_CATEGORIES[0],
              payment_method: PAYMENT_METHODS[0]
            });
          }
        }}>
          <Button className="flex items-center gap-2" onClick={() => {
            setEditingSubscription(null);
            setFormData({
              service_name: '',
              monthly_cost: '',
              billing_cycle: BILLING_CYCLES[0],
              renewal_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
              auto_renew: true,
              category: SUBSCRIPTION_CATEGORIES[0],
              payment_method: PAYMENT_METHODS[0]
            });
            setOpen(true);
          }}>
            <Plus className="h-4 w-4" /> Add Subscription
          </Button>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingSubscription ? 'Edit Subscription' : 'Track Subscription'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className={styles.subscriptions__form}>
              <div className={styles['subscriptions__form-group']}>
                <Label htmlFor="service_name">Service / Service Name</Label>
                <Input
                  id="service_name"
                  name="service_name"
                  placeholder="e.g. Netflix, Spotify, AWS"
                  value={formData.service_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={styles['subscriptions__form-group']}>
                  <Label htmlFor="monthly_cost">Billing Cost ($)</Label>
                  <Input
                    id="monthly_cost"
                    name="monthly_cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.monthly_cost}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles['subscriptions__form-group']}>
                  <Label htmlFor="billing_cycle">Billing Cycle</Label>
                  <select
                    id="billing_cycle"
                    name="billing_cycle"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.billing_cycle}
                    onChange={(e) => handleSelectChange('billing_cycle', e.target.value)}
                  >
                    {BILLING_CYCLES.map(cycle => (
                      <option key={cycle} value={cycle}>{cycle}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={styles['subscriptions__form-group']}>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    name="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.category}
                    onChange={(e) => handleSelectChange('category', e.target.value)}
                  >
                    {SUBSCRIPTION_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className={styles['subscriptions__form-group']}>
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

              <div className={styles['subscriptions__form-group']}>
                <Label htmlFor="renewal_date">Renewal Date</Label>
                <Input
                  id="renewal_date"
                  name="renewal_date"
                  type="date"
                  value={formData.renewal_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="flex items-center space-x-2 border border-border p-3 rounded-lg bg-muted/20">
                <Checkbox
                  id="auto_renew"
                  checked={formData.auto_renew}
                  onCheckedChange={handleCheckboxChange}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="auto_renew"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Auto Renew Enabled
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Remind me before this renewing subscription triggers charges.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-1">
                <DialogClose render={<Button type="button" variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button type="submit">{editingSubscription ? 'Save Changes' : 'Track Subscription'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <div className={styles.subscriptions__summary}>
        <div>
          <span className={styles['subscriptions__summary-title']}>Total Subscription Cost</span>
          <p className="text-xs text-muted-foreground mt-0.5">Aggregated monthly load</p>
        </div>
        <span className={styles['subscriptions__summary-value']}>{format(totalMonthlyCost)}/mo</span>
      </div>

      {/* Subscriptions Grid */}
      <div className={styles.subscriptions__grid}>
        {loading ? (
          <div className="flex justify-center py-8 col-span-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : subscriptions.map((item) => (
          <div key={item.id} className={styles.subscriptions__card}>
            <div className={styles['subscriptions__card-header']}>
              <div>
                <h3 className={styles['subscriptions__card-title']}>{item.service_name}</h3>
                <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400">
                  {item.category}
                </span>
              </div>
              <span className={styles['subscriptions__card-cost']}>
                {format(item.monthly_cost)}
                <span className="text-[10px] text-muted-foreground font-medium block text-right">
                  /{item.billing_cycle === 'Monthly' ? 'mo' : 'yr'}
                </span>
              </span>
            </div>

            <div className={styles.subscriptions__meta}>
              <div className={styles['subscriptions__meta-item']}>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Next Renewal</span>
                <span className="font-semibold text-foreground">{item.renewal_date}</span>
              </div>
              <div className={styles['subscriptions__meta-item']}>
                <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" /> Paid via</span>
                <span>{item.payment_method}</span>
              </div>
              <div className={styles['subscriptions__meta-item']}>
                <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Auto Renew</span>
                <span className={item.auto_renew ? 'text-emerald-500 font-medium' : 'text-muted-foreground'}>
                  {item.auto_renew ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Actions: Edit and Cancel Tracking */}
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 flex items-center justify-center gap-1.5"
                onClick={() => startEdit(item)}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center gap-1.5 border border-dashed border-border"
                onClick={() => deleteSubscription(item.id)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Cancel
              </Button>
            </div>
          </div>
        ))}
        {subscriptions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg col-span-full">
            <Tv className="h-12 w-12 mx-auto stroke-1 mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">No Subscriptions Found</h3>
            <p className="text-sm mt-1">Add your Netflix, Spotify, gym or digital SaaS licenses.</p>
          </div>
        )}
      </div>
    </div>
  );
}
