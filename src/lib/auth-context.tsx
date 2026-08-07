'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import {
  getSessionUser,
  loginAction,
  signUpAction,
  logoutAction,
  updatePasswordAction
} from './auth-actions';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  currency?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isOffline: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isOffline = false;

  // Initial session check
  useEffect(() => {
    async function checkSession() {
      try {
        const sessionUser = await getSessionUser();
        if (sessionUser) {
          setUser({
            id: sessionUser.id,
            email: sessionUser.email,
            fullName: sessionUser.fullName || '',
            avatarUrl: sessionUser.avatarUrl || '',
            currency: sessionUser.currency || 'USD'
          });
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('Session initialization error:', e);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, [pathname]); // Check session on route changes to ensure page-level sync

  // Listen to profile updates (e.g. currency change) to synchronize auth user state
  useEffect(() => {
    async function handleDataUpdate() {
      try {
        const sessionUser = await getSessionUser();
        if (sessionUser) {
          setUser({
            id: sessionUser.id,
            email: sessionUser.email,
            fullName: sessionUser.fullName || '',
            avatarUrl: sessionUser.avatarUrl || '',
            currency: sessionUser.currency || 'USD'
          });
        }
      } catch (e) {
        console.error('Failed to sync auth user details', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('pf_data_updated', handleDataUpdate);
      return () => window.removeEventListener('pf_data_updated', handleDataUpdate);
    }
  }, []);

  // Route protection
  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname?.startsWith('/auth');

    if (!user && !isAuthRoute) {
      router.push('/auth/login');
    } else if (user && isAuthRoute) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  // Auth Operations
  const login = async (email: string, password?: string) => {
    try {
      setLoading(true);
      const res = await loginAction(email, password);
      if (res.success && res.user) {
        const sessionUser = await getSessionUser();
        setUser({
          id: res.user.id,
          email: res.user.email,
          fullName: res.user.fullName,
          avatarUrl: res.user.avatarUrl,
          currency: sessionUser?.currency || 'USD'
        });
        return { success: true, message: res.message };
      } else {
        return { success: false, message: res.message || 'Invalid email or password' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to authenticate' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password?: string, fullName?: string) => {
    try {
      setLoading(true);
      const res = await signUpAction(email, password, fullName);
      if (res.success && res.user) {
        const sessionUser = await getSessionUser();
        setUser({
          id: res.user.id,
          email: res.user.email,
          fullName: res.user.fullName,
          avatarUrl: res.user.avatarUrl,
          currency: sessionUser?.currency || 'USD'
        });
        return { success: true, message: res.message };
      } else {
        return { success: false, message: res.message || 'Failed to sign up' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to sign up' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const res = await logoutAction();
      if (res.success) {
        setUser(null);
        router.push('/auth/login');
        return { success: true, message: 'Logged out successfully' };
      } else {
        return { success: false, message: res.message || 'Failed to log out' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to logout' };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    // With direct PostgreSQL, standard practice is setting up a mailer (like Resend / Nodemailer).
    // For now, since mailer isn't configured, we simulate password reset or instruct user.
    return {
      success: true,
      message: 'Password reset feature requires nodemailer integration. Please update password directly from Profile page when logged in.'
    };
  };

  const updatePassword = async (password: string) => {
    try {
      setLoading(true);
      const res = await updatePasswordAction(password);
      if (res.success) {
        return { success: true, message: 'Password updated successfully!' };
      } else {
        return { success: false, message: res.message || 'Failed to update password' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to update password' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOffline,
        login,
        signUp,
        logout,
        resetPassword,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
