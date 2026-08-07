import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from './services';
import { AuthActions } from './actions';
import { toast } from 'sonner';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const service = new AuthService();
  const actions = new AuthActions();

  const handleLogin = async (email: string) => {
    if (!actions.validateEmail(email)) return false;
    try {
      setLoading(true);
      const res = await service.authenticateUser(email);
      if (res.success) {
        toast.success(res.message);
        // Simulate navigation to dashboard
        setTimeout(() => {
          router.push('/');
        }, 1000);
        return true;
      } else {
        toast.error(res.message);
        return false;
      }
    } catch (e) {
      toast.error('Authentication process encountered an error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    login: handleLogin
  };
}
