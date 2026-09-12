"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Role = "COMPANY" | "WORKER" | "ADMIN";

export interface AuthTokenPayload {
  subject: string;
  role: Role;
}

interface AuthState {
  token: string | null;
  payload: AuthTokenPayload | null;
}

interface AuthContextValue extends AuthState {
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const STORAGE_KEY = "eteronhub.auth.token";

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeTokenPayload(token: string): AuthTokenPayload | null {
  try {
    const [, payloadBase64] = token.split(".");
    const json = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    const decoded = JSON.parse(json) as Partial<AuthTokenPayload>;
    if (!decoded.subject || !decoded.role) return null;
    return { subject: decoded.subject, role: decoded.role };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, setState] = useState<AuthState>({ token: null, payload: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const payload = decodeTokenPayload(stored);
      if (payload) {
        setState({ token: stored, payload });
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((token: string) => {
    const payload = decodeTokenPayload(token);
    window.localStorage.setItem(STORAGE_KEY, token);
    setState({ token, payload });
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState({ token: null, payload: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout, isLoading }),
    [state, login, logout, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
