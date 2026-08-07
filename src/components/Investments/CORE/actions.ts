import { InvestmentFormData } from './types';
import { toast } from 'sonner';

export class InvestmentsActions {
  validate(data: InvestmentFormData): boolean {
    if (!data.name.trim()) {
      toast.error('Asset name is required');
      return false;
    }
    if (!data.type) {
      toast.error('Asset type is required');
      return false;
    }
    if (Number(data.invested_amount) <= 0 || isNaN(Number(data.invested_amount))) {
      toast.error('Invested amount must be greater than zero');
      return false;
    }
    if (Number(data.current_value) < 0 || isNaN(Number(data.current_value))) {
      toast.error('Current value must be positive');
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
