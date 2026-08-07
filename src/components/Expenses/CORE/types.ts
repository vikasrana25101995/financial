import { Expense as DbExpense } from '@/lib/db';

export interface Expense extends DbExpense {
  is_subscription?: boolean;
}

export interface ExpenseFormData {
  name: string;
  amount: number;
  category: string;
  date: string;
  payment_method: string;
  merchant?: string;
  notes?: string;
  receipt_url?: string;
  tags?: string[];
  is_recurring: boolean;
  recurring_interval?: string;
  investment_type?: string;
  current_value?: number;
}
