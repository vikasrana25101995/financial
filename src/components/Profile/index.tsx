'use client';

import React, { useState, useEffect } from 'react';
import { useProfile } from './CORE/hooks';
import { SUPPORTED_CURRENCIES } from './CORE/constants';
import styles from './STYLE/index.module.scss';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

export default function ProfileComponent() {
  const { profile, loading, updateProfile } = useProfile();
  const [formData, setFormData] = useState({
    full_name: '',
    currency: 'USD'
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name,
        currency: profile.currency
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      full_name: formData.full_name,
      currency: formData.currency
    });
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={styles.profile}>
      {/* Page Header */}
      <div className={styles.profile__header}>
        <h1 className={styles.profile__title}>Profile Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal settings, currency preferences, and default values.
        </p>
      </div>

      {/* Profile Card */}
      <div className={styles.profile__card}>
        <form onSubmit={handleSubmit} className={styles.profile__form}>
          <div className="flex items-center gap-4 border-b border-border pb-4 mb-2">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{formData.full_name || 'Loading Name'}</h3>
              <p className="text-xs text-muted-foreground">ID: {profile?.id ? `${profile.id.substring(0, 13)}...` : 'Loading...'}</p>
            </div>
          </div>

          <div className={styles['profile__form-group']}>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles['profile__form-group']}>
            <Label htmlFor="currency">Base Currency / Locale</Label>
            <select
              id="currency"
              name="currency"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formData.currency}
              onChange={(e) => handleSelectChange('currency', e.target.value)}
            >
              {SUPPORTED_CURRENCIES.map(curr => (
                <option key={curr.code} value={curr.code}>{curr.label}</option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground mt-1">
              Note: Updating currency changes standard display formatting across all charts and ledger entries.
            </p>
          </div>

          <Button type="submit" className="w-full mt-2">Save Profile Settings</Button>
        </form>
      </div>
    </div>
  );
}
