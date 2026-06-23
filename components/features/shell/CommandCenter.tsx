"use client";
// Root shell of the Northstar command center. Wraps everything in the store and renders
// a single responsive chrome around the routed screen ({children}). There is no device
// simulation: the desktop top-nav layout shows at the md breakpoint and up, the mobile
// app chrome (bottom tab bar, pull-to-refresh) shows below it — switched purely by CSS,
// not JS state. Both trees mount; CSS hides the inactive one. Mounted from the root
// layout so store state survives route navigation.
import { ReactNode, useEffect, useState } from "react";
import { StoreProvider, useStore } from "@/lib/store";
import TopNav from "./TopNav";
import Modals from "@/components/features/Modals";
import { MobileScroll, MobileExtras, MobileTabBar, MobileTxnSheet } from "./MobileFrame";
import { Toaster } from "@/components/ui/sonner";

function Shell({ children }: { children: ReactNode }) {
  const { isDark } = useStore();

  // Bridge the store's theme to shadcn: toggle the `dark` class on <html> so themed
  // CSS variables (and portaled Dialog/Toaster content) resolve to the dark palette.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // One responsive shell, no device simulation. A full-height flex column:
  //   - TopNav at md+ (hidden on phones)
  //   - the routed screen ({children}) in a single scroll area — pull-to-refresh on
  //     phones, normal page scroll on desktop
  //   - the bottom tab bar + mobile floating extras below md (hidden on desktop)
  // The desktop content is capped at a centered column; mobile fills the viewport.
  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-background font-sans text-foreground">
      {/* Desktop top nav (md and up) */}
      <div className="hidden md:block">
        <TopNav />
      </div>

      {/* Single scrollable content region with pull-to-refresh (active on touch). The
          inner column caps the width and centers on desktop, full-bleed on phones. */}
      <MobileScroll>
        <div className="mx-auto w-full max-w-[1080px] md:px-[34px] md:pt-11 md:pb-24">
          {children}
        </div>
      </MobileScroll>

      {/* Mobile floating extras (advisor input bar, install prompt) — phones only */}
      <div className="md:hidden">
        <MobileExtras />
      </div>

      {/* Bottom tab bar — phones only */}
      <div className="md:hidden">
        <MobileTabBar />
      </div>

      {/* Mobile add-transaction sheet — phones only (covers the viewport) */}
      <div className="md:hidden">
        <MobileTxnSheet />
      </div>

      {/* Desktop modal layer (dialogs) */}
      <Modals />
      <Toaster theme={isDark ? "dark" : "light"} position="bottom-center" />
    </div>
  );
}

export default function CommandCenter({ children }: { children: ReactNode }) {
  // Track the OS color scheme so the "System" theme option resolves correctly.
  // Initialise from the media query lazily (client-only) and then only update on
  // change events — avoids a synchronous setState inside the effect body.
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  return (
    <StoreProvider systemDark={systemDark}>
      <Shell>{children}</Shell>
    </StoreProvider>
  );
}
