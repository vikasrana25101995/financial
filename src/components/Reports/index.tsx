'use client';

import React, { useState, useEffect } from 'react';
import { useReports } from './CORE/hooks';
import { CATEGORY_COLORS } from './CORE/constants';
import styles from './STYLE/index.module.scss';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { FileDown, Printer, Activity, Heart } from 'lucide-react';

export default function ReportsComponent() {
  const [mounted, setMounted] = useState(false);
  const { loading, monthlyTrends, categoryBreakdown, healthScore, exportCSV, exportExcel, exportPDF, format } = useReports();

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

  let healthStatus = 'Needs Attention';
  let healthDesc = 'Try to increase your savings rate above 10% and lower outstanding loan burdens.';
  let healthColor = 'text-red-500';

  if (healthScore >= 80) {
    healthStatus = 'Excellent financial shape!';
    healthDesc = 'Great savings buffer, controlled loan EMIs, and clear budgets are keeping you highly secure.';
    healthColor = 'text-emerald-500';
  } else if (healthScore >= 50) {
    healthStatus = 'Good financial progress';
    healthDesc = 'You are on the right track! Try configuring minor budget caps to save an extra 10%.';
    healthColor = 'text-amber-500';
  }

  return (
    <div className={styles.reports}>
      {/* Header */}
      <div className={styles.reports__header}>
        <div>
          <h1 className={styles.reports__title}>Reports & Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze spending patterns, monthly comparisons, and compile statements.
          </p>
        </div>

        {/* Download action buttons */}
        <div className={styles.reports__actions}>
          <Button variant="outline" size="sm" onClick={exportCSV} className="flex items-center gap-1.5">
            <FileDown className="h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportExcel} className="flex items-center gap-1.5">
            <FileDown className="h-4 w-4" /> Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF} className="flex items-center gap-1.5">
            <Printer className="h-4 w-4" /> Print / PDF
          </Button>
        </div>
      </div>

      {/* Health Scorecard */}
      <div className={styles.reports__metrics}>
        <div className={styles['reports__score-card']}>
          <div>
            <span className={styles['reports__summary-label']}>Financial Health Score</span>
            <h3 className="text-sm font-semibold mt-1">
              Status: <span className={`${healthColor} font-bold`}>{healthStatus}</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[500px]">{healthDesc}</p>
          </div>
          <div className="flex flex-col items-center">
            <Heart className={`h-6 w-6 mb-1 ${healthColor}`} fill="currentColor" />
            <span className={styles['reports__score-value']}>{healthScore}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">out of 100</span>
          </div>
        </div>
      </div>

      {/* Grid of charts */}
      <div className={styles.reports__grid}>
        {/* Income vs Expense comparison */}
        <div className={styles['reports__chart-card']}>
          <h3 className={styles['reports__chart-title']}>Monthly Trends (Incomes vs Expenses)</h3>
          {mounted ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip formatter={(value) => format(Number(value))} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="savings" name="Savings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center bg-muted/20 rounded-md">Loading charts...</div>
          )}
        </div>

        {/* Expenses by category breakdown pie chart */}
        <div className={styles['reports__chart-card']}>
          <h3 className={styles['reports__chart-title']}>Expense Allocation by Category</h3>
          {mounted ? (
            <div className="h-[280px] w-full relative flex flex-col items-center justify-center">
              {categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => format(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-sm text-muted-foreground text-center">No expenses recorded yet.</div>
              )}
              {/* Legend overlay */}
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] max-h-[80px] overflow-y-auto w-full mt-2 border-t border-border pt-2">
                {categoryBreakdown.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                    <span className="text-muted-foreground font-semibold">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center bg-muted/20 rounded-md">Loading breakdown...</div>
          )}
        </div>
      </div>
    </div>
  );
}
