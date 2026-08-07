import { useState, useEffect, useMemo } from 'react';
import { InvestmentsService } from './services';
import { InvestmentsActions } from './actions';
import { Investment, InvestmentFormData, PortfolioDistribution } from './types';
import { PORTFOLIO_COLORS } from './constants';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export function useInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const service = new InvestmentsService();
  const actions = new InvestmentsActions();

  const loadInvestments = async () => {
    try {
      setLoading(true);
      const list = await service.getInvestments();
      setInvestments(list);
    } catch (err) {
      toast.error('Failed to load portfolio investments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvestment = async (formData: InvestmentFormData) => {
    if (!actions.validate(formData)) return false;
    try {
      await service.addInvestment({
        name: formData.name,
        type: formData.type,
        invested_amount: Number(formData.invested_amount),
        current_value: Number(formData.current_value),
        purchase_date: formData.purchase_date
      });

      // Also trigger a mock expense entry for this investment contribution!
      try {
        const { db } = await import('@/lib/db');
        await db.addExpense({
          name: `Investment: ${formData.name}`,
          amount: Number(formData.invested_amount),
          category: 'Investment',
          date: formData.purchase_date || new Date().toISOString().split('T')[0],
          payment_method: 'Bank Transfer',
          notes: `Automatic investment purchase log.`,
          tags: ['investment', formData.type.toLowerCase()],
          is_recurring: false
        });
      } catch (ex) {
        console.error('Failed to log auto-expense for investment purchase', ex);
      }

      toast.success('Asset logged successfully into portfolio');
      loadInvestments();
      actions.notifyUpdate();
      return true;
    } catch (err) {
      toast.error('Failed to save investment');
      return false;
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    try {
      await service.deleteInvestment(id);
      toast.success('Asset removed from portfolio');
      loadInvestments();
      actions.notifyUpdate();
    } catch (err) {
      toast.error('Failed to remove asset');
    }
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  // Aggregated Portfolio Stats
  const stats = useMemo(() => {
    const totalInvested = investments.reduce((acc, curr) => acc + Number(curr.invested_amount), 0);
    const totalCurrent = investments.reduce((acc, curr) => acc + Number(curr.current_value), 0);
    const netGain = totalCurrent - totalInvested;
    const roi = totalInvested > 0 ? (netGain / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalCurrent,
      netGain,
      roi
    };
  }, [investments]);

  // Portfolio Distribution by Asset Type
  const distribution = useMemo(() => {
    const distributionMap: Record<string, number> = {};
    investments.forEach(inv => {
      distributionMap[inv.type] = (distributionMap[inv.type] || 0) + Number(inv.current_value);
    });

    return Object.keys(distributionMap).map(type => ({
      name: type,
      value: distributionMap[type],
      color: PORTFOLIO_COLORS[type] || '#a855f7'
    }));
  }, [investments]);

  return {
    investments,
    loading,
    currency,
    stats,
    distribution,
    addInvestment: handleAddInvestment,
    deleteInvestment: handleDeleteInvestment,
    format: (val: number) => actions.formatCurrency(val, currency)
  };
}
