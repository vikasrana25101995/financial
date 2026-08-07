'use client';

import React, { useState, useEffect } from 'react';
import { useInvestments } from './CORE/hooks';
import styles from './STYLE/index.module.scss';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Briefcase } from 'lucide-react';

export default function InvestmentsComponent() {
  const [mounted, setMounted] = useState(false);
  const { investments, loading, stats, distribution, format } = useInvestments();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isGain = stats.netGain >= 0;

  return (
    <div className={styles.investments}>
      {/* Header */}
      <div className={styles.investments__header}>
        <div>
          <h1 className={styles.investments__title}>Investment Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and aggregate stock options, mutual funds, cryptocurrency, gold, and retirements.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 rounded-xl text-xs text-blue-600 dark:text-blue-400 font-medium">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          <span>Investments are managed automatically via <a href="/expenses" className="underline font-bold hover:text-blue-700 dark:hover:text-blue-300">Spends & Expenses</a></span>
        </div>
      </div>

      {/* Aggregated stats */}
      <div className={styles.investments__grid}>
        <div className={styles['investme``nts__summary-card']}>
          <span className={styles['investments__summary-label']}>Total Invested</span>
          <span className={styles['investments__summary-value']}>{format(stats.totalInvested)}</span>
        </div>
        <div className={styles['investments__summary-card']}>
          <span className={styles['investments__summary-label']}>Current Portfolio Value</span>
          <span className={styles['investments__summary-value']}>{format(stats.totalCurrent)}</span>
        </div>
        <div className={styles['investments__summary-card']}>
          <span className={styles['investments__summary-label']}>Total Returns (P&L)</span>
          <span
            className={`${styles['investments__summary-value']} flex items-center gap-1 ${
              isGain ? 'text-emerald-500' : 'text-red-500'
            }`}
          >
            {isGain ? '+' : ''}{format(stats.netGain)}
            {isGain ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
          </span>
        </div>
        <div className={styles['investments__summary-card']}>
          <span className={styles['investments__summary-label']}>Portfolio ROI</span>
          <span
            className={`${styles['investments__summary-value']} ${
              isGain ? 'text-emerald-500' : 'text-red-500'
            }`}
          >
            {isGain ? '+' : ''}{stats.roi.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Main Layout panels */}
      <div className={styles.investments__layout}>
        {/* Table representation */}
        <div className={styles.investments__card}>
          <h3 className="text-lg font-semibold border-b border-border pb-2 mb-3">Asset Ledger</h3>
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : investments.length > 0 ? (
            <div className={styles['investments__table-wrapper']}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Invested</TableHead>
                    <TableHead className="text-right">Current Value</TableHead>
                    <TableHead className="text-right">Gain / Loss</TableHead>
                    <TableHead className="text-right">ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments.map((inv) => {
                    const gain = inv.current_value - inv.invested_amount;
                    const roi = inv.invested_amount > 0 ? (gain / inv.invested_amount) * 100 : 0;
                    const isAssetGain = gain >= 0;

                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-semibold">{inv.name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                            {inv.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{format(inv.invested_amount)}</TableCell>
                        <TableCell className="text-right font-semibold">{format(inv.current_value)}</TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            isAssetGain ? 'text-emerald-500' : 'text-red-500'
                          }`}
                        >
                          {isAssetGain ? '+' : ''}{format(gain)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-bold ${
                            isAssetGain ? 'text-emerald-500' : 'text-red-500'
                          }`}
                        >
                          {isAssetGain ? '+' : ''}{roi.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto stroke-1 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold">Empty Investment Ledger</h3>
              <p className="text-sm mt-1">Add equities, index trackers or crypto portfolios to visualize holdings.</p>
            </div>
          )}
        </div>

        {/* Portfolio Distribution chart */}
        <div className={styles.investments__card}>
          <h3 className="text-lg font-semibold border-b border-border pb-2 mb-3">Portfolio Allocation</h3>
          {mounted ? (
            <div className="h-[260px] w-full flex flex-col items-center justify-center relative">
              {distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => format(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-muted-foreground py-8">No investment items.</div>
              )}
              {/* Legends list */}
              <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-[11px] max-h-[85px] overflow-y-auto w-full mt-2 border-t border-border pt-2">
                {distribution.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-muted-foreground font-semibold">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[260px] flex items-center justify-center bg-muted/20 rounded-md">Loading distribution...</div>
          )}
        </div>
      </div>
    </div>
  );
}
