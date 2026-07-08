import { supabase } from '../lib/supabase';

export interface Session {
  userId: string;
  name: string;
  email: string;
}

export async function registerUser(name: string, email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function loginUser(email: string, password: string): Promise<{ ok: boolean; session?: Session; error?: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  if (!data.session) return { ok: false, error: 'Login failed.' };
  const session: Session = {
    userId: data.session.user.id,
    name: data.session.user.user_metadata?.name ?? '',
    email: data.session.user.email ?? '',
  };
  return { ok: true, session };
}
