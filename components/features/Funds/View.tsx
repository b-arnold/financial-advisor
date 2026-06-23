"use client";
// Responsive "Your funds" screen — savings-path bar chart, the funds list with
// per-fund progress + log/edit/delete, a filterable contribution history (fund chips +
// timeframe presets + date range), and the advisor's savings-plan strategy card.
// Reads funds + contributions from the store. Below `md` it renders the compact mobile
// layout (full-bleed sticky header, tighter spacing); at `md`+ the richer desktop layout.
import { useMemo, useState } from "react";
import { Icon, Sparkle } from "@/components/Icon";
import { useStore } from "@/lib/store";
import { fundsBars, totalSaved } from "@/lib/selectors";
import { usd0, monthYear, shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, ProgressBar, Chip, AddRowBtn } from "@/components/composed";
import { Button } from "@/components/ui/button";

type Preset = { id: string; label: string; days: number | null };
const PRESETS: Preset[] = [
  { id: "all", label: "All time", days: null },
  { id: "30", label: "30 days", days: 30 },
  { id: "90", label: "90 days", days: 90 },
  { id: "180", label: "6 months", days: 180 },
  { id: "365", label: "1 year", days: 365 },
];

export default function Funds() {
  const { s, dispatch, openModal, showToast, go } = useStore();

  const [fundFilter, setFundFilter] = useState<string | null>(null);
  const [preset, setPreset] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [draft, setDraft] = useState<string>("");

  const fundCount = s.funds.length;
  const saved = totalSaved(s);
  const bars = useMemo(() => fundsBars(s), [s]);
  const pace = useMemo(
    () => s.contributions.reduce((a, c) => a + c.amount, 0) / Math.max(1, new Set(s.contributions.map((c) => c.date.slice(0, 7))).size),
    [s.contributions]
  );

  const fundById = useMemo(() => new Map(s.funds.map((g) => [g.id, g])), [s.funds]);

  // ---- contribution filtering -------------------------------------------------
  const totalContrib = s.contributions.reduce((a, c) => a + c.amount, 0);
  const filtered = useMemo(() => {
    const activePreset = PRESETS.find((p) => p.id === preset);
    // PROTOTYPE STUB: "now" is pinned to the seed date so canned contribution dates filter
    // deterministically. Replace with new Date() for production.
    const now = new Date("2026-06-21");
    return s.contributions.filter((c) => {
      if (fundFilter && c.fundId !== fundFilter) return false;
      if (from && c.date < from) return false;
      if (to && c.date > to) return false;
      if (activePreset && activePreset.days != null && !from && !to) {
        const d = new Date(c.date);
        const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        if (diff > activePreset.days) return false;
      }
      return true;
    });
  }, [s.contributions, fundFilter, preset, from, to]);

  const hasContributions = s.contributions.length > 0;
  const contribEmpty = !hasContributions;
  const contribNoMatch = hasContributions && filtered.length === 0;

  const clearFilter = () => {
    setFundFilter(null);
    setPreset("all");
    setFrom("");
    setTo("");
  };

  const fundsStrat = s.fundsStrategy;
  const addNote = () => {
    const text = draft.trim();
    if (!text) return;
    dispatch({ t: "addStratNote", which: "funds", text });
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-[13px] md:block">
      {/* header — full-bleed sticky on mobile, plain flow on desktop */}
      <div className="sticky top-0 z-[6] -mx-4 flex flex-wrap items-end justify-between gap-3 border-b bg-background/85 px-4 pt-[13px] pb-[11px] backdrop-blur-md md:static md:mx-0 md:border-b-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
        <div>
          <div className="text-[12.5px] text-muted-foreground md:text-[13px]">
            <span className="md:hidden">{fundCount} active</span>
            <span className="hidden md:inline">{fundCount} funds · automated to keep you on pace</span>
          </div>
          <h1 className="mt-px font-serif text-[25px] font-medium tracking-[-0.02em] md:mt-1 md:text-[34px] md:font-normal">
            <span className="md:hidden">Funds</span>
            <span className="hidden md:inline">Your funds</span>
          </h1>
        </div>
        <Button
          onClick={() => openModal({ kind: "contribution" })}
          className="h-auto rounded-[11px] px-[15px] py-[9px] text-[13px] font-semibold md:rounded-[10px] md:px-[18px] md:py-2.5 md:text-[13.5px]"
        >
          + Contribution
        </Button>
      </div>

      {/* savings path */}
      {s.funds.length > 0 && (
        <Card className="p-[18px] md:mt-6 md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2.5">
            <div>
              <div className="font-serif text-[17px] font-medium md:text-[19px]">Savings path</div>
              <div className="mt-0.5 text-[11.5px] text-muted-foreground md:mt-[3px] md:text-[13px]">
                <span className="md:hidden">Saved over time · last 7 months</span>
                <span className="hidden md:inline">Total saved over time · last 7 months</span>
              </div>
            </div>
            <div className="text-right">
              <div className="tnum font-serif text-[20px] font-medium md:text-[30px] md:tracking-[-0.02em]">{usd0(saved)}</div>
              <div className="text-[10.5px] text-muted-foreground md:text-xs">
                <span className="md:hidden">saved today</span>
                <span className="hidden md:inline">saved today · {usd0(Math.round(pace))}/mo</span>
              </div>
            </div>
          </div>
          <div className="mt-3.5 flex h-[120px] items-end gap-[7px] border-b border-border/60 pb-0 md:mt-5 md:h-[150px] md:gap-2.5 md:border-border">
            {bars.map((b, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-[5px] md:gap-[7px]">
                {b.now && <span className="tnum text-[9.5px] font-semibold text-brand-green md:text-[11px]">{b.valueLabel}</span>}
                <div
                  className={cn("w-full max-w-[30px] rounded-t-[5px] md:max-w-[38px] md:rounded-t-md", b.now ? "bg-brand-green" : "bg-foreground/[0.12]")}
                  style={{ height: b.heightPct }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex md:mt-[9px]">
            {bars.map((b, i) => (
              <span
                key={i}
                className={cn("flex-1 text-center text-[10.5px] md:text-[11.5px]", b.now ? "font-semibold text-brand-green" : "text-muted-foreground/70")}
              >
                {b.label}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* funds list */}
      <Card className="p-[18px] md:mt-[18px] md:p-6">
        <div className="flex items-baseline justify-between gap-2.5">
          <div className="font-serif text-[17px] font-medium md:text-[19px]">
            <span className="md:hidden">Funds</span>
            <span className="hidden md:inline">Funds · {usd0(saved)} saved</span>
          </div>
          <span className="tnum text-[13px] text-muted-foreground md:hidden">{usd0(saved)} saved</span>
        </div>
        <div className="mt-px mb-[15px] text-xs text-muted-foreground md:mt-[3px] md:mb-[18px] md:text-[13px]">
          <span className="md:hidden">Automated to keep you on pace</span>
          <span className="hidden md:inline">Automated to keep you on pace toward each target</span>
        </div>
        <div className="flex flex-col gap-4 md:gap-5">
          {s.funds.map((g) => {
            const hasTarget = g.kind === "Target" && g.target != null;
            const pct = hasTarget && g.target ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
            const remaining = hasTarget && g.target ? Math.max(0, g.target - g.saved) : 0;
            const monthly = hasTarget && g.target ? Math.round(remaining / Math.max(1, monthsToTarget(g.date))) : 0;
            return (
              <div key={g.id}>
                <div className="mb-[7px] flex items-center justify-between gap-2.5 md:mb-2 md:gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-[9px] md:flex-none md:gap-[11px]">
                    <span className="text-[20px] md:text-[23px]">{g.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold md:text-[14.5px]">{g.name}</div>
                      {hasTarget ? (
                        <div className="text-[11px] text-muted-foreground/70 md:text-[11.5px]">
                          <span className="md:hidden">On pace for {monthYear(g.date)}</span>
                          <span className="hidden md:inline">On pace for {monthYear(g.date)} · {usd0(monthly)}/mo</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-muted-foreground/70 md:text-[11.5px]">
                          <span className="md:hidden">Open fund · no target</span>
                          <span className="hidden md:inline">Open fund · no set target</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-none items-center gap-2.5">
                    <div className="hidden text-right md:block">
                      <div className="tnum text-[14.5px] font-semibold">{usd0(g.saved)}</div>
                      {hasTarget ? (
                        <div className="tnum text-[11px] text-muted-foreground/70">of {usd0(g.target!)}</div>
                      ) : (
                        <div className="tnum text-[11px] text-muted-foreground/70">saved</div>
                      )}
                    </div>
                    <Button
                      onClick={() => openModal({ kind: "contribution" })}
                      title="Log a contribution"
                      className="h-auto flex-none gap-1 rounded-[9px] bg-brand-teal/10 px-[11px] py-[7px] text-xs font-semibold text-brand-teal hover:bg-brand-teal/20 md:h-[34px] md:gap-[5px] md:px-[13px] md:py-0 md:text-[13px]"
                    >
                      <Icon name="plus" size={13} strokeWidth={2.4} />
                      <span className="md:hidden">Add</span>
                      <span className="hidden md:inline">Contribution</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openModal({ kind: "fund", fundId: g.id })}
                      title="Edit"
                      className="hidden size-[34px] flex-none rounded-[9px] border-foreground/15 bg-secondary text-muted-foreground md:flex"
                    >
                      <Icon name="edit" size={15} strokeWidth={1.9} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        dispatch({ t: "deleteFund", id: g.id });
                        showToast("Fund deleted");
                      }}
                      title="Delete"
                      className="hidden size-[34px] flex-none rounded-[9px] border-foreground/15 bg-secondary text-brand-warm md:flex"
                    >
                      <Icon name="trash" size={15} strokeWidth={1.9} />
                    </Button>
                  </div>
                </div>
                {hasTarget ? (
                  <>
                    <ProgressBar pct={pct} color={g.color} h={8} />
                    <div className="mt-[5px] flex items-center justify-between md:mt-1.5">
                      <span className="text-[11.5px] text-muted-foreground/70">
                        <span className="md:hidden">{usd0(g.saved)} of {usd0(g.target!)} · {pct}%</span>
                        <span className="hidden md:inline">{usd0(g.saved)} saved · {pct}%</span>
                      </span>
                      <span className="text-[11.5px] text-muted-foreground/70">{usd0(remaining)} to go</span>
                    </div>
                  </>
                ) : (
                  <div className="mt-0.5 flex items-center gap-[9px]">
                    <div
                      className="h-[7px] flex-1 rounded-md md:h-2"
                      style={{ background: "repeating-linear-gradient(90deg,var(--border),var(--border) 5px,transparent 5px,transparent 11px)" }}
                    />
                    <span className="flex-none text-[11.5px] text-muted-foreground/70">
                      <span className="md:hidden">{usd0(g.saved)} saved</span>
                      <span className="hidden md:inline">No target · open fund</span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {s.funds.length === 0 && (
          <div className="px-4 pt-[30px] pb-1.5 text-center text-[13.5px] leading-normal text-muted-foreground">
            No funds yet. Add one to start saving toward something.
          </div>
        )}
        <AddRowBtn onClick={() => openModal({ kind: "fund" })}>Add a fund</AddRowBtn>
      </Card>

      {/* contribution history */}
      <Card className="p-[18px] md:mt-5 md:p-6">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2.5 md:items-baseline">
          <div className="font-serif text-[17px] font-medium md:text-[19px]">Contribution history</div>
          <div className="flex items-center gap-3.5">
            <span className="hidden text-[13px] text-muted-foreground md:inline">{usd0(totalContrib)} added across {s.contributions.length} contributions</span>
            <Button
              onClick={() => openModal({ kind: "contribution" })}
              className="h-auto flex-none gap-[5px] rounded-[10px] px-[13px] py-2 text-[12.5px] font-semibold md:gap-0 md:px-3.5 md:text-[13px]"
            >
              <Icon name="plus" size={13} strokeWidth={2.6} style={{ flex: "none" }} />
              Contribution
            </Button>
          </div>
        </div>
        <div className="mb-2.5 text-xs text-muted-foreground md:mb-3.5 md:text-[13px]">
          <span className="md:hidden">{usd0(totalContrib)} added across {s.contributions.length} contributions</span>
          <span className="hidden md:inline">Every logged contribution adds to a fund and moves you toward the target</span>
        </div>

        {hasContributions && (
          <>
            {/* mobile: horizontally scrollable fund chips */}
            <div className="appscroll -mx-[18px] mb-1.5 flex gap-[7px] overflow-x-auto px-[18px] md:hidden">
              <button
                type="button"
                onClick={() => setFundFilter(null)}
                className={cn(
                  "flex flex-none items-center gap-[5px] whitespace-nowrap rounded-lg px-[11px] py-1.5 text-xs transition-colors",
                  fundFilter == null ? "bg-primary font-semibold text-primary-foreground" : "border bg-secondary font-medium text-muted-foreground"
                )}
              >
                <span className="size-[7px] rounded-full" style={{ background: fundFilter == null ? "rgba(255,255,255,.85)" : "#6d5bd0" }} />
                All
              </button>
              {s.funds.map((g) => {
                const active = fundFilter === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setFundFilter((p) => (p === g.id ? null : g.id))}
                    className={cn(
                      "flex flex-none items-center gap-[5px] whitespace-nowrap rounded-lg px-[11px] py-1.5 text-xs transition-colors",
                      active ? "bg-primary font-semibold text-primary-foreground" : "border bg-secondary font-medium text-muted-foreground"
                    )}
                  >
                    <span className="size-[7px] rounded-full" style={{ background: active ? "rgba(255,255,255,.85)" : g.color }} />
                    {g.name}
                  </button>
                );
              })}
            </div>

            {/* desktop: chip row + timeframe presets + date range */}
            <div className="hidden md:block">
              <div className="flex flex-wrap items-center gap-[7px]">
                <Chip active={fundFilter == null} onClick={() => setFundFilter(null)} dot="#fff">
                  All funds
                </Chip>
                {s.funds.map((g) => (
                  <Chip
                    key={g.id}
                    active={fundFilter === g.id}
                    onClick={() => setFundFilter((p) => (p === g.id ? null : g.id))}
                    dot={g.color}
                  >
                    {g.name}
                  </Chip>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2.5 border-t border-dashed pt-[13px]">
                <span className="text-xs font-semibold tracking-[0.02em] text-muted-foreground">TIMEFRAME</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {PRESETS.map((p) => {
                    const active = preset === p.id && !from && !to;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPreset(p.id);
                          setFrom("");
                          setTo("");
                        }}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs whitespace-nowrap transition-colors",
                          active
                            ? "bg-primary font-semibold text-primary-foreground"
                            : "border bg-secondary font-medium text-muted-foreground"
                        )}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <div className="ml-auto flex items-center gap-[7px]">
                  <input
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    type="date"
                    className="rounded-[9px] border bg-secondary px-2.5 py-[7px] text-[12.5px] text-foreground outline-none"
                  />
                  <span className="text-[13px] text-muted-foreground/70">–</span>
                  <input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    type="date"
                    className="rounded-[9px] border bg-secondary px-2.5 py-[7px] text-[12.5px] text-foreground outline-none"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {contribEmpty && (
          <div className="border-t border-border/60 px-3 py-[22px] text-center md:px-4 md:py-[26px]">
            <div className="text-[13px] text-muted-foreground md:text-[13.5px]">No contributions logged yet. Use <strong>+ Contribution</strong> to record one.</div>
          </div>
        )}

        {contribNoMatch && (
          <div className="mt-3 border-t border-border/60 px-3 py-5 text-center md:px-4 md:py-[26px]">
            <div className="text-[13px] text-muted-foreground md:text-[13.5px]">No contributions match this filter.</div>
            <Button
              onClick={clearFilter}
              className="mt-2.5 h-auto rounded-lg bg-primary/10 px-[13px] py-[7px] text-xs font-semibold text-primary hover:bg-primary/20 md:mt-3 md:rounded-[9px] md:px-[15px] md:py-2 md:text-[12.5px]"
            >
              Clear filter
            </Button>
          </div>
        )}

        <div className="mt-1.5 flex flex-col">
          {filtered.map((c) => {
            const g = fundById.get(c.fundId);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => openModal({ kind: "contribution", contributionId: c.id })}
                className="flex w-full items-center gap-3 border-t border-border/60 py-[11px] text-left first:border-t-0 md:gap-3.5 md:py-3"
              >
                <div className="size-[9px] flex-none rounded-full" style={{ background: g?.color ?? "var(--muted-foreground)" }} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{g?.name ?? "Fund"}</div>
                  <div className="text-[11.5px] text-muted-foreground/70 md:text-xs">{shortDate(c.date)}</div>
                </div>
                <span className="tnum text-sm font-semibold text-brand-teal">+{usd0(c.amount)}</span>
                <Icon name="chevronRight" size={16} strokeWidth={2.2} style={{ flex: "none" }} className="hidden text-muted-foreground/60 md:block" />
              </button>
            );
          })}
        </div>
      </Card>

      {/* savings plan strategy */}
      <Card className="border-primary/[0.18] p-[18px] md:mt-[18px] md:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5 md:mb-0 md:items-start md:gap-3.5">
          <div className="flex min-w-0 items-center gap-[9px] md:gap-3">
            <div className="flex size-7 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-primary to-brand-accent-soft md:size-[38px] md:rounded-[11px]">
              <Sparkle size={19} fill="#fff" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold tracking-[0.04em] text-primary uppercase md:text-[11px]">
                <span className="md:hidden">Savings plan · advisor</span>
                <span className="hidden md:inline">Savings plan · set by your advisor</span>
              </div>
              <div className="font-serif text-[18px] font-medium md:mt-px md:text-[23px] md:tracking-[-0.01em]">{fundsStrat.name}</div>
            </div>
          </div>
          <Button
            onClick={() => go("advisor")}
            className="h-auto flex-none rounded-[9px] bg-primary/[0.12] px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20 md:rounded-[10px] md:px-[15px] md:py-[9px] md:text-[13px]"
          >
            <span className="md:hidden">Adjust →</span>
            <span className="hidden md:inline">Adjust with advisor →</span>
          </Button>
        </div>
        <div className="mb-[13px] text-[13px] leading-relaxed text-muted-foreground md:mt-3.5 md:mb-0 md:max-w-[640px] md:text-sm">{fundsStrat.desc}</div>
        <div className="hidden text-[11.5px] font-semibold tracking-[0.02em] text-muted-foreground md:mt-5 md:mb-2.5 md:block">NOTES</div>
        <div className="flex flex-col gap-[9px] md:gap-2.5">
          {fundsStrat.notes.map((n) => {
            const isYou = n.by === "you";
            return (
              <div key={n.id} className="rounded-[11px] border bg-card px-3 py-2.5 md:rounded-xl md:px-3.5 md:py-3">
                <div className="mb-1.5 flex items-center justify-between gap-2 md:mb-[7px]">
                  <div className="flex items-center gap-[7px] md:gap-2">
                    <span
                      className={cn(
                        "rounded-[5px] px-[7px] py-0.5 text-[9.5px] font-bold tracking-[0.03em] uppercase md:rounded-md md:px-2 md:text-[10px]",
                        isYou ? "bg-brand-gold/[0.14] text-brand-gold" : "bg-primary/[0.12] text-primary"
                      )}
                    >
                      {isYou ? "You" : "Advisor"}
                    </span>
                    <span className="text-[10.5px] text-muted-foreground/70 md:text-[11.5px]">{n.at}</span>
                  </div>
                  {isYou && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => dispatch({ t: "deleteStratNote", which: "funds", id: n.id })}
                      title="Delete note"
                      className="size-[22px] rounded-md text-muted-foreground/60 hover:bg-transparent md:size-6"
                    >
                      <Icon name="plus" size={13} style={{ transform: "rotate(45deg)" }} />
                    </Button>
                  )}
                </div>
                <div className="text-[13.5px] leading-relaxed text-foreground/80 md:text-sm">{n.text}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-2.5 flex items-center gap-2 rounded-[11px] border bg-card py-1 pr-1 pl-3 md:mt-3 md:gap-[9px] md:py-[5px] md:pr-[5px] md:pl-3.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addNote();
            }}
            placeholder="Add a note…"
            className="min-w-0 flex-1 border-none bg-transparent py-2 text-[13.5px] text-foreground outline-none md:text-sm"
          />
          <Button onClick={addNote} className="h-auto flex-none rounded-[9px] px-[13px] py-2 text-[12.5px] font-semibold md:px-4 md:py-[9px] md:text-[13px]">
            <span className="md:hidden">Add</span>
            <span className="hidden md:inline">Add note</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}

// "2026-12" -> months from June 2026 (the seed "now"), min 1
function monthsToTarget(date: string | null): number {
  if (!date) return 1;
  const [y, m] = date.split("-").map(Number);
  const months = (y - 2026) * 12 + (m - 6);
  return Math.max(1, months);
}
