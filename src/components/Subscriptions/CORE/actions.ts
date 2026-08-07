import { SubscriptionFormData } from './types';
import { toast } from 'sonner';

export class SubscriptionsActions {
  validate(data: SubscriptionFormData): boolean {
    if (!data.service_name.trim()) {
      toast.error('Service name is required');
      return false;
    }
    if (Number(data.monthly_cost) <= 0 || isNaN(Number(data.monthly_cost))) {
      toast.error('Cost must be greater than zero');
      return false;
    }
    if (!data.billing_cycle) {
      toast.error('Billing cycle is required');
      return false;
    }
    if (!data.renewal_date) {
      toast.error('Renewal date is required');
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
