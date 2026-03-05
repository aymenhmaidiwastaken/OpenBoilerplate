// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";

const adapter = () => {
  const target = process.env.DEPLOY_TARGET;
  if (target === "vercel") return import("@astrojs/vercel").then((m) => m.default());
  if (target === "netlify") return import("@astrojs/netlify").then((m) => m.default());
  if (target === "node" || !target) return import("@astrojs/node").then((m) => m.default({ mode: "standalone" }));
  return undefined;
};

export default defineConfig({
  output: "server",
  adapter: await adapter(),
  integrations: [react(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
