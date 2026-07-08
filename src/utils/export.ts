import { getAllExpenses, getAllChecks, getAllWorkers, getWorkerPayments, getTotalPaidForWorker } from '../db/storage';
import { formatDate } from './date';

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  // BOM ensures Excel opens Arabic/Hebrew text correctly
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportExpenses(): Promise<void> {
  const rows: (string | number)[][] = [
    ['Date', 'Amount (₪)', 'Description', 'Category', 'Paid To', 'Note'],
    ...(await getAllExpenses()).map(e => [formatDate(e.date), e.amount, e.description, e.category, e.payee, e.note]),
  ];
  downloadCsv('expenses.csv', rows);
}

export async function exportChecks(): Promise<void> {
  const rows: (string | number)[][] = [
    ['Withdrawal Date', 'Amount (₪)', 'Payee', 'Check Number', 'Note'],
    ...(await getAllChecks()).map(c => [formatDate(c.withdrawal_date), c.amount, c.payee, c.check_number, c.note]),
  ];
  downloadCsv('checks.csv', rows);
}

export async function exportWorkers(): Promise<void> {
  const rows: (string | number)[][] = [
    ['Worker Name', 'Trade', 'Total Fee (₪)', 'Total Paid (₪)', 'Remaining (₪)', 'Payment Date', 'Payment Amount (₪)', 'Payment Note'],
  ];
  for (const w of await getAllWorkers()) {
    const payments = await getWorkerPayments(w.id);
    const totalPaid = await getTotalPaidForWorker(w.id);
    const remaining = Math.max(0, w.totalFee - totalPaid);
    if (payments.length === 0) {
      rows.push([w.name, w.trade, w.totalFee, totalPaid, remaining, '', '', '']);
    } else {
      payments.forEach((p, i) => {
        rows.push([
          i === 0 ? w.name : '',
          i === 0 ? w.trade : '',
          i === 0 ? w.totalFee : '',
          i === 0 ? totalPaid : '',
          i === 0 ? remaining : '',
          formatDate(p.date), p.amount, p.note,
        ]);
      });
    }
  }
  downloadCsv('workers.csv', rows);
}
