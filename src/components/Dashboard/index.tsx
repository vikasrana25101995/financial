'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from './CORE/hooks';
import styles from './STYLE/index.module.scss';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Calendar,
  DollarSign,
  PlusCircle,
  Play
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function DashboardComponent() {
  const [mounted, setMounted] = useState(false);
  const { loading, metrics, chartData, categoryData, currency, recentTransactions, actions } = useDashboard();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const format = (val: number) => actions.formatCurrency(val, currency);

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.dashboard__header}>
        <h1 className={styles.dashboard__title}>Financial Dashboard</h1>
        <p className={styles.dashboard__subtitle}>
          Welcome back! Here is a summary of your financial status.
        </p>
      </div>

      {/* Grid Cards */}
      <div className={styles.dashboard__grid}>
        <div className={`${styles.dashboard__card} ${styles['dashboard__card--highlight']}`}>
          <span className={styles['dashboard__card-title']}>Net Worth</span>
          <span className={styles['dashboard__card-value']}>{format(metrics.netWorth)}</span>
          <span className="text-xs text-emerald-500 flex items-center gap-1 font-medium mt-1">
            <TrendingUp className="h-3 w-3" /> +4.2% from last month
          </span>
        </div>

        <div className={styles.dashboard__card}>
          <span className={styles['dashboard__card-title']}>Remaining Balance</span>
          <span className={styles['dashboard__card-value']}>{format(metrics.remainingBalance)}</span>
          <span className={styles['dashboard__card-subtext']}>Income minus Expenses</span>
        </div>

        <div className={styles.dashboard__card}>
          <span className={styles['dashboard__card-title']}>Monthly Income</span>
          <span className={styles['dashboard__card-value']}>{format(metrics.totalIncome)}</span>
          <span className="text-xs text-emerald-500 flex items-center gap-1 font-medium mt-1">
            Active & Passive Income
          </span>
        </div>

        <div className={styles.dashboard__card}>
          <span className={styles['dashboard__card-title']}>Monthly Expenses</span>
          <span className={styles['dashboard__card-value']}>{format(metrics.totalExpenses)}</span>
          <span className="text-xs text-red-500 flex items-center gap-1 font-medium mt-1">
            <TrendingDown className="h-3 w-3" /> 2.1% less than budget
          </span>
        </div>
      </div>

      {/* Charts section */}
      <div className={styles.dashboard__charts}>
        {/* Cash Flow Graph */}
        <div className={styles['dashboard__chart-container']}>
          <h3 className={styles['dashboard__chart-title']}>Cash Flow (Last 6 Months)</h3>
          {mounted ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip formatter={(value) => format(Number(value))} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center bg-muted/20 rounded-md">Loading chart...</div>
          )}
        </div>

        {/* Category Breakdown Graph */}
        <div className={styles['dashboard__chart-container']}>
          <h3 className={styles['dashboard__chart-title']}>Spending Breakdown</h3>
          {mounted ? (
            <div className="h-[280px] w-full relative flex flex-col items-center justify-center">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => format(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-sm text-muted-foreground text-center">No expenses recorded yet.</div>
              )}
              {/* Legend overlay for categoryColors */}
              <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs max-h-[80px] overflow-y-auto">
                {categoryData.slice(0, 4).map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-muted-foreground font-medium">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center bg-muted/20 rounded-md">Loading chart...</div>
          )}
        </div>
      </div>

      {/* Bottom section: Recent Transactions & Quick stats */}
      <div className={styles['dashboard__bottom-grid']}>
        {/* Recent Transactions list */}
        <div className={styles.dashboard__recent}>
          <h3 className="text-lg font-semibold border-b border-border pb-2 mb-3">Recent Transactions</h3>
          <div className={styles.dashboard__list}>
            {recentTransactions.map((tx) => (
              <div key={tx.id} className={styles['dashboard__list-item']}>
                <div>
                  <div className={styles['dashboard__item-name']}>{tx.title || tx.name}</div>
                  <div className={styles['dashboard__item-date']}>{tx.date} • {tx.category}</div>
                </div>
                <div
                  className={`${styles['dashboard__item-amount']} ${
                    tx.type === 'income'
                      ? styles['dashboard__item-amount--income']
                      : styles['dashboard__item-amount--expense']
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}{format(tx.amount)}
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-4">No recent transactions.</div>
            )}
          </div>
        </div>

        {/* Quick Insights Card */}
        <div className={styles.dashboard__recent}>
          <h3 className="text-lg font-semibold border-b border-border pb-2 mb-3">Financial Commitments</h3>
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-md text-amber-500">
                  <Percent className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Monthly Loan EMIs</div>
                  <div className="text-xs text-muted-foreground">Active repayments</div>
                </div>
              </div>
              <div className="font-bold text-sm">{format(metrics.totalEmi)}</div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/10 rounded-md text-violet-500">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Active Subscriptions</div>
                  <div className="text-xs text-muted-foreground">Recurring software/media</div>
                </div>
              </div>
              <div className="font-bold text-sm">{format(metrics.totalSubscriptions)}</div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-md text-emerald-500">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Daily Spend (Today)</div>
                  <div className="text-xs text-muted-foreground">Logged today</div>
                </div>
              </div>
              <div className="font-bold text-sm">{format(metrics.dailySpend)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
