export interface DashboardMetrics {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  remainingBalance: number;
  totalEmi: number;
  totalSubscriptions: number;
  netWorth: number;
  dailySpend: number;
}

export interface ChartDataPoint {
  name: string; // Month name or Day
  income: number;
  expense: number;
  savings: number;
}

export interface SpendCategoryPoint {
  name: string;
  value: number;
  color: string;
}
