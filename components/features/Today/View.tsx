"use client";
// TODAY screen — single responsive "command center". Below `md` it renders the compact
// mobile picture (full-bleed sticky greeting header, stacked single-column cards, combined
// advisor blurb, 2-up quick stats, slim progress bars, top bills); at `md`+ it expands to
// the desktop layout (plain header, 4-up KPI grid, debt-road timeline beside the fund card,
// full mark-paid bills list). Falls back to empty-state onboarding cards with no account data.
import { Icon, Sparkle } from "@/components/Icon";
import { useStore } from "@/lib/store";
import { usd0 } from "@/lib/format";
import { netWorth, freeCashFlow, totalDebt, totalSaved, originalDebt } from "@/lib/selectors";
import { cn } from "@/lib/utils";
import { Card } from "@/components/composed";
import { Button } from "@/components/ui/button";

const ADVISOR_LINES = [
  "You're in good shape this month — free cash flow is up $310, which gives us real room to move.",
  "Your most expensive balance is the Visa Signature at 24.9% APR. Pointing the extra there saves the most interest.",
  "Trim dining out by about $120 and your vacation fund stays automated without touching anything else.",
];

// Mobile collapses the advisor note into a single tighter paragraph.
const ADVISOR_BLURB =
  "You're in good shape this month — free cash flow is up $310, which gives us real room to move. Your most expensive balance is the Visa Signature at 24.9% APR, so that's where the extra should go.";

const TONE: Record<string, string> = {
  green: "bg-brand-green/[0.14] text-brand-green",
  warm: "bg-brand-warm/[0.14] text-brand-warm",
  accent: "bg-primary/[0.14] text-primary",
};

export default function Today() {
  const { s, dispatch, openModal, go, showToast } = useStore();
  const hasData = s.accounts.length > 0;

  const dateStr = "Sunday, June 21";
  const profileInitial = (s.userName.trim()[0] || "?").toUpperCase();

  return (
    <div>
      {/* Greeting header. Mobile: full-bleed sticky bar (breaks out of the shell's px-4)
          with account + profile buttons. Desktop: plain inline header. */}
      <div className="sticky top-0 z-[6] -mx-4 flex items-center justify-between gap-2.5 border-b bg-background/85 px-5 pt-[13px] pb-[11px] backdrop-blur-md md:static md:mx-0 md:block md:border-b-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div>
          <div className="text-[12.5px] text-muted-foreground md:text-[13px] md:tracking-[0.02em]">{dateStr}</div>
          <div className="mt-px font-serif text-[25px] font-medium tracking-[-0.02em] md:hidden">Good morning, {s.userName}</div>
          <h1 className="mt-1.5 hidden font-serif text-[40px] font-normal leading-[1.1] tracking-[-0.02em] md:block">Good morning, {s.userName}.</h1>
        </div>
        <div className="flex flex-none items-center gap-2 md:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => openModal({ kind: "accounts" })}
            title="Connected accounts"
            className="size-10 flex-none rounded-xl border-border bg-card text-foreground/80"
          >
            <Icon name="card" size={19} strokeWidth={1.9} />
          </Button>
          <button
            type="button"
            onClick={() => openModal({ kind: "profile" })}
            title="Account & profile"
            className="flex size-10 flex-none items-center justify-center rounded-full bg-gradient-to-br from-brand-warm to-brand-warm-soft text-[15px] font-semibold text-white"
          >
            {profileInitial}
          </button>
        </div>
      </div>

      <p className="mt-2.5 hidden max-w-[560px] text-base leading-normal text-muted-foreground md:block">
        {hasData
          ? "Here's where you stand today — and the one move that matters most."
          : "Let's get your money set up — connect an account and I'll take it from here."}
      </p>

      {!hasData && <EmptyState openModal={openModal} go={go} />}
      {hasData && <HasData dispatch={dispatch} go={go} showToast={showToast} s={s} />}
    </div>
  );
}

function EmptyState({
  openModal,
  go,
}: {
  openModal: ReturnType<typeof useStore>["openModal"];
  go: ReturnType<typeof useStore>["go"];
}) {
  const steps = [
    {
      iconClass: "bg-primary/10 text-primary",
      iconName: "card" as const,
      title: "Connect accounts",
      desc: "Auto-sync balances and transactions in seconds.",
      onClick: () => openModal({ kind: "connect" }),
    },
    {
      iconClass: "bg-brand-warm/[0.12] text-brand-warm",
      iconName: "target" as const,
      title: "Set up a fund",
      desc: "A trip, an emergency fund, a home down payment.",
      onClick: () => openModal({ kind: "fund" }),
    },
    {
      iconClass: "bg-brand-green/[0.12] text-brand-green",
      iconName: "trendingUp" as const,
      title: "Track a debt",
      desc: "See your fastest, cheapest path to payoff.",
      onClick: () => openModal({ kind: "debt" }),
    },
  ];

  return (
    <div className="mt-[15px] md:mt-0">
      <Card className="rounded-[20px] px-5 py-[22px] shadow-[0_14px_30px_-22px_rgba(44,39,34,.5)] md:mt-[30px] md:px-10 md:py-11 md:shadow-[0_10px_30px_-18px_rgba(44,39,34,.25)]">
        <div className="flex size-11 items-center justify-center rounded-[13px] bg-gradient-to-br from-primary to-brand-accent-soft md:size-[52px] md:rounded-[15px]">
          <Sparkle size={24} />
        </div>
        <h2 className="mt-3.5 font-serif text-[21px] font-medium leading-[1.15] tracking-[-0.01em] md:mt-5 md:text-[27px]">
          <span className="md:hidden">Set up your command center</span>
          <span className="hidden md:inline">Let&apos;s set up your command center</span>
        </h2>
        <p className="mt-[7px] text-sm leading-relaxed text-muted-foreground md:mt-[9px] md:max-w-[490px] md:text-[15.5px] md:text-pretty">
          <span className="md:hidden">
            Connect an account and I&apos;ll pull your balances, spending and debts together — then hand you the move that matters most.
          </span>
          <span className="hidden md:inline">
            Link a bank, card or loan and I&apos;ll pull your balances, spending, debts and funds into one place — then hand you the single move that matters most this week.
          </span>
        </p>
        <div className="mt-4 flex flex-col gap-2.5 md:mt-6 md:flex-row md:flex-wrap">
          <Button
            onClick={() => openModal({ kind: "connect" })}
            className="h-auto w-full gap-[7px] rounded-xl p-[13px] text-sm font-semibold md:w-auto md:rounded-[10px] md:px-[18px] md:py-[11px]"
          >
            <Icon name="plus" size={16} strokeWidth={2.4} />
            Connect an account
          </Button>
          <Button
            variant="outline"
            onClick={() => go("advisor")}
            className="hidden h-auto rounded-[10px] border-foreground/15 bg-transparent px-[18px] py-[11px] text-sm font-medium text-foreground/80 md:inline-flex"
          >
            Ask the advisor
          </Button>
        </div>
      </Card>
      <div className="mt-[30px] mb-3 hidden text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase md:block">
        Three steps to a full picture
      </div>
      <div className="mt-[11px] flex flex-col gap-[11px] md:mt-0 md:grid md:grid-cols-[repeat(auto-fit,minmax(212px,1fr))] md:gap-3.5">
        {steps.map((step) => (
          <Card
            key={step.title}
            role="button"
            tabIndex={0}
            onClick={step.onClick}
            className="flex cursor-pointer items-center gap-[13px] rounded-2xl px-4 py-[15px] text-left md:block md:p-5"
          >
            <div className={cn("flex size-9 flex-none items-center justify-center rounded-[11px] md:size-[38px]", step.iconClass)}>
              <Icon name={step.iconName} size={19} />
            </div>
            <div className="min-w-0 flex-1 md:flex-none">
              <div className="text-[14.5px] font-semibold md:mt-[13px] md:text-[15px]">{step.title}</div>
              <div className="mt-px text-xs leading-snug text-muted-foreground md:mt-[3px] md:text-[12.5px]">{step.desc}</div>
            </div>
            <Icon name="chevronRight" size={16} strokeWidth={2.2} style={{ flex: "none" }} className="text-muted-foreground/60 md:hidden" />
          </Card>
        ))}
      </div>
    </div>
  );
}

function HasData({
  dispatch,
  go,
  showToast,
  s,
}: {
  dispatch: ReturnType<typeof useStore>["dispatch"];
  go: ReturnType<typeof useStore>["go"];
  showToast: ReturnType<typeof useStore>["showToast"];
  s: ReturnType<typeof useStore>["s"];
}) {
  const kpis = [
    { label: "Net worth", value: usd0(netWorth(s)) },
    { label: "Free cash flow", value: usd0(freeCashFlow(s)) },
    { label: "Total debt", value: usd0(totalDebt(s)) },
    { label: "Total saved", value: usd0(totalSaved(s)) },
  ];

  const debts = [...s.debts].sort((a, b) => a.order - b.order);
  const fund = s.funds[0];
  const fundPct = fund && fund.target ? Math.round((fund.saved / fund.target) * 100) : 0;

  const billsTotal = s.bills.reduce((a, b) => a + b.amount, 0);
  const remindBill = s.bills.find((b) => !b.paid && b.soon);

  // Mobile "road to debt-free" progress bar derives from how much of the original debt is gone.
  const debtTotal = totalDebt(s);
  const orig = originalDebt(s);
  const debtFreePct = `${Math.round(((orig - debtTotal) / (orig || 1)) * 100)}%`;
  // PROTOTYPE STUB: hardcoded month-over-month debt delta. Replace with real period comparison for production.
  const debtDelta = "−$1,310";

  return (
    <div className="mt-[15px] flex flex-col gap-[13px] md:mt-0 md:block">
      {/* advisor note — mobile: one blurb + single CTA; desktop: three lines + two CTAs */}
      <Card className="rounded-[20px] p-[18px] shadow-[0_14px_30px_-22px_rgba(44,39,34,.5)] md:mt-[30px] md:px-8 md:py-[30px] md:shadow-[0_10px_30px_-18px_rgba(44,39,34,.25)]">
        <div className="mb-3 flex items-center gap-2.5 md:mb-[18px] md:gap-3">
          <div className="flex size-8 flex-none items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-brand-accent-soft md:size-[38px] md:rounded-xl">
            <Sparkle size={17} />
          </div>
          <div>
            <div className="font-serif text-base font-medium leading-[1.1] md:text-lg md:leading-normal">A note from your advisor</div>
            <div className="mt-px text-[11.5px] text-muted-foreground/70 md:text-[12.5px]">Reviewed your full picture · {s.accounts.length} accounts</div>
          </div>
        </div>
        <p className="text-[15px] leading-relaxed text-foreground/80 md:hidden">{ADVISOR_BLURB}</p>
        <div className="hidden flex-col gap-[13px] md:flex">
          {ADVISOR_LINES.map((line, i) => (
            <p key={i} className="m-0 max-w-[660px] text-base leading-relaxed text-foreground/80 text-pretty">
              {line}
            </p>
          ))}
        </div>
        <div className="mt-3.5 flex flex-col gap-2.5 md:mt-[22px] md:flex-row md:flex-wrap">
          <Button
            onClick={() => go("debt")}
            className="h-auto w-full rounded-xl p-3 text-sm font-semibold md:w-auto md:rounded-[10px] md:px-[18px] md:py-2.5"
          >
            Build my payoff plan
          </Button>
          <Button
            variant="outline"
            onClick={() => go("advisor")}
            className="hidden h-auto rounded-[10px] border-foreground/15 bg-transparent px-[18px] py-2.5 text-sm font-medium text-foreground/80 md:inline-flex"
          >
            Ask a question
          </Button>
        </div>
      </Card>

      {/* quick stats (mobile, 2-up) — at desktop this becomes the full 4-up KPI grid below */}
      <div className="grid grid-cols-2 gap-[11px] md:hidden">
        <Card className="rounded-2xl px-4 py-[15px]">
          <div className="text-xs text-muted-foreground">Free cash flow</div>
          <div className="tnum mt-[3px] text-[22px] font-semibold tracking-[-0.02em]">{usd0(freeCashFlow(s))}</div>
          <div className="mt-0.5 text-[11.5px] text-brand-green">+$310 this month</div>
        </Card>
        <Card className="rounded-2xl px-4 py-[15px]">
          <div className="text-xs text-muted-foreground">Total debt</div>
          <div className="tnum mt-[3px] text-[22px] font-semibold tracking-[-0.02em]">{usd0(debtTotal)}</div>
          <div className="mt-0.5 text-[11.5px] text-brand-green">{debtDelta} this month</div>
        </Card>
      </div>

      {/* KPI grid (desktop only) */}
      <div className="mt-6 hidden grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-px overflow-hidden rounded-2xl border bg-border md:grid">
        {kpis.map((k) => (
          <div key={k.label} className="bg-card px-5 py-[18px]">
            <div className="text-[12.5px] text-muted-foreground">{k.label}</div>
            <div className="tnum mt-1 text-[23px] font-semibold tracking-[-0.02em]">{k.value}</div>
          </div>
        ))}
      </div>

      {/* road to debt-free (mobile, slim progress bar) — desktop shows the full timeline card */}
      <Card className="p-[18px] md:hidden">
        <div className="flex items-baseline justify-between">
          <div className="font-serif text-[17px] font-medium">Road to debt-free</div>
          <span className="tnum text-[13px] text-muted-foreground">{debtFreePct}</span>
        </div>
        <div className="mt-[13px] h-[9px] overflow-hidden rounded-[7px] bg-foreground/[0.07]">
          <div className="h-full rounded-[7px] bg-gradient-to-r from-primary to-brand-accent-soft" style={{ width: debtFreePct }} />
        </div>
      </Card>

      {/* debt road timeline + vacation fund. Stacked on mobile (the road card itself is hidden
          on mobile above); side-by-side at desktop. */}
      <div className="md:mt-5 md:grid md:grid-cols-[1.3fr_1fr] md:items-start md:gap-5">
        <Card className="hidden md:block md:p-6">
          <div className="font-serif text-[19px] font-medium">Your road to debt-free</div>
          <div className="mt-[3px] mb-[18px] text-[13px] text-muted-foreground">We tackle the most expensive balance first</div>
          <div className="flex flex-col">
            {debts.map((d, i) => (
              <div key={d.id} className="flex items-start gap-3.5">
                <div className="flex flex-none flex-col items-center">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/[0.12] text-[13px] font-bold text-primary">{d.order}</div>
                  {i < debts.length - 1 && <div className="min-h-[22px] w-0.5 flex-1 bg-border" />}
                </div>
                <div className="flex-1 pb-[18px]">
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="text-[14.5px] font-semibold">{d.name}</span>
                    <span className="tnum text-sm font-semibold">{usd0(d.balance)}</span>
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-muted-foreground">
                    {d.apr} APR · {i === 0 ? "Most expensive — tackle first" : "On minimums for now"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {fund && (
          <Card className="p-[18px] md:p-6">
            {/* Mobile fund header: emoji + name + percent. Desktop: serif title + target line. */}
            <div className="flex items-center gap-2.5 md:hidden">
              <span className="text-[22px]">{fund.emoji}</span>
              <div className="flex-1">
                <div className="text-[15px] font-semibold">{fund.name}</div>
                <div className="text-xs text-muted-foreground">Target Dec 2026 · $263/mo</div>
              </div>
              <span className="tnum text-[13px] text-muted-foreground">{fundPct}%</span>
            </div>
            <div className="hidden md:block">
              <div className="font-serif text-[19px] font-medium">{fund.name}</div>
              <div className="mt-[3px] text-[13px] text-muted-foreground">Target December 2026</div>
              <div className="mt-5 flex items-end gap-1.5">
                <span className="tnum font-serif text-[34px] font-semibold tracking-[-0.02em]">{usd0(fund.saved)}</span>
                <span className="pb-1.5 text-sm text-muted-foreground">of {fund.target ? usd0(fund.target) : "—"}</span>
              </div>
            </div>

            <div className="mt-[13px] h-[9px] overflow-hidden rounded-[7px] bg-border md:mt-3.5 md:h-2.5 md:rounded-lg">
              <div className="h-full rounded-[7px] bg-gradient-to-r from-brand-warm to-brand-warm-soft md:rounded-lg" style={{ width: `${fundPct}%` }} />
            </div>

            {/* Mobile: saved / target footnote. Desktop: contribution copy + automate CTA. */}
            <div className="mt-[9px] flex justify-between md:hidden">
              <span className="tnum text-xs text-muted-foreground">{usd0(fund.saved)} saved</span>
              <span className="tnum text-xs text-muted-foreground">{usd0(fund.target ?? 0)} target</span>
            </div>
            <div className="hidden md:block">
              <div className="mt-3.5 text-[13px] leading-normal text-muted-foreground">
                Set aside <strong>$263/mo</strong> to arrive on time. Trimming a couple of subscriptions covers most of it.
              </div>
              <Button
                onClick={() => go("funds")}
                className="mt-4 h-auto w-full rounded-[9px] bg-brand-warm/10 px-[15px] py-[9px] text-[13.5px] font-semibold text-brand-warm hover:bg-brand-warm/20"
              >
                Automate this saving
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* upcoming bills — mobile shows the top 3 as tap-to-toggle rows; desktop shows the full
          list with reminder banner and explicit mark-paid buttons. */}
      <Card className="px-[18px] pt-1.5 pb-2.5 md:mt-5 md:p-6">
        <div className="flex items-baseline justify-between pt-3.5 pb-1 md:mb-4 md:pt-0 md:pb-0">
          <div className="font-serif text-[17px] font-medium md:text-[19px]">
            <span className="md:hidden">Upcoming bills</span>
            <span className="hidden md:inline">Upcoming bills &amp; subscriptions</span>
          </div>
          <span className="tnum text-[12.5px] text-muted-foreground md:text-sm">{usd0(billsTotal)}<span className="md:hidden">/mo</span><span className="hidden md:inline"> / mo</span></span>
        </div>
        {remindBill && (
          <div className="mb-1.5 hidden items-center gap-2.5 rounded-xl border border-brand-amber/[0.22] bg-brand-amber/[0.09] px-3.5 py-[11px] md:flex">
            <Icon name="bell" size={16} strokeWidth={2} style={{ flex: "none" }} className="text-brand-amber" />
            <span className="text-[13px] text-foreground/80">
              <strong>
                {remindBill.name} ({usd0(remindBill.amount)}) is due {remindBill.due}
              </strong>
              .
            </span>
          </div>
        )}
        <div className="flex flex-col">
          {s.bills.map((b, i) => {
            const showStatus = b.paid || !!b.soon;
            // Mobile only surfaces the first three bills.
            const mobileHidden = i >= 3 ? "hidden md:flex" : "flex";
            return (
              <div
                key={b.id}
                className={cn("items-center gap-3.5 border-t border-border/60 py-3 first:border-t-0 md:py-3", mobileHidden)}
              >
                <div className={cn("flex size-[34px] flex-none items-center justify-center rounded-[10px]", b.paid ? "bg-brand-green/[0.14] text-brand-green" : "bg-foreground/[0.07] text-muted-foreground")}>
                  <Icon name={b.paid ? "check" : "card"} size={b.paid ? 15 : 16} strokeWidth={b.paid ? 2.2 : 1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{b.name}</span>
                    {showStatus && (
                      <span
                        className={cn(
                          "rounded-[5px] px-[7px] py-0.5 text-[10px] font-bold tracking-[0.02em] whitespace-nowrap",
                          b.paid ? "bg-brand-green/[0.12] text-brand-green" : "bg-brand-amber/[0.14] text-brand-amber"
                        )}
                      >
                        {b.paid ? "PAID" : "DUE SOON"}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground/70">{b.kind} · due {b.due}</div>
                </div>
                <span className="tnum text-right text-sm font-semibold md:w-[72px]">{usd0(b.amount)}</span>
                <Button
                  variant="outline"
                  onClick={() => {
                    dispatch({ t: "toggleBill", id: b.id });
                    showToast(b.paid ? `${b.name} marked unpaid` : `${b.name} marked paid`);
                  }}
                  className={cn(
                    "hidden h-auto flex-none rounded-lg border-foreground/15 px-3 py-[7px] text-xs md:inline-flex",
                    b.paid ? "bg-transparent font-medium text-muted-foreground" : "bg-secondary font-semibold text-foreground/80"
                  )}
                >
                  {b.paid ? "Undo" : "Mark paid"}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* household activity */}
      <Card className="p-[18px] md:mt-5 md:p-6">
        <div className="mb-1.5 flex items-baseline justify-between md:mb-4">
          <div className="font-serif text-[17px] font-medium md:text-[19px]">Household activity</div>
          <span className="text-[11.5px] text-muted-foreground md:text-[12.5px]">you &amp; {Math.max(0, s.members.length - 1)} others</span>
        </div>
        <div className="flex flex-col">
          {s.activity.map((a) => {
            const tone = TONE[a.tone] ?? TONE.accent;
            return (
              <div key={a.id} className="flex items-center gap-[11px] border-t border-border/60 py-[11px] first:border-t-0 md:gap-[13px] md:py-3">
                <div className="relative flex-none">
                  <div className="flex size-[34px] items-center justify-center rounded-full text-[13px] font-semibold text-white md:size-9 md:text-sm" style={{ background: a.avColor }}>
                    {a.initial}
                  </div>
                  <div className={cn("absolute -right-[3px] -bottom-[3px] flex size-[17px] items-center justify-center rounded-full border-2 border-card md:size-[18px]", tone)}>
                    <Icon name="dot" size={10} strokeWidth={2.6} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] text-foreground/80 md:text-sm">
                    <strong className="font-semibold">{a.who}</strong> {a.action}
                  </div>
                  <div className="mt-px truncate text-[11.5px] text-muted-foreground/70 md:text-xs">{a.detail}</div>
                </div>
                <span className="flex-none text-[11px] text-muted-foreground/60 md:text-[11.5px]">{a.ago}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
