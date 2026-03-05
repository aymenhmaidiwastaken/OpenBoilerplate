import type { DatabaseProvider } from "./types";
import { config } from "@/config";

let _instance: DatabaseProvider | null = null;

export async function getDatabaseProvider(): Promise<DatabaseProvider> {
  if (_instance) return _instance;

  switch (config.providers.database) {
    case "firestore": {
      const { FirestoreDatabaseProvider } = await import("./firestore");
      _instance = new FirestoreDatabaseProvider();
      break;
    }
    case "supabase": {
      const { SupabaseDatabaseProvider } = await import("./supabase");
      _instance = new SupabaseDatabaseProvider();
      break;
    }
    case "drizzle":
    default: {
      const { DrizzleDatabaseProvider } = await import("./drizzle/provider");
      _instance = new DrizzleDatabaseProvider();
      break;
    }
  }

  return _instance;
}

export type { DatabaseProvider, UserRecord, UsageRecord, BlogPost } from "./types";
