/// <reference path="../.astro/types.d.ts" />

import type { AuthUser } from "./providers/auth/types";

declare namespace App {
  interface Locals {
    user: AuthUser | null;
  }
}

interface Window {
  __INITIAL_STATE__?: {
    user: AuthUser | null;
    theme: "light" | "dark" | "system";
  };
}
