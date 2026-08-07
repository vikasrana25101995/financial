import { useState, useEffect } from 'react';
import { SubscriptionsService } from './services';
import { SubscriptionsActions } from './actions';
import { Subscription, SubscriptionFormData } from './types';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const service = new SubscriptionsService();
  const actions = new SubscriptionsActions();

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const list = await service.getSubscriptions();
      setSubscriptions(list);
    } catch (err) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscription = async (formData: SubscriptionFormData) => {
    if (!actions.validate(formData)) return false;
    try {
      // Auto-log a recurring expense mock
      const monthlyCost = Number(formData.monthly_cost);

      await service.addSubscription({
        service_name: formData.service_name,
        monthly_cost: monthlyCost,
        billing_cycle: formData.billing_cycle,
        renewal_date: formData.renewal_date,
        auto_renew: formData.auto_renew,
        category: formData.category,
        payment_method: formData.payment_method
      });

      toast.success(`Registered subscription: ${formData.service_name}`);
      loadSubscriptions();
      actions.notifyUpdate();
      return true;
    } catch (err) {
      toast.error('Failed to save subscription');
      return false;
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    try {
      await service.deleteSubscription(id);
      toast.success('Subscription cancelled and deleted from records');
      loadSubscriptions();
      actions.notifyUpdate();
    } catch (err) {
      toast.error('Failed to delete subscription');
    }
  };

  const handleUpdateSubscription = async (id: string, formData: SubscriptionFormData) => {
    if (!actions.validate(formData)) return false;
    try {
      const monthlyCost = Number(formData.monthly_cost);

      await service.updateSubscription(id, {
        service_name: formData.service_name,
        monthly_cost: monthlyCost,
        billing_cycle: formData.billing_cycle,
        renewal_date: formData.renewal_date,
        auto_renew: formData.auto_renew,
        category: formData.category,
        payment_method: formData.payment_method
      });

      toast.success(`Updated subscription: ${formData.service_name}`);
      loadSubscriptions();
      actions.notifyUpdate();
      return true;
    } catch (err) {
      toast.error('Failed to update subscription');
      return false;
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  return {
    subscriptions,
    loading,
    currency,
    addSubscription: handleAddSubscription,
    updateSubscription: handleUpdateSubscription,
    deleteSubscription: handleDeleteSubscription,
    format: (val: number) => actions.formatCurrency(val, currency)
  };
}
