"use client";
// Live viewport check for the mobile breakpoint, matching Tailwind's `md` (768px) — the
// same point CommandCenter swaps top nav for the bottom tab bar. Returns false on the
// server and first client render (desktop-first, avoids a hydration mismatch), then
// corrects on mount and tracks viewport changes.
import { useEffect, useState } from "react";

// Below this width we use the mobile screen variants. Keep in sync with the `md:` gates
// in CommandCenter / MobileFrame.
const MOBILE_QUERY = "(max-width: 767.98px)";

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isMobile;
}
