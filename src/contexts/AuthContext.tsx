"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

export interface LastSession {
  country: string;
  timestamp: string;
}

interface AuthContextValue {
  user: User | null;
  lastSession: LastSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: (currentCountry?: string) => Promise<void>;
  clearLastSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [lastSession, setLastSession] = useState<LastSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const signOut = useCallback(() => {
    setUser(null);
    setLastSession(null);
    router.push("/login");
  }, [router]);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user.lastSession) setLastSession(data.user.lastSession as LastSession);
      }
    } catch {
      // not logged in or network error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // When fetchWithAuth exhausts the refresh token it fires this event
  useEffect(() => {
    window.addEventListener("auth:signout", signOut);
    return () => window.removeEventListener("auth:signout", signOut);
  }, [signOut]);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    setUser(data.user);
    if (data.lastSession) setLastSession(data.lastSession as LastSession);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role = "user"
  ) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    setUser(data.user);
  };

  const logout = async (currentCountry?: string) => {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentCountry }),
    });
    setUser(null);
    setLastSession(null);
  };

  const clearLastSession = () => setLastSession(null);

  return (
    <AuthContext.Provider
      value={{ user, lastSession, loading, login, register, logout, clearLastSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
