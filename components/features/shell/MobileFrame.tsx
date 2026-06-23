"use client";
// Mobile app chrome for the Northstar PWA, exported as composable pieces the responsive
// shell (CommandCenter) drops in below the md breakpoint:
//   - MobileScroll: the pull-to-refresh scroll area that hosts the routed screen
//   - MobileExtras: the docked advisor input bar (advisor tab) + the install prompt
//   - MobileTabBar: the bottom tab bar
//   - MobileTxnSheet: the add-transaction bottom sheet
// There is no fake phone bezel/status bar — on a real phone the OS draws the hardware
// chrome. The active tab is derived from the URL (see routes.ts). Content surfaces use
// shadcn primitives + theme tokens.
import { PointerEvent, ReactNode, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { Sparkle, Icon } from "@/components/Icon";
import { ADVISOR_SUGGESTIONS } from "@/lib/seed";
import { mobileTabFromPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/use-is-mobile";
import { Button } from "@/components/ui/button";
import { TextInput, MoneyInput, DateInput, FieldLabel } from "@/components/composed";

const PULL_THRESHOLD = 64;

// ---- Pull-to-refresh scroll area ---------------------------------------------
// Hosts the routed screen at every breakpoint: normal page scroll on desktop, with
// pull-to-refresh added on phones (gesture handlers no-op above the mobile breakpoint so
// a mouse drag on desktop can't trigger a refresh).
export function MobileScroll({ children }: { children: ReactNode }) {
  const { showToast } = useStore();
  const isMobile = useIsMobile();

  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const onPullDown = (e: PointerEvent) => {
    if (!isMobile) return;
    const el = scrollRef.current;
    if (el && el.scrollTop <= 0) startY.current = e.clientY;
    else startY.current = null;
  };
  const onPullMove = (e: PointerEvent) => {
    if (startY.current == null) return;
    const el = scrollRef.current;
    if (el && el.scrollTop > 0) {
      startY.current = null;
      setPull(0);
      return;
    }
    const dy = e.clientY - startY.current;
    if (dy > 0) setPull(Math.min(dy * 0.5, 90));
  };
  const onPullUp = () => {
    if (startY.current != null && pull >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPull(40);
      // PROTOTYPE STUB: fake sync delay + toast. Replace with a real data refresh
      // (refetch accounts/txns) when wiring the production data layer.
      window.setTimeout(() => {
        setRefreshing(false);
        setPull(0);
        showToast("Synced just now");
      }, 700);
    } else if (!refreshing) {
      setPull(0);
    }
    startY.current = null;
  };

  const pullOpacity = Math.min(1, pull / PULL_THRESHOLD);
  const pullTranslate = pull;

  return (
    <div
      className="appscroll relative flex-1 overflow-y-auto overscroll-contain [touch-action:pan-y]"
      ref={scrollRef}
      onPointerDown={onPullDown}
      onPointerMove={onPullMove}
      onPointerUp={onPullUp}
      onPointerLeave={onPullUp}
    >
      {/* pull-to-refresh indicator */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] flex justify-center">
        <div style={{ marginTop: 6, opacity: pullOpacity, transform: `translateY(${pullTranslate}px)` }}>
          <Icon name="refresh" size={22} strokeWidth={2.4} className={cn("text-primary", refreshing && "spin")} />
        </div>
      </div>

      {/* Mobile gets edge padding here; desktop padding comes from the shell's column. */}
      <div className="px-4 pt-4 pb-6 md:p-0">{children}</div>
    </div>
  );
}

// ---- Mobile floating extras (advisor input bar + install prompt) -------------
export function MobileExtras() {
  const { showToast } = useStore();
  const tab = mobileTabFromPath(usePathname());
  const [installShow, setInstallShow] = useState(true);

  return (
    <>
      {/* advisor input bar (sits just above the tab bar on the advisor tab) */}
      {tab === "advisor" && <AdvisorInputBar />}

      {/* install prompt */}
      {installShow && (
        <div className="absolute inset-x-3 bottom-24 z-[55] flex items-center gap-3 rounded-[18px] border bg-card px-3.5 py-[13px] shadow-[0_20px_44px_-18px_rgba(44,39,34,.55)]">
          <Image
            src="/brand/northstar-app-icon.svg"
            alt="Northstar"
            width={44}
            height={44}
            className="flex-none rounded-[13px] shadow-[0_6px_14px_-6px_rgba(109,91,208,.7)]"
          />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">Add Northstar to Home Screen</div>
            <div className="mt-px text-[11.5px] text-muted-foreground">Your advisor, one tap away</div>
          </div>
          <Button
            onClick={() => {
              setInstallShow(false);
              showToast("Installing Northstar…");
            }}
            className="h-auto flex-none rounded-[10px] px-3.5 py-[9px] text-[13px] font-semibold"
          >
            Add
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setInstallShow(false)}
            aria-label="Dismiss"
            className="size-7 flex-none rounded-lg bg-secondary text-muted-foreground"
          >
            <Icon name="plus" size={14} style={{ transform: "rotate(45deg)" }} />
          </Button>
        </div>
      )}
    </>
  );
}

// ---- Add-transaction sheet (gated by the store modal state) ------------------
export function MobileTxnSheet() {
  const { modal } = useStore();
  if (modal.kind !== "txn") return null;
  return <AddTxnSheet txnId={modal.txnId} />;
}

// ---- Advisor input bar (fixed element below the scroll area) -----------------
function AdvisorInputBar() {
  const { dispatch, uid } = useStore();
  const [draft, setDraft] = useState("");

  const send = (text: string) => {
    const msg = text.trim();
    if (!msg) return;
    dispatch({ t: "addMessage", v: { id: uid("msg"), role: "user", text: msg } });
    setDraft("");
    // PROTOTYPE STUB: hardcoded canned advisor reply on a fake delay. Replace with a
    // real call to the advisor backend (streamed response) for production.
    window.setTimeout(() => {
      dispatch({
        t: "addMessage",
        v: {
          id: uid("msg"),
          role: "ai",
          text: "Good question. Based on your accounts, pointing the extra cash flow at your highest-APR balance saves the most — want me to lock that into your plan?",
        },
      });
    }, 600);
  };

  return (
    <div className="absolute inset-x-0 bottom-[84px] z-[45] border-t bg-background/95 px-3.5 pt-2.5 pb-[11px] backdrop-blur-md">
      <div className="appscroll mb-[9px] flex gap-[7px] overflow-x-auto">
        {ADVISOR_SUGGESTIONS.map((sug) => (
          <button
            key={sug}
            type="button"
            onClick={() => send(sug)}
            className="flex-none whitespace-nowrap rounded-[9px] border bg-card px-3 py-[7px] text-xs text-foreground/80"
          >
            {sug}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-[9px] rounded-[14px] border bg-card py-[7px] pr-[7px] pl-[15px]">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(draft);
          }}
          placeholder="Ask about your money…"
          className="flex-1 border-none bg-transparent text-sm text-foreground outline-none"
        />
        <Button
          onClick={() => send(draft)}
          size="icon"
          aria-label="Send"
          className="size-[34px] flex-none rounded-[10px]"
        >
          <Icon name="send" size={16} strokeWidth={2.4} style={{ color: "#fff" }} />
        </Button>
      </div>
    </div>
  );
}

// ---- Bottom tab bar ----------------------------------------------------------
// Self-contained: derives the active tab from the URL and navigates via the store. A
// normal flex child at the bottom of the mobile column; the safe-area inset keeps it
// clear of the OS home indicator. The container's `md:hidden` gating lives at the shell.
export function MobileTabBar() {
  const { goMobile } = useStore();
  const tab = mobileTabFromPath(usePathname());
  const advisorActive = tab === "advisor";
  const tabClass = (id: string) =>
    cn(
      "flex flex-1 flex-col items-center gap-1 transition-colors",
      tab === id ? "text-primary" : "text-muted-foreground/70"
    );

  return (
    <div className="z-50 flex h-[84px] flex-none items-start justify-between border-t bg-background/90 px-3 pt-[9px] pb-[max(22px,env(safe-area-inset-bottom))] backdrop-blur-lg">
      <button type="button" onClick={() => goMobile("today")} className={tabClass("today")}>
        <Icon name="home" size={23} strokeWidth={1.9} />
        <span className="text-[10px] font-medium">Today</span>
      </button>
      <button type="button" onClick={() => goMobile("spending")} className={tabClass("spending")}>
        <Icon name="bars" size={23} strokeWidth={1.9} />
        <span className="text-[10px] font-medium">Spending</span>
      </button>
      <button
        type="button"
        onClick={() => goMobile("advisor")}
        className={cn("flex flex-1 flex-col items-center gap-[5px]", advisorActive ? "text-primary" : "text-muted-foreground/70")}
      >
        <span
          className={cn(
            "-mt-[9px] flex h-[34px] w-[46px] items-center justify-center rounded-[13px]",
            advisorActive ? "bg-primary shadow-[0_6px_14px_-6px_rgba(109,91,208,.7)]" : "bg-primary/[0.12]"
          )}
        >
          <Sparkle size={19} fill={advisorActive ? "#fff" : "#6d5bd0"} />
        </span>
        <span className="text-[10px] font-medium">Advisor</span>
      </button>
      <button type="button" onClick={() => goMobile("funds")} className={tabClass("funds")}>
        <Icon name="piggy" size={23} strokeWidth={1.7} />
        <span className="text-[10px] font-medium">Funds</span>
      </button>
      <button type="button" onClick={() => goMobile("debt")} className={tabClass("debt")}>
        <Icon name="debt" size={23} strokeWidth={1.9} />
        <span className="text-[10px] font-medium">Debt</span>
      </button>
    </div>
  );
}

// ---- Add-transaction bottom sheet --------------------------------------------
function AddTxnSheet({ txnId }: { txnId?: string }) {
  const { s, dispatch, closeModal, uid } = useStore();
  const existing = txnId ? s.txns.find((x) => x.id === txnId) : undefined;

  const [merchant, setMerchant] = useState(existing?.merchant ?? "");
  const [amount, setAmount] = useState(existing ? String(Math.abs(existing.amount)) : "");
  const [date, setDate] = useState(existing?.date ?? "2026-06-21");
  const [categoryId, setCategoryId] = useState<string>(existing?.categoryId ?? s.categories[0]?.id ?? "");

  const title = existing ? "Edit transaction" : "Add transaction";

  const save = () => {
    const amt = parseFloat(amount);
    if (!merchant.trim() || isNaN(amt)) {
      closeModal();
      return;
    }
    dispatch({
      t: "upsertTxn",
      v: {
        id: existing?.id ?? uid("t"),
        merchant: merchant.trim(),
        amount: amt,
        date,
        categoryId: categoryId || null,
      },
    });
    closeModal();
  };

  return (
    <div className="absolute inset-0 z-[85] flex flex-col justify-end">
      <div onClick={closeModal} className="absolute inset-0 bg-foreground/40" />
      <div className="appscroll relative max-h-[86%] overflow-y-auto rounded-t-[26px] bg-card px-5 pt-2 pb-[26px] shadow-[0_-24px_60px_-22px_rgba(0,0,0,.5)]">
        <div className="mx-auto mt-1.5 mb-3.5 h-[5px] w-[38px] rounded-[5px] bg-foreground/20" />
        <div className="flex items-center justify-between">
          <div className="font-serif text-[22px] font-medium">{title}</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeModal}
            aria-label="Close"
            className="size-[30px] rounded-[9px] bg-secondary text-muted-foreground"
          >
            <Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} />
          </Button>
        </div>

        <FieldLabel className="mt-[18px] mb-[7px]">MERCHANT</FieldLabel>
        <TextInput value={merchant} onChange={setMerchant} placeholder="e.g. Whole Foods Market" />

        <div className="mt-4 flex gap-[11px]">
          <div className="flex-1">
            <FieldLabel className="m-0 mb-[7px]">AMOUNT</FieldLabel>
            <MoneyInput value={amount} onChange={setAmount} placeholder="0" />
          </div>
          <div className="flex-1">
            <FieldLabel className="m-0 mb-[7px]">DATE</FieldLabel>
            <DateInput value={date} onChange={setDate} />
          </div>
        </div>

        <FieldLabel className="mt-[18px] mb-[7px]">CATEGORY</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {s.categories.map((c) => {
            const active = categoryId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-[9px] px-3 py-2 text-[13px] transition-colors",
                  active
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "border bg-secondary font-medium text-muted-foreground"
                )}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: active ? "rgba(255,255,255,.85)" : c.color }}
                />
                {c.name}
              </button>
            );
          })}
        </div>

        <Button onClick={save} className="mt-[22px] h-auto w-full rounded-xl p-3.5 text-[15px] font-semibold">
          {existing ? "Save changes" : "Add transaction"}
        </Button>
      </div>
    </div>
  );
}
