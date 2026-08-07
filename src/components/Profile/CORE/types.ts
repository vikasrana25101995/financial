import { Profile } from '@/lib/db';

export type { Profile };

export interface ProfileFormData {
  full_name: string;
  currency: string;
}
