"use client";
// Desktop top navigation bar for the command center. Northstar wordmark, primary
// screen nav, and the right cluster (Accounts / Edit funds / profile avatar).
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ScreenId } from "@/lib/types";
import { Icon } from "@/components/Icon";
import { Wordmark } from "@/components/Brand";
import { useStore } from "@/lib/store";
import { initialOf } from "@/lib/format";
import { SCREEN_PATH, screenFromPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV: { label: string; screen: ScreenId }[] = [
  { label: "Today", screen: "today" },
  { label: "Spending", screen: "spending" },
  { label: "Debt", screen: "debt" },
  { label: "Trends", screen: "trends" },
  { label: "Funds", screen: "funds" },
  { label: "Bills", screen: "bills" },
];

export default function TopNav() {
  const { s, openModal, isDark } = useStore();
  const current = screenFromPath(usePathname());

  return (
    <div className="sticky top-0 z-20 flex h-[60px] items-center gap-[30px] border-b bg-background/80 px-[34px] backdrop-blur-md">
      <Link href={SCREEN_PATH.today} className="flex items-center no-underline">
        {/* The wordmark asset already includes the star mark — don't add a separate Logo. */}
        <Wordmark height={26} tone={isDark ? "white" : "color"} priority />
      </Link>

      <div className="flex gap-0.5">
        {NAV.map((n) => {
          const active = current === n.screen;
          return (
            <Link
              key={n.screen}
              href={SCREEN_PATH[n.screen]}
              className={cn(
                "rounded-[9px] px-[13px] py-[7px] text-[13.5px] no-underline transition-colors",
                active ? "bg-primary/10 font-semibold text-primary" : "font-normal text-muted-foreground"
              )}
            >
              {n.label}
            </Link>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => openModal({ kind: "accounts" })}
          className="h-auto gap-1.5 rounded-[9px] border-foreground/15 px-3.5 py-[7px] text-[13px] font-medium text-foreground/80"
        >
          <Icon name="card" size={15} />
          Accounts
        </Button>
        <Link
          href={SCREEN_PATH.onboarding}
          className="rounded-[9px] border border-primary/20 bg-primary/[0.08] px-3.5 py-[7px] text-[13px] font-medium text-primary no-underline"
        >
          Edit funds
        </Link>
        <button
          type="button"
          onClick={() => openModal({ kind: "profile" })}
          title="Account & profile"
          className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-warm to-brand-warm-soft text-[13px] font-semibold text-white"
        >
          {initialOf(s.userName)}
        </button>
      </div>
    </div>
  );
}
