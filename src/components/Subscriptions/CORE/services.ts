import { db, Subscription } from '@/lib/db';

export class SubscriptionsService {
  async getSubscriptions(): Promise<Subscription[]> {
    return db.getSubscriptions();
  }

  async addSubscription(sub: Omit<Subscription, 'id' | 'user_id'>): Promise<Subscription> {
    return db.addSubscription(sub);
  }

  async deleteSubscription(id: string): Promise<boolean> {
    return db.deleteSubscription(id);
  }

  async updateSubscription(id: string, sub: Partial<Subscription>): Promise<Subscription> {
    return db.updateSubscription(id, sub);
  }
}
