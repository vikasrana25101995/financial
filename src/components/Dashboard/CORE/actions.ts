export class DashboardActions {
  formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  calculatePercentage(part: number, total: number): number {
    if (total === 0) return 0;
    return Math.min(100, Math.max(0, (part / total) * 100));
  }
}
