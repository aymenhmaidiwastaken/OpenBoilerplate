export const prerender = false;

import type { APIRoute } from "astro";
import { getAuthProvider } from "@/providers/auth";

export const GET: APIRoute = async ({ redirect }) => {
  try {
    const auth = await getAuthProvider();
    const url = auth.getGoogleAuthUrl();
    return redirect(url);
  } catch {
    return redirect("/auth/login?error=google_auth_failed");
  }
};
