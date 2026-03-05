import { atom } from "nanostores";

export type Theme = "light" | "dark" | "system";

export const $theme = atom<Theme>("system");

export function setTheme(theme: Theme) {
  $theme.set(theme);
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(prefersDark ? "dark" : "light");
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem("theme", theme);
  }
}

export function initTheme() {
  if (typeof document !== "undefined") {
    const saved = localStorage.getItem("theme") as Theme | null;
    setTheme(saved || "system");
  }
}
