"use client";
// Onboarding fund-catalog selector — a grid of selectable fund cards (FUND_CATALOG),
// toggled into s.selectedFundCatalog. "Build my plan" returns to Today and toasts.
import { useStore } from "@/lib/store";
import { FUND_CATALOG } from "@/lib/seed";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import { Card } from "@/components/composed";
import { Button } from "@/components/ui/button";

export default function Onboarding() {
  const { s, dispatch, go, showToast } = useStore();
  const selected = s.selectedFundCatalog;
  const selectedCount = selected.length;

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="text-center">
        <div className="text-[13px] font-semibold tracking-[0.04em] text-muted-foreground uppercase">
          Your plan adapts to these
        </div>
        <h1 className="mt-2.5 font-serif text-[38px] font-normal leading-[1.15] tracking-[-0.02em]">
          What are you working toward?
        </h1>
        <p className="mt-3 text-[15.5px] leading-normal text-muted-foreground">
          Pick everything that matters. Northstar reorders your dashboard, advice, and automations around what you choose.
        </p>
      </div>

      <div className="mt-[30px] grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
        {FUND_CATALOG.map((g) => {
          const isSelected = selected.includes(g.id);
          return (
            <Card
              key={g.id}
              raised
              role="button"
              tabIndex={0}
              onClick={() => dispatch({ t: "toggleCatalog", id: g.id })}
              className={cn(
                "relative cursor-pointer rounded-2xl p-[18px] text-left",
                isSelected && "border-2 border-primary shadow-[0_8px_22px_-14px_rgba(109,91,208,.5)]"
              )}
            >
              {isSelected && (
                <div className="absolute top-3.5 right-3.5 flex size-5 items-center justify-center rounded-full bg-primary">
                  <Icon name="check" size={12} strokeWidth={3} style={{ color: "#fff" }} />
                </div>
              )}
              <div className="text-[26px]">{g.emoji}</div>
              <div className="mt-2.5 text-[15px] font-semibold">{g.title}</div>
              <div className="mt-[3px] text-[12.5px] leading-snug text-muted-foreground">{g.desc}</div>
            </Card>
          );
        })}
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3.5">
        <span className="text-[13.5px] text-muted-foreground">{selectedCount} selected</span>
        <Button
          onClick={() => {
            go("today");
            showToast("Plan updated");
          }}
          className="h-auto rounded-[11px] px-[26px] py-3 text-[15px] font-semibold"
        >
          Build my plan →
        </Button>
      </div>
    </div>
  );
}
