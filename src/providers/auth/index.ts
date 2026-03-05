import type { AuthProvider } from "./types";
import { config } from "@/config";

let _instance: AuthProvider | null = null;

export async function getAuthProvider(): Promise<AuthProvider> {
  if (_instance) return _instance;

  switch (config.providers.auth) {
    case "firebase": {
      const { FirebaseAuthProvider } = await import("./firebase");
      _instance = new FirebaseAuthProvider();
      break;
    }
    case "supabase": {
      const { SupabaseAuthProvider } = await import("./supabase");
      _instance = new SupabaseAuthProvider();
      break;
    }
    case "custom":
    default: {
      const { CustomAuthProvider } = await import("./custom");
      _instance = new CustomAuthProvider();
      break;
    }
  }

  return _instance;
}

export type { AuthProvider, AuthUser, AuthSession } from "./types";
