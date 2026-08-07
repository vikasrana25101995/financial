import { useState, useEffect, useMemo } from 'react';
import { ReportsService } from './services';
import { ReportsActions } from './actions';
import { CategoryBreakdown, MonthlyTrend } from './types';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export function useReports() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const service = new ReportsService();
  const actions = new ReportsActions();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await service.fetchFinancialData();
      setData(res);
    } catch (e) {
      toast.error('Failed to load reports analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('pf_data_updated', loadData);
    return () => window.removeEventListener('pf_data_updated', loadData);
  }, []);

  // 1. Calculate Monthly Trend (Income vs Expense vs Savings) based on actual data
  const monthlyTrends = useMemo<MonthlyTrend[]>(() => {
    if (!data) return [];
    
    // Dynamically generate the last 6 months (short name and YYYY-MM prefix)
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

    return monthsList.map(({ name, key }) => {
      const monthlyIncome = data.incomes
        .filter((curr: any) => curr.date && curr.date.startsWith(key))
        .reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

      const monthlyExpense = data.expenses
        .filter((curr: any) => curr.date && curr.date.startsWith(key))
        .reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

      return {
        month: name,
        income: Math.round(monthlyIncome),
        expense: Math.round(monthlyExpense),
        savings: Math.max(0, Math.round(monthlyIncome - monthlyExpense))
      };
    });
  }, [data]);

  // 2. Calculate Category Breakdown
  const categoryBreakdown = useMemo<CategoryBreakdown[]>(() => {
    if (!data) return [];
    const map: Record<string, number> = {};
    data.expenses.forEach((e: any) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });
    return Object.keys(map).map(k => ({
      name: k,
      value: map[k]
    })).sort((a, b) => b.value - a.value);
  }, [data]);

  // 3. Calculate Financial Health Score
  const healthScore = useMemo(() => {
    if (!data) return 0;
    const totalIncome = data.incomes.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
    const totalExpense = data.expenses.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
    if (totalIncome === 0) return 0;

    const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
    
    // Simple Scorecard logic
    // Savings rate >= 20% -> 60 pts
    // Remaining EMI debt load < 30% of income -> 20 pts
    // Having active budget configurations -> 20 pts
    let score = 0;
    if (savingsRate >= 30) score += 60;
    else if (savingsRate >= 20) score += 50;
    else if (savingsRate >= 10) score += 30;
    else if (savingsRate > 0) score += 15;

    const totalEmi = data.emis.filter((e: any) => e.status === 'Active').reduce((acc: number, curr: any) => acc + Number(curr.monthly_emi), 0);
    const emiPercentage = (totalEmi / totalIncome) * 100;

    if (emiPercentage < 15) score += 20;
    else if (emiPercentage < 30) score += 15;
    else if (emiPercentage < 45) score += 5;

    if (data.budgets.length >= 3) score += 20;
    else if (data.budgets.length > 0) score += 10;

    return Math.min(100, Math.max(0, score));
  }, [data]);

  // Export handlers
  const handleExportCSV = () => {
    if (!data) return;
    const headers = ['Type', 'Name/Title', 'Category', 'Date', 'Payment Method', 'Amount', 'Notes'];
    const rows: string[][] = [];

    data.incomes.forEach((i: any) => {
      rows.push(['Income', i.title, i.category, i.date, i.payment_method, i.amount.toString(), i.notes || '']);
    });
    data.expenses.forEach((e: any) => {
      rows.push(['Expense', e.name, e.category, e.date, e.payment_method, e.amount.toString(), e.notes || '']);
    });

    actions.exportToCSV(headers, rows, 'pf_cashflow_statement.csv');
  };

  const handleExportExcel = () => {
    if (!data) return;
    const headers = ['Type', 'Name/Title', 'Category', 'Date', 'Payment Method', 'Amount', 'Notes'];
    const rows: string[][] = [];

    data.incomes.forEach((i: any) => {
      rows.push(['Income', i.title, i.category, i.date, i.payment_method, i.amount.toString(), i.notes || '']);
    });
    data.expenses.forEach((e: any) => {
      rows.push(['Expense', e.name, e.category, e.date, e.payment_method, e.amount.toString(), e.notes || '']);
    });

    actions.exportToExcel(headers, rows, 'pf_excel_workbook.xls');
  };

  return {
    loading,
    monthlyTrends,
    categoryBreakdown,
    healthScore,
    currency,
    exportCSV: handleExportCSV,
    exportExcel: handleExportExcel,
    exportPDF: actions.exportToPDF,
    format: (val: number) => actions.formatCurrency(val, currency)
  };
}
