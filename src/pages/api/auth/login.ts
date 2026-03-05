export const prerender = false;

import type { APIRoute } from "astro";
import { getAuthProvider } from "@/providers/auth";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ message: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!password || typeof password !== "string") {
      return new Response(JSON.stringify({ message: "Password is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const auth = await getAuthProvider();
    const session = await auth.signIn(email, password);

    cookies.set("session", session.token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return new Response(JSON.stringify({ user: session.user }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Invalid email or password";
    return new Response(JSON.stringify({ message }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
};
