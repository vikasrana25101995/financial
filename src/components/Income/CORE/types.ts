import { Income } from '@/lib/db';

export type { Income };

export interface IncomeFormData {
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  payment_method: string;
}
