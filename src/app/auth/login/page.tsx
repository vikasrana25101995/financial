'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(email, password);
      if (res.success) {
        toast.success(res.message);
      } else {
        setError(res.message);
        toast.error(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async () => {
    setError('');
    try {
      setSubmitting(true);
      const res = await login('demo@antigravity.finance');
      if (res.success) {
        toast.success('Logged in as Demo User successfully!');
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to trigger demo login.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md px-6 py-8"
    >
      <div className="relative overflow-hidden bg-card/60 backdrop-blur-xl border border-border/80 shadow-2xl rounded-3xl p-8 space-y-6">
        
        {/* Glow accent inside card */}
        <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-24 h-24 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-col items-center text-center space-y-2 relative z-10">
          <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-inner mb-2 select-none">
            <span className="text-2xl animate-spin" style={{ animationDuration: '6s' }}>🪙</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Enter your details to log in to your AntiGravity Finance account.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-3"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-semibold">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/75" />
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 bg-background/50 border-border/80 focus-visible:ring-amber-500 focus-visible:border-amber-500 rounded-xl"
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password
              </Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-amber-500 hover:text-amber-600 font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/75" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-10 bg-background/50 border-border/80 focus-visible:ring-amber-500 focus-visible:border-amber-500 rounded-xl"
                required
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/75 hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-2 px-4 rounded-xl shadow-lg hover:shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
            disabled={submitting}
          >
            {submitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="relative flex items-center justify-center py-2 z-10">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <span className="relative bg-transparent px-3 text-xs text-muted-foreground font-medium select-none">
            or continue with
          </span>
        </div>

        {/* Demo Login Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleQuickDemo}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-500 focus-visible:ring-amber-500 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Demo Quick Login</span>
        </Button>

        {/* Footer Link */}
        <div className="text-center text-sm text-muted-foreground relative z-10 pt-2 border-t border-border/40">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="text-amber-500 hover:text-amber-600 font-semibold transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
