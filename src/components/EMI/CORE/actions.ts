import { EmiFormData } from './types';
import { toast } from 'sonner';

export class EmiActions {
  validate(data: EmiFormData): boolean {
    if (!data.loan_name.trim()) {
      toast.error('Loan name is required');
      return false;
    }
    if (!data.bank) {
      toast.error('Bank is required');
      return false;
    }
    if (Number(data.principal_amount) <= 0 || isNaN(Number(data.principal_amount))) {
      toast.error('Principal amount must be greater than zero');
      return false;
    }
    if (Number(data.interest_rate) < 0 || isNaN(Number(data.interest_rate))) {
      toast.error('Interest rate must be zero or positive');
      return false;
    }
    if (Number(data.monthly_emi) <= 0 || isNaN(Number(data.monthly_emi))) {
      toast.error('Monthly EMI must be greater than zero');
      return false;
    }
    if (Number(data.remaining_balance) < 0 || isNaN(Number(data.remaining_balance))) {
      toast.error('Remaining balance must be positive');
      return false;
    }
    if (Number(data.due_date) < 1 || Number(data.due_date) > 31) {
      toast.error('Due date must be between 1 and 31');
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
