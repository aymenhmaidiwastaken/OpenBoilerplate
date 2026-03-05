import { atom } from "nanostores";

export const $sidebarOpen = atom(false);
export const $mobileMenuOpen = atom(false);
export const $commandPaletteOpen = atom(false);

export function toggleSidebar() {
  $sidebarOpen.set(!$sidebarOpen.get());
}

export function toggleMobileMenu() {
  $mobileMenuOpen.set(!$mobileMenuOpen.get());
}

export function toggleCommandPalette() {
  $commandPaletteOpen.set(!$commandPaletteOpen.get());
}
