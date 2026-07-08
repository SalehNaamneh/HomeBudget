import { Expense, Check, Worker, WorkerPayment } from '../types';

let _uid = 'default';
export function initStorage(userId: string) { _uid = userId; }

function k(key: string) { return `hb_${_uid}_${key}`; }

function load<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(k(key)) ?? '[]'); } catch { return []; }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(k(key), JSON.stringify(data));
}

function nextId<T extends { id: number }>(items: T[]): number {
  return items.length === 0 ? 1 : Math.max(...items.map(i => i.id)) + 1;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export function getSetting(key: string, defaultValue: string): string {
  return localStorage.getItem(k(`s_${key}`)) ?? defaultValue;
}

export function setSetting(key: string, value: string) {
  localStorage.setItem(k(`s_${key}`), value);
}

// ─── Expenses ───────────────────────────────────────────────────────────────

export function addExpense(amount: number, description: string, category: string, date: string, payee: string, note: string): number {
  const items = load<Expense>('expenses');
  const id = nextId(items);
  items.unshift({ id, amount, description, category: category as Expense['category'], date, payee, note });
  save('expenses', items);
  return id;
}

export function updateExpense(id: number, amount: number, description: string, category: string, date: string, payee: string, note: string) {
  const items = load<Expense>('expenses');
  const idx = items.findIndex(e => e.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], amount, description, category: category as Expense['category'], date, payee, note };
    save('expenses', items);
  }
}

export function deleteExpense(id: number) {
  save('expenses', load<Expense>('expenses').filter(e => e.id !== id));
}

export function getAllExpenses(): Expense[] {
  return load<Expense>('expenses').sort((a, b) => b.date.localeCompare(a.date));
}

export function getExpenseSummaryByCategory(): { category: string; total: number }[] {
  const map: Record<string, number> = {};
  for (const e of load<Expense>('expenses')) {
    map[e.category] = (map[e.category] ?? 0) + e.amount;
  }
  return Object.entries(map).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
}

export function getTotalExpenses(): number {
  return load<Expense>('expenses').reduce((s, e) => s + e.amount, 0);
}

export function getPayeeSuggestions(query: string): string[] {
  const q = query.toLowerCase();
  const from_e = load<Expense>('expenses').map(e => e.payee).filter(p => p && p.toLowerCase().includes(q));
  const from_c = load<Check>('checks').map(c => c.payee).filter(p => p && p.toLowerCase().includes(q));
  return [...new Set([...from_e, ...from_c])].slice(0, 8);
}

// ─── Checks ─────────────────────────────────────────────────────────────────

export function addCheck(amount: number, payee: string, note: string, withdrawal_date: string, check_number: string = ''): number {
  const items = load<Check>('checks');
  const id = nextId(items);
  items.push({ id, amount, payee, note, withdrawal_date, notification_id: '', created_at: new Date().toISOString(), check_number });
  save('checks', items);
  return id;
}

export function updateCheck(id: number, amount: number, payee: string, note: string, withdrawal_date: string, check_number: string) {
  const items = load<Check>('checks');
  const idx = items.findIndex(c => c.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], amount, payee, note, withdrawal_date, check_number };
    save('checks', items);
  }
}

export function deleteCheck(id: number) {
  save('checks', load<Check>('checks').filter(c => c.id !== id));
}

export function getAllChecks(): Check[] {
  return load<Check>('checks').sort((a, b) => a.withdrawal_date.localeCompare(b.withdrawal_date));
}

export function getTotalChecks(): number {
  return load<Check>('checks').reduce((s, c) => s + c.amount, 0);
}

// ─── Workers ────────────────────────────────────────────────────────────────

export function addWorker(name: string, trade: string, totalFee: number, note: string): number {
  const items = load<Worker>('workers');
  const id = nextId(items);
  items.push({ id, name, trade, totalFee, note, created_at: new Date().toISOString() });
  save('workers', items);
  return id;
}

export function updateWorker(id: number, name: string, trade: string, totalFee: number, note: string) {
  const items = load<Worker>('workers');
  const idx = items.findIndex(w => w.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], name, trade, totalFee, note };
    save('workers', items);
  }
}

export function deleteWorker(id: number) {
  save('workers', load<Worker>('workers').filter(w => w.id !== id));
  save('worker_payments', load<WorkerPayment>('worker_payments').filter(p => p.worker_id !== id));
}

export function getAllWorkers(): Worker[] {
  return load<Worker>('workers').sort((a, b) => a.name.localeCompare(b.name));
}

export function getWorker(id: number): Worker | undefined {
  return load<Worker>('workers').find(w => w.id === id);
}

// ─── Worker Payments ─────────────────────────────────────────────────────────

export function addWorkerPayment(worker_id: number, amount: number, date: string, note: string, expense_id?: number): number {
  const items = load<WorkerPayment>('worker_payments');
  const id = nextId(items);
  items.push({ id, worker_id, amount, date, note, expense_id });
  save('worker_payments', items);
  return id;
}

export function deleteWorkerPayment(id: number) {
  const payment = load<WorkerPayment>('worker_payments').find(p => p.id === id);
  if (payment?.expense_id != null) {
    deleteExpense(payment.expense_id);
  }
  save('worker_payments', load<WorkerPayment>('worker_payments').filter(p => p.id !== id));
}

export function getWorkerPayments(worker_id: number): WorkerPayment[] {
  return load<WorkerPayment>('worker_payments')
    .filter(p => p.worker_id === worker_id)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getTotalPaidForWorker(worker_id: number): number {
  return load<WorkerPayment>('worker_payments')
    .filter(p => p.worker_id === worker_id)
    .reduce((s, p) => s + p.amount, 0);
}
