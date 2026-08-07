import { IncomeFormData } from './types';
import { toast } from 'sonner';

export class IncomeActions {
  validate(data: IncomeFormData): boolean {
    if (!data.title.trim()) {
      toast.error('Title is required');
      return false;
    }
    if (Number(data.amount) <= 0 || isNaN(Number(data.amount))) {
      toast.error('Amount must be greater than zero');
      return false;
    }
    if (!data.category) {
      toast.error('Category is required');
      return false;
    }
    if (!data.payment_method) {
      toast.error('Payment method is required');
      return false;
    }
    return true;
  }

  notifyUpdate() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('pf_data_updated'));
    }
  }

  formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  }
}
