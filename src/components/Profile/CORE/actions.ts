import { ProfileFormData } from './types';
import { toast } from 'sonner';

export class ProfileActions {
  validate(data: ProfileFormData): boolean {
    if (!data.full_name.trim()) {
      toast.error('Full name is required');
      return false;
    }
    if (!data.currency) {
      toast.error('Currency is required');
      return false;
    }
    return true;
  }

  notifyUpdate() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('pf_data_updated'));
    }
  }
}
