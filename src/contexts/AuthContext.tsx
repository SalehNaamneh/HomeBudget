import React, { createContext, useContext, useState } from 'react';
import { Session, registerUser as doRegister, loginUser as doLogin, getSession, clearSession } from '../auth/auth';
import { initStorage } from '../db/storage';

interface AuthContextType {
  user: Session | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Session | null>(() => {
    const session = getSession();
    if (session) initStorage(session.userId);
    return session;
  });

  const login = async (email: string, password: string) => {
    const result = await doLogin(email, password);
    if (result.ok && result.session) {
      initStorage(result.session.userId);
      setUser(result.session);
    }
    return { ok: result.ok, error: result.error };
  };

  const register = async (name: string, email: string, password: string) => {
    const regResult = await doRegister(name, email, password);
    if (!regResult.ok) return regResult;
    return login(email, password);
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
