export type ExpenseCategory =
  | 'Materials'
  | 'Construction Worker'
  | 'Paint Worker'
  | 'Plumber'
  | 'Electrician'
  | 'Iron Worker'
  | 'Tiling'
  | 'Other';

export const CATEGORIES: ExpenseCategory[] = [
  'Materials',
  'Construction Worker',
  'Paint Worker',
  'Plumber',
  'Electrician',
  'Iron Worker',
  'Tiling',
  'Other',
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Materials: '#4A90E2',
  'Construction Worker': '#E67E22',
  'Paint Worker': '#2ECC71',
  Plumber: '#9B59B6',
  Electrician: '#F1C40F',
  'Iron Worker': '#E74C3C',
  Tiling: '#1ABC9C',
  Other: '#95A5A6',
};

export interface Expense {
  id: number;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string;
  payee: string;
  note: string;
}

export interface Check {
  id: number;
  amount: number;
  payee: string;
  note: string;
  withdrawal_date: string;
  notification_id: string;
  created_at: string;
  check_number: string;
}

export interface Worker {
  id: number;
  name: string;
  trade: string;
  totalFee: number;
  note: string;
  created_at: string;
}

export interface WorkerPayment {
  id: number;
  worker_id: number;
  amount: number;
  date: string;
  note: string;
  expense_id?: number;
}
