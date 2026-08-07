'use server';

import crypto from 'crypto';
import { cookies } from 'next/headers';
import { pool } from './db-pool';

const SESSION_SECRET = process.env.SESSION_SECRET || 'a-very-long-fallback-secret-key-1234567890';

// Password Hashing Helpers
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  } catch {
    return false;
  }
}

// Session Token Helpers
function createSessionToken(userId: string): string {
  const expires = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const data = `${userId}.${expires}`;
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex');
  return `${data}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const [userId, expiresStr, signature] = token.split('.');
    if (!userId || !expiresStr || !signature) return null;

    const expires = parseInt(expiresStr, 10);
    if (Date.now() > expires) return null; // Expired

    const data = `${userId}.${expiresStr}`;
    const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex');

    if (signature === expectedSignature) {
      return userId;
    }
  } catch {}
  return null;
}

export async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie?.value) return null;
  return verifySessionToken(sessionCookie.value);
}

// Exported Server Actions

export async function getSessionUser() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return null;

    const res = await pool.query(
      `SELECT u.id, u.email, p.full_name, p.avatar_url, p.currency
       FROM public.users u
       JOIN public.profiles p ON u.id = p.id
       WHERE u.id = $1`,
      [userId]
    );

    if (res.rows.length === 0) return null;

    const row = res.rows[0];
    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      currency: row.currency,
    };
  } catch (error) {
    console.error('Error in getSessionUser:', error);
    return null;
  }
}

export async function signUpAction(email: string, password?: string, fullName?: string) {
  try {
    const plainPassword = password || 'password123';
    const name = fullName || 'New User';
    const emailLower = email.toLowerCase().trim();

    // Check if user exists
    const checkUser = await pool.query('SELECT id FROM public.users WHERE email = $1', [emailLower]);
    if (checkUser.rows.length > 0) {
      return { success: false, message: 'An account with this email already exists' };
    }

    const passwordHash = hashPassword(plainPassword);

    // Insert user
    const userInsert = await pool.query(
      'INSERT INTO public.users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [emailLower, passwordHash]
    );
    const userId = userInsert.rows[0].id;

    // Insert profile
    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
    await pool.query(
      'INSERT INTO public.profiles (id, full_name, avatar_url, currency) VALUES ($1, $2, $3, $4)',
      [userId, name, avatarUrl, 'USD']
    );

    // Create session cookie
    const token = createSessionToken(userId);
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return {
      success: true,
      message: 'Account created successfully!',
      user: {
        id: userId,
        email: emailLower,
        fullName: name,
        avatarUrl,
      },
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    return { success: false, message: error.message || 'Failed to sign up' };
  }
}

export async function loginAction(email: string, password?: string) {
  try {
    const emailLower = email.toLowerCase().trim();

    // Get user
    const res = await pool.query('SELECT id, password_hash FROM public.users WHERE email = $1', [emailLower]);
    if (res.rows.length === 0) {
      return { success: false, message: 'Invalid email or password' };
    }

    const userId = res.rows[0].id;
    const storedHash = res.rows[0].password_hash;

    // Handle Quick Demo Login without password verification if password is not provided (optional demo mode)
    const isDemoPasswordless = emailLower === 'demo@antigravity.finance' && !password;

    if (!isDemoPasswordless && password) {
      const isValid = verifyPassword(password, storedHash);
      if (!isValid) {
        return { success: false, message: 'Invalid email or password' };
      }
    } else if (!isDemoPasswordless && !password) {
      return { success: false, message: 'Password is required' };
    }

    // Get profile
    const profileRes = await pool.query(
      'SELECT full_name, avatar_url, currency FROM public.profiles WHERE id = $1',
      [userId]
    );
    const profile = profileRes.rows[0] || {};

    // Create session cookie
    const token = createSessionToken(userId);
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return {
      success: true,
      message: 'Logged in successfully!',
      user: {
        id: userId,
        email: emailLower,
        fullName: profile.full_name || 'User',
        avatarUrl: profile.avatar_url || '',
      },
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, message: error.message || 'Failed to log in' };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('session');
    return { success: true, message: 'Logged out successfully' };
  } catch (error: any) {
    console.error('Logout error:', error);
    return { success: false, message: error.message || 'Failed to log out' };
  }
}

export async function updatePasswordAction(password: string) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, message: 'Not authenticated' };
    }

    const passwordHash = hashPassword(password);
    await pool.query('UPDATE public.users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);

    return { success: true, message: 'Password updated successfully!' };
  } catch (error: any) {
    console.error('Update password error:', error);
    return { success: false, message: error.message || 'Failed to update password' };
  }
}
