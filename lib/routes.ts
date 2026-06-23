// Single source of truth mapping the command center's screens to App Router URLs.
// Both the desktop shell and the mobile frame are now URL-driven: the active screen
// is derived from the pathname rather than from in-memory state. The mobile tabs are
// a subset of the desktop screens and share the same canonical paths.
import type { ScreenId, MobileTab } from "./types";

// Canonical path per screen. The funds screen lives at /funds; the today screen is the
// index route.
export const SCREEN_PATH: Record<ScreenId, string> = {
  today: "/",
  spending: "/spending",
  debt: "/debt",
  trends: "/trends",
  funds: "/funds",
  bills: "/bills",
  advisor: "/advisor",
  onboarding: "/onboarding",
};

const PATH_SCREEN: Record<string, ScreenId> = Object.fromEntries(
  Object.entries(SCREEN_PATH).map(([screen, path]) => [path, screen as ScreenId])
) as Record<string, ScreenId>;

// Resolve a pathname back to a screen, defaulting to "today" for "/" and unknowns.
export function screenFromPath(pathname: string): ScreenId {
  return PATH_SCREEN[pathname] ?? "today";
}

// The mobile frame only renders these tabs; any other screen falls back to "today".
const MOBILE_TABS: readonly MobileTab[] = ["today", "spending", "advisor", "funds", "debt"];

export function mobileTabFromPath(pathname: string): MobileTab {
  const screen = screenFromPath(pathname);
  return (MOBILE_TABS as readonly string[]).includes(screen) ? (screen as MobileTab) : "today";
}

export const pathForScreen = (screen: ScreenId) => SCREEN_PATH[screen];
export const pathForMobileTab = (tab: MobileTab) => SCREEN_PATH[tab];
