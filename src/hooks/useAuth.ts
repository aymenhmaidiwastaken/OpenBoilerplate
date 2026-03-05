import { useStore } from "@nanostores/react";
import { $user, $isAuthenticated, $isAdmin, setUser, clearUser } from "@/stores/auth";
import type { AuthUser } from "@/providers/auth/types";

export function useAuth() {
  const user = useStore($user);
  const isAuthenticated = useStore($isAuthenticated);
  const isAdmin = useStore($isAdmin);

  async function login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Login failed");
    }
    const data = await res.json();
    setUser(data.user);
    return data;
  }

  async function register(email: string, password: string, name?: string) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Registration failed");
    }
    const data = await res.json();
    setUser(data.user);
    return data;
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearUser();
    window.location.href = "/";
  }

  async function fetchUser(): Promise<AuthUser | null> {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      const data = await res.json();
      setUser(data.user);
      return data.user;
    } catch {
      return null;
    }
  }

  return { user, isAuthenticated, isAdmin, login, register, logout, fetchUser };
}
