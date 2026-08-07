import { Subscription } from '@/lib/db';

export type { Subscription };

export interface SubscriptionFormData {
  service_name: string;
  monthly_cost: number;
  billing_cycle: string;
  renewal_date: string;
  auto_renew: boolean;
  category: string;
  payment_method: string;
}
