export interface Session {
  userId: string;
  name: string;
  email: string;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

const USERS_KEY = 'hb_users';
const SESSION_KEY = 'hb_session';

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]'); } catch { return []; }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function registerUser(name: string, email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const emailLow = email.toLowerCase().trim();
  const users = getUsers();
  if (users.some(u => u.email === emailLow)) return { ok: false, error: 'Email already registered.' };
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  saveUsers([...users, { id, name: name.trim(), email: emailLow, passwordHash }]);
  return { ok: true };
}

export async function loginUser(email: string, password: string): Promise<{ ok: boolean; session?: Session; error?: string }> {
  const emailLow = email.toLowerCase().trim();
  const user = getUsers().find(u => u.email === emailLow);
  if (!user) return { ok: false, error: 'No account found with this email.' };
  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) return { ok: false, error: 'Incorrect password.' };
  const session: Session = { userId: user.id, name: user.name, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true, session };
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
