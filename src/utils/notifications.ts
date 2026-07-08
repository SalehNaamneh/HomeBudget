import { getAllChecks } from '../db/storage';
import { daysUntil } from './date';

export function getUrgentChecks() {
  return getAllChecks().filter(c => {
    const days = daysUntil(c.withdrawal_date);
    return days >= 0 && days <= 2;
  });
}

export async function notifyOnOpen(): Promise<void> {
  // Only fire once per browser session so it doesn't spam on every navigation
  if (sessionStorage.getItem('hb_notified')) return;
  sessionStorage.setItem('hb_notified', '1');

  const urgent = getUrgentChecks();
  if (urgent.length === 0) return;

  if (!('Notification' in window)) return;

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') return;

  if (urgent.length === 1) {
    const c = urgent[0];
    const days = daysUntil(c.withdrawal_date);
    new Notification('House Budget — Check Due', {
      body: `${c.payee}  ₪${c.amount.toLocaleString()} — ${days === 0 ? 'TODAY!' : `in ${days} day${days > 1 ? 's' : ''}`}`,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏠</text></svg>',
    });
  } else {
    new Notification(`House Budget — ${urgent.length} Checks Due Soon`, {
      body: urgent.map(c => {
        const days = daysUntil(c.withdrawal_date);
        return `${c.payee}: ₪${c.amount.toLocaleString()} (${days === 0 ? 'today' : `${days}d`})`;
      }).join('\n'),
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏠</text></svg>',
    });
  }
}
