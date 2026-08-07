import { Expense } from '@/lib/db';

export type { Expense };

export interface PresetItem {
  name: string;
  amount: number;
  category: string;
  merchant: string;
  payment_method: string;
  emoji: string;
}

export interface SpendSummary {
  today: number;
  yesterday: number;
  thisWeek: number;
  thisMonth: number;
}
