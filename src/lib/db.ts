import * as dbActions from './db-actions';

// Export TS types for our DB entities (matching schema.sql exactly)
export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  currency: string;
}

export interface Income {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  payment_method: string;
}

export interface Expense {
  id: string;
  user_id: string;
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

export interface Emi {
  id: string;
  user_id: string;
  loan_name: string;
  bank: string;
  principal_amount: number;
  interest_rate: number;
  monthly_emi: number;
  remaining_balance: number;
  start_date: string;
  end_date: string;
  due_date: number;
  auto_reminder: boolean;
  status: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  service_name: string;
  monthly_cost: number;
  billing_cycle: string;
  renewal_date: string;
  auto_renew: boolean;
  category: string;
  payment_method: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  alert_threshold: number;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_saved: number;
  target_date: string;
  notes?: string;
}

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  type: string;
  invested_amount: number;
  current_value: number;
  purchase_date?: string;
}

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  type: string;
  total_amount: number;
  interest_rate: number;
  monthly_payment: number;
  remaining_amount: number;
}

export interface Bill {
  id: string;
  user_id: string;
  name: string;
  category: string;
  amount: number;
  due_date: string;
  status: string;
}

// Export the db client which wraps our postgres server actions
export const db = dbActions;
