import { atom, computed } from "nanostores";
import type { AuthUser } from "@/providers/auth/types";

export const $user = atom<AuthUser | null>(null);
export const $isAuthenticated = computed($user, (user) => user !== null);
export const $isAdmin = computed($user, (user) => user?.role === "admin");

export function setUser(user: AuthUser | null) {
  $user.set(user);
}

export function clearUser() {
  $user.set(null);
}
