export const prerender = false;

import type { APIRoute } from "astro";
import { getAuthProvider } from "@/providers/auth";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ message: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return new Response(
        JSON.stringify({
          message: "Password must be at least 8 characters",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return new Response(JSON.stringify({ message: "Name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const auth = await getAuthProvider();
    const session = await auth.signUp(email, password, name.trim());

    cookies.set("session", session.token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return new Response(JSON.stringify({ user: session.user }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Registration failed";
    return new Response(JSON.stringify({ message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
