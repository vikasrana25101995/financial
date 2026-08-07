'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await resetPassword(email);
      if (res.success) {
        setSubmitted(true);
        toast.success(res.message);
      } else {
        setError(res.message);
        toast.error(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset. Please try again.');
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
            Reset Password
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Enter your email and we will send you instructions to reset your password.
          </p>
        </div>

        {/* Success View */}
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 relative z-10 py-4"
          >
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Check your Inbox</h3>
              <p className="text-sm text-muted-foreground">
                We have sent password reset instructions to <strong className="text-foreground">{email}</strong>.
              </p>
            </div>
            <div className="pt-4">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-amber-500 hover:text-amber-600 font-semibold transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Login</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Input Form */
          <>
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

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-2 px-4 rounded-xl shadow-lg hover:shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                disabled={submitting}
              >
                {submitting ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            {/* Footer Link */}
            <div className="text-center text-sm text-muted-foreground relative z-10 pt-2 border-t border-border/40">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 hover:text-foreground font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
