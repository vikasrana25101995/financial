import { Emi } from '@/lib/db';

export type { Emi };

export interface EmiFormData {
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
