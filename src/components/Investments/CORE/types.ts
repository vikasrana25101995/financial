import { Investment } from '@/lib/db';

export type { Investment };

export interface InvestmentFormData {
  name: string;
  type: string;
  invested_amount: number;
  current_value: number;
  purchase_date?: string;
}

export interface PortfolioDistribution {
  name: string;
  value: number;
  color: string;
}
