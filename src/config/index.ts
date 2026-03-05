import { configSchema, type OpenBoilConfig } from "./schema";
import userConfig from "../../openboil.config";

let _config: OpenBoilConfig | null = null;

export function getConfig(): OpenBoilConfig {
  if (_config) return _config;
  const result = configSchema.safeParse(userConfig);
  if (!result.success) {
    console.error("Invalid openboil.config.ts:", result.error.format());
    throw new Error("Invalid OpenBoil configuration. Check console for details.");
  }
  _config = result.data;
  return _config;
}

export const config = getConfig();
