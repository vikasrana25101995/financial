import { toast } from 'sonner';

export class ReportsActions {
  exportToCSV(headers: string[], rows: string[][], filename: string = 'financial_report.csv') {
    try {
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported CSV successfully as ${filename}`);
    } catch (e) {
      toast.error('Failed to export CSV report');
    }
  }

  exportToExcel(headers: string[], rows: string[][], filename: string = 'financial_report.xls') {
    try {
      // Simulate XML Excel format or direct CSV for simplicity
      const tabContent = [
        headers.join('\t'),
        ...rows.map(row => row.join('\t'))
      ].join('\r\n');

      const blob = new Blob([tabContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported Excel file as ${filename}`);
    } catch (e) {
      toast.error('Failed to export Excel report');
    }
  }

  exportToPDF() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  }
}
