'use client';

import React, { useState } from 'react';
import { useAuth } from './CORE/hooks';
import styles from './STYLE/index.module.scss';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Mail, Sparkles } from 'lucide-react';

export default function AuthComponent() {
  const { loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email);
  };

  return (
    <div className={styles.auth}>
      <div className={styles.auth__card}>
        {/* Header */}
        <div className={styles.auth__header}>
          <div className={styles.auth__logo}>🪙 AntiGravity Finance</div>
          <h2 className={styles.auth__title}>Welcome Back</h2>
          <p className={styles.auth__subtitle}>Enter your details to log in to your account</p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className={styles.auth__form}>
          <div className={styles['auth__form-group']}>
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles['auth__form-group']}>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                required
                disabled={loading}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In with Email'}
          </Button>
        </form>

        <div className={styles.auth__divider}>or continue with</div>

        {/* Google OAuth simulation */}
        <Button
          variant="outline"
          onClick={() => {
            setEmail('demo@antigravity.finance');
            login('demo@antigravity.finance');
          }}
          disabled={loading}
          className={styles['auth__social-btn']}
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Demo Quick Login</span>
        </Button>
      </div>
    </div>
  );
}
