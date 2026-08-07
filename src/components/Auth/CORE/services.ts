import { supabase } from '@/lib/supabase';
import { AuthResponse } from './types';

export class AuthService {
  async authenticateUser(email: string): Promise<AuthResponse> {
    if (supabase) {
      // Simulate Supabase login
      const { data, error } = await supabase.auth.signInWithOtp({ email });
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Check email for magic link', email };
    }
    return { success: true, message: 'Logged in successfully (offline)', email };
  }
}
