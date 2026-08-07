import { useState, useEffect } from 'react';
import { DashboardService } from './services';
import { DashboardActions } from './actions';
import { DashboardMetrics, ChartDataPoint, SpendCategoryPoint } from './types';
import { CATEGORY_COLORS } from './constants';

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    remainingBalance: 0,
    totalEmi: 0,
    totalSubscriptions: 0,
    netWorth: 0,
    dailySpend: 0
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [categoryData, setCategoryData] = useState<SpendCategoryPoint[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const service = new DashboardService();
  const actions = new DashboardActions();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await service.fetchAllData();
      setCurrency(data.profile.currency);

      // 1. Core Metrics Calculations
      const totalIncome = data.incomes.reduce((acc, curr) => acc + Number(curr.amount), 0);
      const totalExpenses = data.expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
      
      // Savings = Sum of current saved in goals + invested in investments
      const totalSavingsInGoals = data.investments.reduce((acc, curr) => acc + Number(curr.invested_amount), 0);
      
      const remainingBalance = totalIncome - totalExpenses;
      const totalEmi = data.emis.filter(e => e.status === 'Active').reduce((acc, curr) => acc + Number(curr.monthly_emi), 0);
      const totalSubscriptions = data.subscriptions.reduce((acc, curr) => acc + Number(curr.monthly_cost), 0);
      
      const totalDebts = 0;
      const totalInvestmentCurrent = data.investments.reduce((acc, curr) => acc + Number(curr.current_value), 0);
      const netWorth = remainingBalance + totalInvestmentCurrent - totalDebts;

      // Daily spend (Today's expenses)
      const todayStr = new Date().toISOString().split('T')[0];
      const dailySpend = data.expenses
        .filter(e => e.date === todayStr)
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

      setMetrics({
        totalIncome,
        totalExpenses,
        totalSavings: totalSavingsInGoals,
        remainingBalance,
        totalEmi,
        totalSubscriptions,
        netWorth,
        dailySpend
      });

      // 2. Recent Transactions (Merge Income and Expenses, sort by date)
      const merged = [
        ...data.incomes.map(i => ({ ...i, type: 'income' })),
        ...data.expenses.map(e => ({ ...e, type: 'expense' }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
       .slice(0, 5);
      setRecentTransactions(merged);

      // 3. Category Spending Breakdown for Pie Chart
      const categoryMap: Record<string, number> = {};
      data.expenses.forEach(e => {
        categoryMap[e.category] = (categoryMap[e.category] || 0) + Number(e.amount);
      });

      const catData: SpendCategoryPoint[] = Object.keys(categoryMap).map(cat => ({
        name: cat,
        value: categoryMap[cat],
        color: CATEGORY_COLORS[cat] || CATEGORY_COLORS.Default
      })).sort((a, b) => b.value - a.value);
      setCategoryData(catData);

      // 4. Cash Flow Data for Area/Bar Chart (last 6 months real calculations)
      const monthsList: { name: string; key: string }[] = [];
      const date = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
        const monthName = d.toLocaleString('en-US', { month: 'short' });
        const yearStr = d.getFullYear();
        const monthStr = String(d.getMonth() + 1).padStart(2, '0');
        monthsList.push({
          name: monthName,
          key: `${yearStr}-${monthStr}` // e.g. "2026-08"
        });
      }

      const realChartData: ChartDataPoint[] = monthsList.map(({ name, key }) => {
        const monthlyIncome = data.incomes
          .filter((curr: any) => curr.date && curr.date.startsWith(key))
          .reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

        const monthlyExpense = data.expenses
          .filter((curr: any) => curr.date && curr.date.startsWith(key))
          .reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

        return {
          name: name,
          income: Math.round(monthlyIncome),
          expense: Math.round(monthlyExpense),
          savings: Math.max(0, Math.round(monthlyIncome - monthlyExpense))
        };
      });
      setChartData(realChartData);

    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Watch for updates (can use custom window events or simple state syncing)
    window.addEventListener('pf_data_updated', loadData);
    return () => window.removeEventListener('pf_data_updated', loadData);
  }, []);

  return {
    loading,
    metrics,
    chartData,
    categoryData,
    currency,
    recentTransactions,
    actions,
    refresh: loadData
  };
}
