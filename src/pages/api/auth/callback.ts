export const prerender = false;

import type { APIRoute } from "astro";
import { getAuthProvider } from "@/providers/auth";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/auth/login?error=missing_code");
  }

  try {
    const auth = await getAuthProvider();
    const session = await auth.handleGoogleCallback(code);

    cookies.set("session", session.token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return redirect("/dashboard");
  } catch {
    return redirect("/auth/login?error=callback_failed");
  }
};
