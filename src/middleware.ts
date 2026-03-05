import { defineMiddleware } from "astro:middleware";
import { getAuthProvider } from "@/providers/auth";

const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/callback",
  "/blog",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/pricing",
  "/docs",
  "/ai-content",
  "/ai-image",
  "/ai-document",
  "/404",
];

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/api/auth/")) return true;
  if (pathname.startsWith("/api/webhooks/")) return true;
  if (pathname.startsWith("/blog/")) return true;
  if (pathname.startsWith("/docs/")) return true;
  return PUBLIC_PATHS.includes(pathname);
}

// Demo user for preview mode — no real auth needed
const DEMO_USER = {
  id: "demo-user",
  email: "sarah.chen@launchfast.io",
  name: "Sarah Chen",
  avatar: null,
  role: "admin" as const,
  plan: "pro",
  credits: 4320,
  createdAt: new Date("2024-08-15T09:23:00Z"),
};

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Skip static assets
  if (pathname.startsWith("/_") || pathname.includes(".")) {
    return next();
  }

  // Demo mode: inject fake admin user, skip all auth
  const isDemo = context.cookies.get("openboil-demo")?.value === "true";
  if (isDemo) {
    context.locals.user = DEMO_USER;
    return next();
  }

  // Try to verify session from cookie
  const token = context.cookies.get("session")?.value;
  if (token) {
    try {
      const auth = await getAuthProvider();
      const user = await auth.verifySession(token);
      context.locals.user = user;
    } catch {
      context.locals.user = null;
      context.cookies.delete("session", { path: "/" });
    }
  } else {
    context.locals.user = null;
  }

  // Protect private routes
  if (!isPublicPath(pathname) && !context.locals.user) {
    return context.redirect("/auth/login?redirect=" + encodeURIComponent(pathname));
  }

  // Protect admin routes
  if (pathname.startsWith("/admin") && context.locals.user?.role !== "admin") {
    return context.redirect("/dashboard");
  }

  return next();
});
