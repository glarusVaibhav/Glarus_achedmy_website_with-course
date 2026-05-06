"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
}

interface AuthContextValue {
  /** The currently authenticated user, or null if logged out. */
  user: AuthUser | null;
  /** True only during the initial auth verification on first load. */
  isLoading: boolean;
  /** Call after a successful /api/auth/login — hydrates context + localStorage. */
  login: (user: AuthUser, redirectUrl?: string) => void;
  /** Destroys the session cookie & clears all local state. */
  logout: () => Promise<void>;
  /**
   * Wraps any action callback with an auth gate.
   * If the user is logged in the action runs immediately.
   * If NOT logged in the user is redirected to /signup.
   */
  requireAuth: (action: () => void) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */

const LS_KEY = "glarus_auth_user";

/* ═══════════════════════════════════════════════
   PROVIDER
   ═══════════════════════════════════════════════ */

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  // ── Bootstrap from localStorage so the first paint is flicker-free ──
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const cached = localStorage.getItem(LS_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // ── Verify with the server on mount ──
  useEffect(() => {
    let cancelled = false;

    async function verify() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.user) {
            setUser(data.user);
            localStorage.setItem(LS_KEY, JSON.stringify(data.user));
          }
        } else {
          // Cookie expired or invalid — clear everything
          if (!cancelled) {
            setUser(null);
            localStorage.removeItem(LS_KEY);
          }
        }
      } catch {
        // Network error — keep the cached state but don't crash
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Login (called by the login page after API success) ──
  const login = useCallback(
    (userData: AuthUser, redirectUrl?: string) => {
      setUser(userData);
      localStorage.setItem(LS_KEY, JSON.stringify(userData));
      if (redirectUrl) {
        router.push(redirectUrl);
      }
      router.refresh();
    },
    [router],
  );

  // ── Logout ──
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* best-effort */
    }
    setUser(null);
    localStorage.removeItem(LS_KEY);
    router.push("/login");
    router.refresh();
  }, [router]);

  // ── Auth-gate interceptor ──
  const requireAuth = useCallback(
    (action: () => void) => {
      if (user) {
        action();
      } else {
        router.push("/signup");
      }
    },
    [user, router],
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, requireAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ═══════════════════════════════════════════════
   HOOK
   ═══════════════════════════════════════════════ */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
