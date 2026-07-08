export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function parseInputDate(ddmmyyyy: string): string {
  const [d, m, y] = ddmmyyyy.split('/');
  return `${y}-${m}-${d}`;
}

export function todayDisplay(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  return `${d}/${m}/${y}`;
}

export function isValidDisplayDate(s: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return false;
  const iso = parseInputDate(s);
  const d = new Date(iso);
  return !isNaN(d.getTime());
}

export function daysUntil(isoDate: string): number {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(isoDate); target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
