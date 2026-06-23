"use client";
// Renders a screen by id. Each route's page.tsx renders <Screen id="..." />; the
// responsive shell chrome (top nav / bottom tab bar) lives in CommandCenter. Every
// screen is now a single responsive component (one tree that reflows across the md
// breakpoint), so there's no device branching here — no device state, no per-viewport
// variant swap. Screens style themselves via the shadcn theme tokens.
//
// Each screen is loaded with `next/dynamic` so it ships as its own client chunk, fetched
// on demand with ScreenSkeleton shown while it loads. Import paths are string literals
// (required — dynamic() can't take a template/variable path), so we look the component up
// from this map by id. Each screen's responsive component lives in its feature's View.tsx.
import dynamic from "next/dynamic";
import type { ScreenId } from "@/lib/types";
import ScreenSkeleton from "./ScreenSkeleton";

const loading = () => <ScreenSkeleton />;

const screens = {
  today: dynamic(() => import("@/components/features/Today/View"), { loading }),
  spending: dynamic(() => import("@/components/features/Spending/View"), { loading }),
  debt: dynamic(() => import("@/components/features/Debt/View"), { loading }),
  trends: dynamic(() => import("@/components/features/Trends/View"), { loading }),
  funds: dynamic(() => import("@/components/features/Funds/View"), { loading }),
  bills: dynamic(() => import("@/components/features/Bills/View"), { loading }),
  advisor: dynamic(() => import("@/components/features/Advisor/View"), { loading }),
  onboarding: dynamic(() => import("@/components/features/Onboarding/View"), { loading }),
} as const;

export default function Screen({ id }: { id: ScreenId }) {
  const S = screens[id as keyof typeof screens] ?? screens.today;
  return <S />;
}
