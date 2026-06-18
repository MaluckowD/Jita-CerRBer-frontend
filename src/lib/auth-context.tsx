import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usersApi } from "./api";
import type { UserApiResponse, Token } from "./types";

interface AuthContextValue {
  user: UserApiResponse | null;
  loading: boolean;
  login: (token: Token) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { setLoading(false); return; }
    try {
      const me = await usersApi.getMe();
      setUser(me);
    } catch {
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    const onLogout = () => { setUser(null); setLoading(false); };
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  const login = async (token: Token) => {
    localStorage.setItem("access_token", token.access_token);
    if (token.refresh_token) localStorage.setItem("refresh_token", token.refresh_token);
    await refreshUser();
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
