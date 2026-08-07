import { toast } from 'sonner';

export class AuthActions {
  validateEmail(email: string): boolean {
    if (!email.trim()) {
      toast.error('Email is required');
      return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  }
}
