"use client";
// DEBT screen (responsive) — payoff path, sortable/reorderable balances, payment
// history with filters, and the advisor-authored payoff strategy card. Below `md`
// it renders the phone layout: a full-bleed sticky header, compact card padding,
// horizontally-scrolling sort/filter chips, and up/down priority buttons alongside
// drag. At `md`+ it becomes the desktop layout: inline header, the SORT/TIMEFRAME
// pill rows, larger type, and the date-range timeframe inputs.
import { DragEvent, ReactNode, useMemo, useState } from "react";
import { Icon, Sparkle } from "@/components/Icon";
import { useStore } from "@/lib/store";
import { debtSeries } from "@/lib/selectors";
import { usd0, shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, Chip, AddRowBtn, ProgressBar } from "@/components/composed";
import { Button } from "@/components/ui/button";

type SortMode = "apr" | "balance" | "lowest" | "priority";
type PresetKey = "all" | "30" | "90" | "6m" | "12m";

const SORT_OPTIONS: { mode: SortMode; label: string; shortLabel: string }[] = [
  { mode: "apr", label: "Highest APR", shortLabel: "APR" },
  { mode: "balance", label: "Highest balance", shortLabel: "Balance" },
  { mode: "lowest", label: "Lowest balance", shortLabel: "Lowest" },
  { mode: "priority", label: "Custom priority", shortLabel: "Priority" },
];

const SORT_SUBLABEL: Record<SortMode, string> = {
  apr: "Avalanche order — clears the most expensive interest first",
  balance: "Largest balances first",
  lowest: "Snowball order — clears the smallest balances first for quick wins",
  priority: "Drag to set your own payoff order",
};

const DATE_PRESETS: { key: PresetKey; label: string }[] = [
  { key: "all", label: "All time" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
  { key: "6m", label: "6 months" },
  { key: "12m", label: "12 months" },
];

const aprNum = (apr: string) => parseFloat(apr.replace("%", "")) || 0;

function presetFromIso(key: PresetKey): string {
  if (key === "all") return "";
  const days = key === "30" ? 30 : key === "90" ? 90 : key === "6m" ? 182 : 365;
  const d = new Date(2026, 5, 21);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// Small toggle pill used by the SORT and TIMEFRAME rows.
function TogglePill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs whitespace-nowrap transition-colors",
        active ? "bg-primary font-semibold text-primary-foreground" : "border bg-secondary font-medium text-muted-foreground"
      )}
    >
      {children}
    </button>
  );
}

export default function Debt() {
  const { s, dispatch, openModal, go } = useStore();

  const [sort, setSort] = useState<SortMode>("apr");
  const [payFilter, setPayFilter] = useState<string>("all"); // debtId | "all"
  const [preset, setPreset] = useState<PresetKey>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const priorityMode = sort === "priority";
  const ds = debtSeries(s);
  const totalBalance = s.debts.reduce((a, d) => a + d.balance, 0);

  // ---- sorted debts ----------------------------------------------------------
  const debts = useMemo(() => {
    const list = s.debts.slice();
    if (sort === "apr") list.sort((a, b) => aprNum(b.apr) - aprNum(a.apr));
    else if (sort === "balance") list.sort((a, b) => b.balance - a.balance);
    else if (sort === "lowest") list.sort((a, b) => a.balance - b.balance);
    else list.sort((a, b) => a.order - b.order);
    return list;
  }, [s.debts, sort]);

  // ---- drag reorder ----------------------------------------------------------
  const [dragId, setDragId] = useState<string | null>(null);
  const onDragStart = (id: string) => () => setDragId(id);
  const onDragOver = (e: DragEvent) => e.preventDefault();
  const orderIds = debts.map((d) => d.id);
  const reorder = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= orderIds.length || fromIdx === toIdx) return;
    const order = orderIds.slice();
    const [moved] = order.splice(fromIdx, 1);
    order.splice(toIdx, 0, moved);
    dispatch({ t: "reorderDebts", order });
  };
  const onDrop = (overId: string) => (e: DragEvent) => {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    const fromIdx = orderIds.indexOf(dragId);
    const toIdx = orderIds.indexOf(overId);
    reorder(fromIdx, toIdx);
    setDragId(null);
  };

  // ---- payments view-model ---------------------------------------------------
  const debtById = useMemo(() => new Map(s.debts.map((d) => [d.id, d])), [s.debts]);
  const effFrom = preset === "all" ? from : presetFromIso(preset) || from;
  const effTo = to;

  const filteredPayments = useMemo(() => {
    return s.payments.filter((p) => {
      if (payFilter !== "all" && p.debtId !== payFilter) return false;
      if (effFrom && p.date < effFrom) return false;
      if (effTo && p.date > effTo) return false;
      return true;
    });
  }, [s.payments, payFilter, effFrom, effTo]);

  const totalPaid = filteredPayments.reduce((a, p) => a + p.amount, 0);
  const hasPayments = s.payments.length > 0;
  const payNoMatch = hasPayments && filteredPayments.length === 0;

  const setFromPreset = (key: PresetKey) => {
    setPreset(key);
    if (key === "all") setFrom("");
    else setFrom(presetFromIso(key));
    setTo("");
  };

  return (
    <div>
      {/* header — full-bleed sticky bar on phones, inline header at md+ */}
      <div className="sticky top-0 z-[6] -mx-4 flex flex-wrap items-end justify-between gap-3 border-b bg-background/85 px-4 pt-[13px] pb-[11px] backdrop-blur-md md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:pt-0 md:pb-0 md:backdrop-blur-none">
        <div>
          <h1 className="mt-px font-serif text-[25px] font-medium tracking-[-0.02em] md:mt-1 md:text-[34px] md:font-normal">Your debt</h1>
        </div>
        <Button onClick={() => openModal({ kind: "payment" })} className="h-auto rounded-[11px] px-[15px] py-[9px] text-[13px] font-semibold whitespace-nowrap md:rounded-[10px] md:px-[18px] md:py-2.5 md:text-[13.5px]">
          + Payment
        </Button>
      </div>

      <div className="flex flex-col gap-[13px] pt-[15px] md:gap-0 md:pt-0">
        {/* payoff path */}
        {s.debts.length > 0 && (
          <Card className="p-[18px] md:mt-6 md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2.5">
              <div>
                <div className="font-serif text-[17px] font-medium md:text-[19px]">Payoff path</div>
                <div className="mt-0.5 text-xs text-muted-foreground md:mt-[3px] md:text-[13px]">
                  <span className="md:hidden">At $1,180/mo</span>
                  <span className="hidden md:inline">At your current pace of $1,180/mo</span>
                </div>
              </div>
              {/* phone: compact balance readout in header; desktop: trends link */}
              <div className="text-right md:hidden">
                <div className="tnum font-serif text-[20px] font-medium">{usd0(ds.now)}</div>
                <div className="text-[10.5px] text-muted-foreground">left today</div>
              </div>
              <Button onClick={() => go("trends")} className="hidden h-auto rounded-[9px] bg-primary/[0.08] px-3.5 py-2 text-[13px] font-semibold text-primary hover:bg-primary/[0.14] md:inline-flex">
                See full trends →
              </Button>
            </div>
            <div className="mt-[13px] flex flex-wrap items-end gap-7 md:mt-[18px]">
              {/* desktop-only inline summary block (phone shows it in the header + footer pill) */}
              <div className="hidden flex-none md:block">
                <div className="flex items-end gap-1.5">
                  <span className="tnum font-serif text-[32px] font-medium tracking-[-0.02em]">{usd0(ds.now)}</span>
                  <span className="pb-1.5 text-[13.5px] text-muted-foreground">left today</span>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-[11px] border border-primary/[0.16] bg-primary/[0.08] px-[13px] py-[9px]">
                  <div className="size-2 flex-none rounded-full bg-primary" />
                  <div className="text-[13px] text-foreground/80">Debt-free by <strong>{ds.eta}</strong></div>
                </div>
              </div>
              <div className="w-full min-w-0 md:min-w-[300px] md:flex-1">
                <svg viewBox="0 0 300 92" preserveAspectRatio="none" className="block h-24 w-full overflow-visible md:h-[120px]">
                  <line x1="0" y1="84" x2="300" y2="84" stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                  <polyline points={ds.histPts} fill="none" stroke="#c2705a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                  <polyline points={ds.projPts} fill="none" stroke="#6d5bd0" strokeWidth="2.2" strokeDasharray="4 5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                  <circle cx={ds.debtZeroX} cy={ds.debtZeroY} r="4" fill="#6d5bd0" stroke="var(--card)" strokeWidth="2" />
                </svg>
                <div className="relative mt-2 h-[15px] md:mt-[9px] md:h-4">
                  <span className="absolute -translate-x-1/2 text-[10.5px] text-muted-foreground md:text-[11.5px]" style={{ left: ds.debtNowLeft }}>
                    <span className="md:hidden">Jun 2026</span>
                    <span className="hidden md:inline">Now</span>
                  </span>
                  <span className="absolute right-0 text-[10.5px] font-semibold text-primary md:text-[11.5px]">{ds.eta}</span>
                </div>
              </div>
            </div>
            {/* phone-only debt-free pill (desktop shows it inside the summary block) */}
            <div className="mt-3 flex items-center gap-2 rounded-[11px] border border-primary/[0.16] bg-primary/[0.08] px-[13px] py-2.5 md:hidden">
              <div className="size-[7px] flex-none rounded-full bg-primary" />
              <div className="text-[12.5px] text-foreground/80">Debt-free by <strong>{ds.eta}</strong></div>
            </div>
          </Card>
        )}

        {/* balances */}
        <Card className="p-[18px] md:mt-6 md:p-6">
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-3.5 md:items-start">
            <div className="font-serif text-[17px] font-medium md:text-[19px]">
              Balances<span className="hidden md:inline"> · {usd0(totalBalance)}</span>
            </div>
            <span className="tnum text-[13px] text-muted-foreground md:hidden">{usd0(totalBalance)}</span>
            {/* desktop SORT pill row */}
            <div className="hidden flex-wrap items-center gap-1.5 md:flex">
              <span className="text-[11px] font-semibold tracking-[0.03em] text-muted-foreground">SORT</span>
              {SORT_OPTIONS.map((o) => (
                <TogglePill key={o.mode} active={sort === o.mode} onClick={() => setSort(o.mode)}>
                  {o.label}
                </TogglePill>
              ))}
            </div>
          </div>
          <div className="mb-2.5 text-xs text-muted-foreground md:mb-4 md:text-[13px]">{SORT_SUBLABEL[sort]}</div>
          {/* phone horizontal-scroll sort chips */}
          <div className="appscroll -mx-[18px] mb-[13px] flex gap-1.5 overflow-x-auto px-[18px] md:hidden">
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.mode}
                type="button"
                onClick={() => setSort(o.mode)}
                className={cn(
                  "flex flex-none items-center gap-[5px] whitespace-nowrap rounded-lg px-3 py-[7px] text-xs transition-colors",
                  sort === o.mode ? "bg-primary font-semibold text-primary-foreground" : "border bg-secondary font-medium text-muted-foreground"
                )}
              >
                {o.shortLabel}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-[15px] md:gap-3.5">
            {debts.map((d, i) => {
              const width = `${Math.min(100, (d.balance / (d.original || 1)) * 100)}%`;
              const paid = Math.max(0, d.original - d.balance);
              const hasPaid = paid > 0;
              return (
                <div
                  key={d.id}
                  draggable={priorityMode}
                  onDragStart={priorityMode ? onDragStart(d.id) : undefined}
                  onDragOver={priorityMode ? onDragOver : undefined}
                  onDrop={priorityMode ? onDrop(d.id) : undefined}
                  className="flex items-stretch gap-2 rounded-[9px] md:block"
                >
                  {priorityMode && (
                    <span title="Drag to reorder priority" className="flex flex-none cursor-grab items-center text-muted-foreground/60 [touch-action:none]">
                      <Icon name="grip" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2 md:gap-[9px]">
                        <span className="flex size-[21px] flex-none items-center justify-center rounded-[7px] bg-primary/[0.12] text-[11px] font-bold text-primary md:size-[22px] md:text-[11.5px]">{i + 1}</span>
                        <span className="text-sm font-medium">{d.name}</span>
                        <span className="hidden rounded-md bg-brand-warm/10 px-[7px] py-px text-[11px] font-medium text-brand-warm md:inline">{d.apr} APR</span>
                      </div>
                      <div className="flex items-center gap-[7px] md:gap-3">
                        <span className="tnum text-sm font-semibold">{usd0(d.balance)}</span>
                        {/* phone: tap chevron to edit; desktop: explicit Edit button */}
                        <button type="button" onClick={() => openModal({ kind: "debt", debtId: d.id })} className="md:hidden" title="Edit debt">
                          <Icon name="chevronRight" size={16} strokeWidth={2.2} style={{ flex: "none" }} className="text-muted-foreground/60" />
                        </button>
                        <Button
                          variant="outline"
                          onClick={() => openModal({ kind: "debt", debtId: d.id })}
                          className="hidden h-[34px] flex-none gap-1.5 rounded-[9px] border-foreground/15 bg-secondary px-[13px] text-[13px] font-semibold text-foreground/80 md:inline-flex"
                        >
                          <Icon name="edit" size={14} strokeWidth={2} />
                          Edit
                        </Button>
                      </div>
                    </div>
                    <ProgressBar pct={Math.min(100, (d.balance / (d.original || 1)) * 100)} color={d.color} h={7} className="md:hidden" />
                    <div className="hidden h-[7px] overflow-hidden rounded-md bg-foreground/[0.07] md:block">
                      <div className="h-full rounded-md" style={{ width, background: d.color }} />
                    </div>
                    <div className="mt-[5px] flex items-center gap-2">
                      <span className="text-[11.5px] text-muted-foreground/70">
                        <span className="md:hidden">{usd0(d.original)} original</span>
                        <span className="hidden md:inline">{usd0(d.balance)} of {usd0(d.original)} remaining</span>
                      </span>
                      {/* phone APR sits inline at the right of the row footer */}
                      <span className="ml-auto text-[11px] font-semibold text-brand-warm md:hidden">{d.apr} APR</span>
                      {hasPaid && (
                        <span className="hidden rounded-md bg-brand-green/10 px-[7px] py-px text-[11px] font-semibold text-brand-green md:inline">{usd0(paid)} paid</span>
                      )}
                    </div>
                  </div>
                  {/* phone-only up/down priority buttons (alongside drag) */}
                  {priorityMode && (
                    <div className="flex flex-none flex-col justify-center gap-[5px] md:hidden">
                      <Button
                        variant="outline"
                        onClick={() => reorder(i, i - 1)}
                        title="Higher priority"
                        className={cn("h-6 w-[30px] rounded-[7px] border-border bg-secondary p-0 text-muted-foreground", i === 0 && "opacity-35")}
                      >
                        <Icon name="chevronUp" size={13} strokeWidth={2.4} />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => reorder(i, i + 1)}
                        title="Lower priority"
                        className={cn("h-6 w-[30px] rounded-[7px] border-border bg-secondary p-0 text-muted-foreground", i === debts.length - 1 && "opacity-35")}
                      >
                        <Icon name="chevronDown" size={13} strokeWidth={2.4} />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {s.debts.length === 0 && (
            <div className="px-4 pt-[30px] pb-1.5 text-center text-[13.5px] leading-normal text-muted-foreground">No debts tracked. Add a balance to build your payoff plan.</div>
          )}
          <AddRowBtn onClick={() => openModal({ kind: "debt" })}>Add a debt</AddRowBtn>
        </Card>

        {/* payment history */}
        <Card className="p-[18px] md:mt-5 md:p-6">
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2.5">
            <div className="font-serif text-[17px] font-medium md:text-[19px]">Payment history</div>
            <span className="tnum text-[12.5px] text-muted-foreground md:text-[13px]">
              {usd0(totalPaid)} paid<span className="hidden md:inline"> across {filteredPayments.length} payments</span>
            </span>
          </div>
          <div className="mb-2 text-xs text-muted-foreground md:mb-3.5 md:text-[13px]">
            <span className="md:hidden">Each payment lowers the balance over time</span>
            <span className="hidden md:inline">Every logged payment lowers the balance and tracks your progress over time</span>
          </div>

          {hasPayments && (
            <>
              {/* phone: horizontal-scroll filter chips */}
              <div className="appscroll -mx-[18px] mb-1.5 flex gap-[7px] overflow-x-auto px-[18px] md:hidden">
                {[{ id: "all", name: "All", color: "#6d5bd0" }, ...s.debts.map((d) => ({ id: d.id, name: d.name, color: d.color }))].map((c) => {
                  const active = payFilter === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setPayFilter(c.id)}
                      className={cn(
                        "flex flex-none items-center gap-[5px] whitespace-nowrap rounded-lg px-3 py-[7px] text-xs transition-colors",
                        active ? "bg-primary font-semibold text-primary-foreground" : "border bg-secondary font-medium text-muted-foreground"
                      )}
                    >
                      <span className="size-[7px] rounded-full" style={{ background: active ? "rgba(255,255,255,.85)" : c.color }} />
                      {c.name}
                    </button>
                  );
                })}
              </div>
              {/* desktop: filter chips + TIMEFRAME presets + date-range inputs */}
              <div className="hidden flex-wrap items-center gap-[7px] md:flex">
                {[{ id: "all", name: "All debts", color: "#fff" }, ...s.debts.map((d) => ({ id: d.id, name: d.name, color: d.color }))].map((c) => (
                  <Chip key={c.id} active={payFilter === c.id} onClick={() => setPayFilter(c.id)} dot={c.color}>
                    {c.name}
                  </Chip>
                ))}
              </div>
              <div className="mt-3 hidden flex-wrap items-center gap-2.5 border-t border-dashed pt-[13px] md:flex">
                <span className="text-xs font-semibold tracking-[0.02em] text-muted-foreground">TIMEFRAME</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {DATE_PRESETS.map((p) => (
                    <TogglePill key={p.key} active={preset === p.key} onClick={() => setFromPreset(p.key)}>
                      {p.label}
                    </TogglePill>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-[7px]">
                  <input
                    value={from}
                    onChange={(e) => { setFrom(e.target.value); setPreset("all"); }}
                    type="date"
                    className="rounded-[9px] border bg-secondary px-2.5 py-[7px] text-[12.5px] text-foreground outline-none"
                  />
                  <span className="text-[13px] text-muted-foreground/70">–</span>
                  <input
                    value={to}
                    onChange={(e) => { setTo(e.target.value); setPreset("all"); }}
                    type="date"
                    className="rounded-[9px] border bg-secondary px-2.5 py-[7px] text-[12.5px] text-foreground outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {!hasPayments && (
            <div className="border-t border-border/60 px-3 py-[18px] text-center md:px-4 md:py-[26px]">
              <div className="text-[13px] text-muted-foreground md:text-[13.5px]">
                <span className="md:hidden">No payments logged yet.</span>
                <span className="hidden md:inline">No payments logged yet. Use <strong>Log a payment</strong> to record one.</span>
              </div>
            </div>
          )}

          {payNoMatch && (
            <div className="mt-3 border-t border-border/60 px-3 py-[18px] text-center md:px-4 md:py-[26px]">
              <div className="text-[13px] text-muted-foreground md:text-[13.5px]">
                <span className="md:hidden">No payments match.</span>
                <span className="hidden md:inline">No payments match this filter.</span>
              </div>
              <Button
                onClick={() => { setPayFilter("all"); setFromPreset("all"); }}
                className="mt-2.5 h-auto rounded-[9px] bg-primary/10 px-[13px] py-[7px] text-xs font-semibold text-primary hover:bg-primary/20 md:mt-3 md:px-[15px] md:py-2 md:text-[12.5px]"
              >
                Clear filter
              </Button>
            </div>
          )}

          <div className="mt-1.5 flex flex-col md:mt-1.5">
            {filteredPayments.map((p) => {
              const debt = debtById.get(p.debtId);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => openModal({ kind: "payment", paymentId: p.id })}
                  className="flex w-full items-center gap-3 border-t border-border/60 py-[11px] text-left first:border-t-0 md:gap-3.5 md:py-3"
                >
                  <div className="size-[9px] flex-none rounded-full" style={{ background: debt?.color ?? "var(--muted-foreground)" }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-medium md:text-sm">{debt?.name ?? "Unknown debt"}</div>
                    <div className="text-[11.5px] text-muted-foreground/70 md:text-xs">{shortDate(p.date)}</div>
                  </div>
                  <span className="tnum text-[13.5px] font-semibold text-brand-green md:text-sm">−{usd0(p.amount)}</span>
                  <Icon name="chevronRight" size={16} strokeWidth={2.2} style={{ flex: "none" }} className="text-muted-foreground/60" />
                </button>
              );
            })}
          </div>
        </Card>

        {/* payoff strategy */}
        <Card className="border-primary/[0.18] p-[18px] md:mt-6 md:p-6">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2.5 md:mb-0 md:gap-3.5">
            <div className="flex min-w-0 items-center gap-[9px] md:gap-3">
              <div className="flex size-7 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-primary to-brand-accent-soft md:size-[38px] md:rounded-[11px]">
                <Sparkle size={19} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold tracking-[0.04em] text-primary uppercase md:text-[11px]">
                  <span className="md:hidden">Strategy · set by advisor</span>
                  <span className="hidden md:inline">Payoff strategy · set by your advisor</span>
                </div>
                <div className="font-serif text-[18px] font-medium tracking-[-0.01em] md:mt-px md:text-[23px]">{s.debtStrategy.name}</div>
              </div>
            </div>
            <Button onClick={() => go("advisor")} className="h-auto flex-none rounded-[9px] bg-primary/[0.12] px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20 md:rounded-[10px] md:px-[15px] md:py-[9px] md:text-[13px]">
              <span className="md:hidden">Adjust →</span>
              <span className="hidden md:inline">Adjust with advisor →</span>
            </Button>
          </div>
          <div className="mb-[13px] max-w-[640px] text-[13px] leading-relaxed text-muted-foreground md:mt-3.5 md:mb-0 md:text-sm">{s.debtStrategy.desc}</div>
          <div className="hidden md:mt-5 md:mb-2.5 md:block md:text-[11.5px] md:font-semibold md:tracking-[0.02em] md:text-muted-foreground">NOTES</div>
          <div className="flex flex-col gap-[9px] md:gap-2.5">
            {s.debtStrategy.notes.map((n) => (
              <div key={n.id} className="rounded-[11px] border bg-card px-3 py-2.5 md:rounded-xl md:px-3.5 md:py-3">
                <div className="mb-1.5 flex items-center justify-between gap-2 md:mb-[7px]">
                  <div className="flex items-center gap-[7px] md:gap-2">
                    {n.by === "advisor" && <span className="rounded-[5px] bg-primary/[0.12] px-[7px] py-0.5 text-[9.5px] font-bold tracking-[0.03em] text-primary uppercase md:rounded-md md:px-2 md:text-[10px]">Advisor</span>}
                    {n.by === "you" && <span className="rounded-[5px] bg-brand-gold/[0.14] px-[7px] py-0.5 text-[9.5px] font-bold tracking-[0.03em] text-brand-gold uppercase md:rounded-md md:px-2 md:text-[10px]">You</span>}
                    <span className="text-[10.5px] text-muted-foreground/70 md:text-[11.5px]">{n.at}</span>
                  </div>
                  {n.by === "you" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => dispatch({ t: "deleteStratNote", which: "debt", id: n.id })}
                      title="Delete note"
                      className="size-[22px] rounded-md text-muted-foreground/60 hover:bg-transparent md:size-6"
                    >
                      <Icon name="plus" size={13} style={{ transform: "rotate(45deg)" }} />
                    </Button>
                  )}
                </div>
                <div className="text-[13.5px] leading-relaxed text-foreground/80 md:text-sm">{n.text}</div>
              </div>
            ))}
          </div>
          <StrategyNoteInput onAdd={(text) => dispatch({ t: "addStratNote", which: "debt", text })} />
        </Card>
      </div>
    </div>
  );
}

// Note composer for the payoff strategy card.
function StrategyNoteInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [draft, setDraft] = useState("");
  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft("");
  };
  return (
    <div className="mt-2.5 flex items-center gap-2 rounded-[11px] border bg-card py-1 pr-1 pl-3 md:mt-3 md:gap-[9px] md:py-[5px] md:pr-[5px] md:pl-3.5">
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder="Add a note…"
        className="min-w-0 flex-1 border-none bg-transparent py-2 text-[13.5px] text-foreground outline-none md:text-sm"
      />
      <Button onClick={submit} className="h-auto flex-none rounded-[9px] px-[13px] py-2 text-[12.5px] font-semibold md:px-4 md:py-[9px] md:text-[13px]">
        <span className="md:hidden">Add</span>
        <span className="hidden md:inline">Add note</span>
      </Button>
    </div>
  );
}
