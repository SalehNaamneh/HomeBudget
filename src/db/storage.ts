import { supabase } from '../lib/supabase';
import { Expense, Check, Worker, WorkerPayment } from '../types';

// Language preference stays in localStorage — it's a per-device UI setting
export function getSetting(key: string, defaultValue: string): string {
  return localStorage.getItem(`hb_pref_${key}`) ?? defaultValue;
}

export function setSetting(key: string, value: string): void {
  localStorage.setItem(`hb_pref_${key}`, value);
}

function mapExpense(row: any): Expense {
  return { ...row, amount: Number(row.amount) };
}

function mapCheck(row: any): Check {
  return { ...row, amount: Number(row.amount) };
}

function mapWorker(row: any): Worker {
  return { id: row.id, name: row.name, trade: row.trade, totalFee: Number(row.total_fee), note: row.note, created_at: row.created_at };
}

function mapPayment(row: any): WorkerPayment {
  return { ...row, amount: Number(row.amount) };
}

// ─── Expenses ───────────────────────────────────────────────────────────────

export async function addExpense(amount: number, description: string, category: string, date: string, payee: string, note: string): Promise<number> {
  const { data, error } = await supabase.from('expenses').insert({ amount, description, category, date, payee, note }).select('id').single();
  if (error) throw error;
  return data.id;
}

export async function updateExpense(id: number, amount: number, description: string, category: string, date: string, payee: string, note: string): Promise<void> {
  const { error } = await supabase.from('expenses').update({ amount, description, category, date, payee, note }).eq('id', id);
  if (error) throw error;
}

export async function deleteExpense(id: number): Promise<void> {
  await supabase.from('expenses').delete().eq('id', id);
}

export async function getAllExpenses(): Promise<Expense[]> {
  const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false }).order('id', { ascending: false });
  return (data ?? []).map(mapExpense);
}

export async function getExpenseSummaryByCategory(): Promise<{ category: string; total: number }[]> {
  const { data } = await supabase.from('expenses').select('category, amount');
  const map: Record<string, number> = {};
  for (const e of data ?? []) map[e.category] = (map[e.category] ?? 0) + Number(e.amount);
  return Object.entries(map).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
}

export async function getTotalExpenses(): Promise<number> {
  const { data } = await supabase.from('expenses').select('amount');
  return (data ?? []).reduce((s: number, e: any) => s + Number(e.amount), 0);
}

export async function getPayeeSuggestions(query: string): Promise<string[]> {
  if (!query) return [];
  const q = `%${query}%`;
  const [expRes, chkRes] = await Promise.all([
    supabase.from('expenses').select('payee').ilike('payee', q).limit(20),
    supabase.from('checks').select('payee').ilike('payee', q).limit(20),
  ]);
  const payees = [
    ...(expRes.data ?? []).map((e: any) => e.payee),
    ...(chkRes.data ?? []).map((c: any) => c.payee),
  ].filter(Boolean);
  return [...new Set(payees)].slice(0, 8);
}

// ─── Checks ─────────────────────────────────────────────────────────────────

export async function addCheck(amount: number, payee: string, note: string, withdrawal_date: string, check_number: string = ''): Promise<number> {
  const { data, error } = await supabase.from('checks').insert({ amount, payee, note, withdrawal_date, check_number }).select('id').single();
  if (error) throw error;
  return data.id;
}

export async function updateCheck(id: number, amount: number, payee: string, note: string, withdrawal_date: string, check_number: string): Promise<void> {
  const { error } = await supabase.from('checks').update({ amount, payee, note, withdrawal_date, check_number }).eq('id', id);
  if (error) throw error;
}

export async function deleteCheck(id: number): Promise<void> {
  await supabase.from('checks').delete().eq('id', id);
}

export async function getAllChecks(): Promise<Check[]> {
  const { data } = await supabase.from('checks').select('*').order('withdrawal_date', { ascending: true });
  return (data ?? []).map(mapCheck);
}

export async function getTotalChecks(): Promise<number> {
  const { data } = await supabase.from('checks').select('amount');
  return (data ?? []).reduce((s: number, c: any) => s + Number(c.amount), 0);
}

// ─── Workers ────────────────────────────────────────────────────────────────

export async function addWorker(name: string, trade: string, totalFee: number, note: string): Promise<number> {
  const { data, error } = await supabase.from('workers').insert({ name, trade, total_fee: totalFee, note }).select('id').single();
  if (error) throw error;
  return data.id;
}

export async function updateWorker(id: number, name: string, trade: string, totalFee: number, note: string): Promise<void> {
  const { error } = await supabase.from('workers').update({ name, trade, total_fee: totalFee, note }).eq('id', id);
  if (error) throw error;
}

export async function deleteWorker(id: number): Promise<void> {
  const { data: payments } = await supabase.from('worker_payments').select('expense_id').eq('worker_id', id);
  await supabase.from('workers').delete().eq('id', id);
  const expenseIds = (payments ?? []).map((p: any) => p.expense_id).filter(Boolean);
  if (expenseIds.length > 0) await supabase.from('expenses').delete().in('id', expenseIds);
}

export async function getAllWorkers(): Promise<Worker[]> {
  const { data } = await supabase.from('workers').select('*').order('name', { ascending: true });
  return (data ?? []).map(mapWorker);
}

export async function getWorker(id: number): Promise<Worker | undefined> {
  const { data } = await supabase.from('workers').select('*').eq('id', id).single();
  return data ? mapWorker(data) : undefined;
}

// ─── Worker Payments ─────────────────────────────────────────────────────────

export async function addWorkerPayment(worker_id: number, amount: number, date: string, note: string, expense_id?: number): Promise<number> {
  const { data, error } = await supabase.from('worker_payments').insert({ worker_id, amount, date, note, expense_id }).select('id').single();
  if (error) throw error;
  return data.id;
}

export async function deleteWorkerPayment(id: number): Promise<void> {
  const { data: payment } = await supabase.from('worker_payments').select('expense_id').eq('id', id).single();
  if (payment?.expense_id) await deleteExpense(payment.expense_id);
  await supabase.from('worker_payments').delete().eq('id', id);
}

export async function getWorkerPayments(worker_id: number): Promise<WorkerPayment[]> {
  const { data } = await supabase.from('worker_payments').select('*').eq('worker_id', worker_id).order('date', { ascending: false });
  return (data ?? []).map(mapPayment);
}

export async function getTotalPaidForWorker(worker_id: number): Promise<number> {
  const { data } = await supabase.from('worker_payments').select('amount').eq('worker_id', worker_id);
  return (data ?? []).reduce((s: number, p: any) => s + Number(p.amount), 0);
}
