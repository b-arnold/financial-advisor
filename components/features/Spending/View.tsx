"use client";
// SPENDING screen — responsive across breakpoints (one component, no device split).
//   - header: compact sticky bar on phones, large inline header at md+
//   - KPI: a single "spent so far" card on phones, a 3-tile stat grid at md+
//   - "where your money goes": centered donut + tappable category bars on phones,
//     side-by-side donut + bars with inline Edit buttons at md+
//   - transactions: search + horizontal filter chips on phones; at md+ adds timeframe
//     presets, a date range, and an inline export button
//   - the advisor-authored spending-plan strategy card with notes
// Desktop carries the richer logic (timeframe presets + real CSV export); on phones the
// timeframe row is hidden and the chip row scrolls horizontally.
import { ReactNode, useState } from "react";
import { Icon, Sparkle } from "@/components/Icon";
import { useStore } from "@/lib/store";
import { usd0, usd2, shortDate } from "@/lib/format";
import { donut, totalSpend, lastMonthSpend } from "@/lib/selectors";
import { cn } from "@/lib/utils";
import { Card, ProgressBar, AddRowBtn } from "@/components/composed";
import { Button } from "@/components/ui/button";

type Preset = { id: string; label: string; from: string | null; to: string | null };

const PRESETS: Preset[] = [
  { id: "all", label: "All", from: null, to: null },
  { id: "7d", label: "Last 7 days", from: "2026-06-14", to: "2026-06-21" },
  { id: "14d", label: "Last 14 days", from: "2026-06-07", to: "2026-06-21" },
  { id: "mtd", label: "This month", from: "2026-06-01", to: "2026-06-30" },
  { id: "30d", label: "Last 30 days", from: "2026-05-22", to: "2026-06-21" },
];

// Small toggle pill (category + timeframe filters).
function TogglePill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-none rounded-[9px] px-[13px] py-[7px] text-[12.5px] whitespace-nowrap transition-colors",
        active ? "bg-primary font-semibold text-primary-foreground" : "border bg-secondary font-medium text-muted-foreground"
      )}
    >
      {children}
    </button>
  );
}

export default function Spending() {
  const { s, dispatch, openModal, go, showToast } = useStore();

  const [txQuery, setTxQuery] = useState("");
  const [catFilter, setCatFilter] = useState<string | null>(null); // category id or null = all
  const [preset, setPreset] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [quickOpen, setQuickOpen] = useState<string | null>(null); // txn id whose popover is open

  const catName = (id: string | null) => s.categories.find((c) => c.id === id)?.name ?? "Uncategorized";
  const catColor = (id: string | null) => s.categories.find((c) => c.id === id)?.color ?? "var(--muted-foreground)";

  // ---- filtering --------------------------------------------------------------
  const q = txQuery.trim().toLowerCase();
  const filtered = s.txns.filter((tx) => {
    if (catFilter && tx.categoryId !== catFilter) return false;
    if (q) {
      const hay = `${tx.merchant} ${catName(tx.categoryId)}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (from && tx.date < from) return false;
    if (to && tx.date > to) return false;
    return true;
  });

  const applyPreset = (p: Preset) => {
    setPreset(p.id);
    setFrom(p.from ?? "");
    setTo(p.to ?? "");
  };

  const clearFilters = () => {
    setTxQuery("");
    setCatFilter(null);
    setPreset("all");
    setFrom("");
    setTo("");
  };

  // ---- donut + category bars --------------------------------------------------
  const { slices } = donut(s.categories);
  const total = totalSpend(s);
  const last = lastMonthSpend(s);
  const maxSpent = Math.max(1, ...s.categories.map((c) => c.spent));

  // ---- KPI stats --------------------------------------------------------------
  const momDelta = last ? ((total - last) / last) * 100 : 0;
  const momUp = momDelta > 0;
  const dailyAvg = total / 18;
  const topCat = [...s.categories].sort((a, b) => b.spent - a.spent)[0];

  // ---- CSV export -------------------------------------------------------------
  const exportCsv = () => {
    const header = "Date,Merchant,Category,Amount";
    const rows = filtered.map((tx) => {
      const cat = tx.categoryId === null ? "Income" : catName(tx.categoryId);
      return [tx.date, `"${tx.merchant.replace(/"/g, '""')}"`, `"${cat}"`, (-tx.amount).toFixed(2)].join(",");
    });
    const csv = [header, ...rows].join("\n");
    if (typeof document !== "undefined") {
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
    showToast(`Exported ${filtered.length} transaction${filtered.length === 1 ? "" : "s"}`);
  };

  // ---- transaction chips (All + categories) -----------------------------------
  const chips = [{ id: null as string | null, label: "All" }, ...s.categories.map((c) => ({ id: c.id, label: c.name }))];

  const hasQuery = q.length > 0;
  const noMatch = s.txns.length > 0 && filtered.length === 0;
  const zero = s.txns.length === 0;

  const spend = s.spendStrategy;
  const [draft, setDraft] = useState("");
  const addNote = () => {
    const text = draft.trim();
    if (!text) return;
    dispatch({ t: "addStratNote", which: "spend", text });
    setDraft("");
  };

  return (
    <div>
      {/* header — compact sticky bar on phones, large inline header at md+ */}
      <div className="sticky top-0 z-[6] -mx-4 flex flex-wrap items-end justify-between gap-3 border-b bg-background/85 px-5 pt-[13px] pb-[11px] backdrop-blur-md md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div>
          <div className="text-[12.5px] text-muted-foreground md:text-[13px]">This month · June</div>
          <h1 className="mt-px font-serif text-[25px] font-medium tracking-[-0.02em] md:mt-1 md:text-[34px] md:font-normal">
            <span className="md:hidden">Spending</span>
            <span className="hidden md:inline">Where your money&apos;s going</span>
          </h1>
        </div>
        <Button onClick={() => openModal({ kind: "txn" })} className="h-auto rounded-[11px] px-[15px] py-[9px] text-[13px] font-semibold md:rounded-[10px] md:px-[18px] md:py-2.5 md:text-[13.5px]">
          + Transaction
        </Button>
      </div>

      {/* KPI — single "spent so far" card on phones, 3-tile grid at md+ */}
      {total > 0 && (
        <>
          {/* phones */}
          <Card className="mt-[15px] p-[18px] md:hidden">
            <div className="text-[12.5px] text-muted-foreground">Spent so far</div>
            <div className="tnum mt-0.5 font-serif text-[34px] font-semibold tracking-[-0.03em]">{usd0(total)}</div>
            <div className="mt-1.5 flex gap-3.5">
              <span className={cn("text-[12.5px]", momUp ? "text-brand-warm" : "text-brand-green")}>
                {momUp ? "▲" : "▼"} {Math.abs(momDelta).toFixed(0)}% vs last month
              </span>
              <span className="text-[12.5px] text-muted-foreground">{usd0(dailyAvg)}/day</span>
            </div>
          </Card>

          {/* md+ */}
          <div className="mt-6 hidden grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-px overflow-hidden rounded-2xl border bg-border md:grid">
            <div className="bg-card px-5 py-[18px]">
              <div className="text-[12.5px] text-muted-foreground">Spent this month</div>
              <div className="tnum mt-1 text-[23px] font-semibold tracking-[-0.02em]">{usd0(total)}</div>
              <div className="mt-[3px]">
                <span className={cn("text-xs", momUp ? "text-brand-warm" : "text-brand-green")}>
                  {momUp ? "▲" : "▼"} {Math.abs(momDelta).toFixed(0)}% vs last month
                </span>
              </div>
            </div>
            <div className="bg-card px-5 py-[18px]">
              <div className="text-[12.5px] text-muted-foreground">Daily average</div>
              <div className="tnum mt-1 text-[23px] font-semibold tracking-[-0.02em]">{usd0(dailyAvg)}</div>
              <div className="mt-[3px] text-xs text-muted-foreground/70">over 18 days</div>
            </div>
            <div className="bg-card px-5 py-[18px]">
              <div className="text-[12.5px] text-muted-foreground">Biggest category</div>
              <div className="tnum mt-1 text-[23px] font-semibold tracking-[-0.02em]">{topCat ? topCat.name : "—"}</div>
              <div className="mt-[3px] text-xs text-muted-foreground/70">{topCat && total ? Math.round((topCat.spent / total) * 100) : 0}% of spend</div>
            </div>
          </div>
        </>
      )}

      {/* where your money goes */}
      <Card className="mt-[15px] p-[18px] md:mt-[18px] md:p-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2.5 md:mb-[18px]">
          <div className="font-serif text-[17px] font-medium md:text-[19px]">Where your money goes</div>
          <div className="hidden items-center gap-3 md:flex">
            <span className="text-[12.5px] text-muted-foreground">share of spend · vs last month</span>
            <button type="button" onClick={() => go("trends")} className="p-0 text-[12.5px] font-semibold text-primary">
              See full trends →
            </button>
          </div>
        </div>

        {s.categories.length > 0 ? (
          <div className="flex flex-col items-center gap-1.5 md:flex-row md:flex-wrap md:items-center md:gap-8">
            <div className="relative size-[170px] flex-none md:size-[188px]">
              <svg viewBox="0 0 188 188" className="size-[170px] -rotate-90 md:size-[188px]">
                <circle cx="94" cy="94" r="80" fill="none" stroke="var(--border)" strokeWidth="22" />
                {slices.map((sl, i) => (
                  <circle key={i} cx="94" cy="94" r="80" fill="none" stroke={sl.color} strokeWidth="22" strokeDasharray={sl.dash} strokeDashoffset={sl.offset} />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="tnum font-serif text-2xl font-semibold tracking-[-0.02em] md:text-[27px]">{usd0(total)}</span>
                <span className="mt-px text-[11px] text-muted-foreground/70 md:text-xs">this month</span>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3.5 md:min-w-[240px] md:flex-1 md:gap-4">
              {s.categories.map((c) => {
                const share = total ? Math.round((c.spent / total) * 100) : 0;
                const delta = c.spent - c.lastMonth;
                const changePct = c.lastMonth ? Math.round((Math.abs(delta) / c.lastMonth) * 100) : 0;
                // On phones the whole row taps through to the category modal; at md+ the
                // row is static with an inline Edit button (richer desktop affordance).
                return (
                  <div key={c.id}>
                    {/* The whole row is the tap target on phones; at md+ pointer events are
                        disabled so the inline Edit button (a nested <button>, invalid inside
                        a <button>) is the affordance. Using a div with role=button keeps the
                        markup valid and avoids the nested-button hydration error that broke
                        client-side navigation to this screen. */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => openModal({ kind: "category", categoryId: c.id })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openModal({ kind: "category", categoryId: c.id });
                        }
                      }}
                      className="block w-full cursor-pointer text-left md:pointer-events-none md:cursor-default"
                    >
                      <div className="mb-[7px] flex items-center justify-between">
                        <div className="flex min-w-0 items-center gap-2 md:gap-[9px]">
                          <span className="size-[9px] flex-none rounded-[3px]" style={{ background: c.color }} />
                          <span className="text-[13.5px] font-medium md:text-sm">{c.name}</span>
                          <span className="text-[11.5px] text-muted-foreground/70 md:text-xs">{share}%</span>
                        </div>
                        <div className="flex flex-none items-center gap-[9px] md:gap-2.5">
                          {delta > 0 ? (
                            <span className="text-[11px] font-semibold text-brand-warm md:text-[11.5px]">▲ {changePct}%</span>
                          ) : delta < 0 ? (
                            <span className="text-[11px] font-semibold text-brand-green md:text-[11.5px]">▼ {changePct}%</span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground/70 md:text-[11.5px]">—</span>
                          )}
                          <span className="tnum text-[13.5px] font-semibold md:w-16 md:text-right md:text-sm">{usd0(c.spent)}</span>
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal({ kind: "category", categoryId: c.id });
                            }}
                            title="Edit category"
                            className="hidden h-[34px] flex-none gap-1.5 rounded-[9px] border-foreground/15 bg-secondary px-[13px] text-[13px] font-semibold text-foreground/80 md:flex"
                          >
                            <Icon name="edit" size={14} strokeWidth={2} />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                    <ProgressBar pct={(c.spent / maxSpent) * 100} color={c.color} />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="px-4 pt-[30px] pb-1.5 text-center text-[13.5px] leading-normal text-muted-foreground">
            No categories yet. Add one to see where your spending goes.
          </div>
        )}

        <AddRowBtn onClick={() => openModal({ kind: "category" })}>Add a category</AddRowBtn>
      </Card>

      {/* transactions */}
      <Card className="mt-[15px] px-[18px] pt-4 pb-2.5 md:mt-[18px] md:px-6 md:pt-[22px]">
        <div className="flex flex-wrap items-center justify-between gap-2.5 md:gap-[18px]">
          <div className="font-serif text-[17px] font-medium md:text-[19px]">Transactions</div>
          {/* Desktop puts search inline in the header; export shows on both. */}
          <div className="flex flex-1 items-center justify-end gap-2.5">
            <div className="hidden min-w-[240px] max-w-[360px] flex-1 items-center gap-[9px] rounded-[11px] border bg-secondary px-[13px] md:flex">
              <Icon name="search" size={16} strokeWidth={2} style={{ flex: "none" }} className="text-muted-foreground/60" />
              <input
                value={txQuery}
                onChange={(e) => setTxQuery(e.target.value)}
                placeholder="Search merchant or category…"
                className="min-w-0 flex-1 border-none bg-transparent py-2.5 text-[13.5px] text-foreground outline-none"
              />
              {hasQuery && (
                <Button variant="ghost" size="icon" onClick={() => setTxQuery("")} className="size-[22px] flex-none rounded-full bg-border text-muted-foreground">
                  <Icon name="plus" size={12} style={{ transform: "rotate(45deg)" }} />
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={exportCsv}
              title="Export filtered transactions to CSV"
              className="h-auto flex-none gap-[5px] rounded-[9px] border-border bg-secondary px-[11px] py-1.5 text-xs font-semibold text-foreground/80 md:gap-1.5 md:rounded-[10px] md:border-foreground/15 md:px-[13px] md:py-[9px] md:text-[13px]"
            >
              <Icon name="download" size={13} strokeWidth={2} />
              Export
            </Button>
          </div>
        </div>

        {/* phone count line (desktop shows it on the chip row instead) */}
        <div className="mt-[3px] text-[11.5px] text-muted-foreground/70 md:hidden">
          {filtered.length} of {s.txns.length} transactions
        </div>

        {/* mobile search (desktop search lives inline in the header above) */}
        <div className="mt-[13px] flex items-center gap-[9px] rounded-xl border bg-secondary px-3 md:hidden">
          <Icon name="search" size={16} strokeWidth={2} style={{ flex: "none" }} className="text-muted-foreground/60" />
          <input
            value={txQuery}
            onChange={(e) => setTxQuery(e.target.value)}
            placeholder="Search merchant or category…"
            className="min-w-0 flex-1 border-none bg-transparent py-[11px] text-[13.5px] text-foreground outline-none"
          />
          {hasQuery && (
            <Button variant="ghost" size="icon" onClick={() => setTxQuery("")} className="size-[22px] flex-none rounded-full bg-border text-muted-foreground">
              <Icon name="plus" size={12} style={{ transform: "rotate(45deg)" }} />
            </Button>
          )}
        </div>

        {/* category chips — horizontal scroll on phones, wrap at md+ */}
        <div className="appscroll -mx-[18px] mt-3 mb-1 flex items-center gap-[7px] overflow-x-auto px-[18px] md:mx-0 md:mt-3.5 md:mb-0 md:flex-wrap md:overflow-visible md:px-0">
          {chips.map((c) => (
            <TogglePill key={c.id ?? "all"} active={catFilter === c.id} onClick={() => setCatFilter(c.id)}>
              {c.label}
            </TogglePill>
          ))}
          <span className="ml-auto hidden text-xs text-muted-foreground/70 md:inline">
            {filtered.length} of {s.txns.length}
          </span>
        </div>

        {/* timeframe — desktop only (presets + date range) */}
        <div className="mt-3 hidden flex-wrap items-center gap-2.5 border-t border-dashed pt-[13px] md:flex">
          <span className="text-xs font-semibold tracking-[0.02em] text-muted-foreground">TIMEFRAME</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESETS.map((p) => (
              <TogglePill key={p.id} active={preset === p.id} onClick={() => applyPreset(p)}>
                {p.label}
              </TogglePill>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-[7px]">
            <input
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPreset("");
              }}
              type="date"
              className="rounded-[9px] border bg-secondary px-2.5 py-[7px] text-[12.5px] text-foreground outline-none"
            />
            <span className="text-[13px] text-muted-foreground/70">–</span>
            <input
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPreset("");
              }}
              type="date"
              className="rounded-[9px] border bg-secondary px-2.5 py-[7px] text-[12.5px] text-foreground outline-none"
            />
          </div>
        </div>

        {/* transaction rows */}
        <div className="mt-1.5">
          {filtered.map((tx) => {
            const isIncome = tx.categoryId === null;
            const isSpend = !isIncome;
            const color = catColor(tx.categoryId);
            const initial = (tx.merchant.trim()[0] || "?").toUpperCase();
            return (
              <div key={tx.id} className="relative flex items-center gap-3 border-t border-border/60 py-[11px] first:border-t-0 md:gap-3.5 md:py-[13px]">
                {isSpend ? (
                  <button type="button" onClick={() => openModal({ kind: "txn", txnId: tx.id })} title="Edit transaction" className="flex-none">
                    <div className="flex size-9 items-center justify-center rounded-[11px] text-sm font-semibold text-white opacity-90 md:size-[38px] md:text-[15px]" style={{ background: color }}>
                      {initial}
                    </div>
                  </button>
                ) : (
                  <button type="button" onClick={() => openModal({ kind: "income", txnId: tx.id })} title="Edit income" className="flex-none">
                    <div className="flex size-9 items-center justify-center rounded-[11px] bg-brand-green/[0.14] text-brand-green md:size-[38px]">
                      <Icon name="arrowUp" size={18} strokeWidth={2.2} />
                    </div>
                  </button>
                )}
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => openModal(isSpend ? { kind: "txn", txnId: tx.id } : { kind: "income", txnId: tx.id })}
                    className="block text-left text-sm font-medium text-foreground md:text-[14.5px]"
                  >
                    {tx.merchant}
                  </button>
                  <div className="mt-[3px] flex items-center gap-[7px]">
                    {isSpend ? (
                      <button
                        type="button"
                        onClick={() => setQuickOpen(quickOpen === tx.id ? null : tx.id)}
                        title="Change category"
                        className="flex items-center gap-[5px] rounded-[7px] border bg-secondary py-0.5 pr-2 pl-[7px] text-[11px] text-muted-foreground md:text-xs"
                      >
                        <span className="size-[7px] rounded-[2px]" style={{ background: color }} />
                        {catName(tx.categoryId)}
                        <Icon name="chevronDown" size={11} strokeWidth={2.4} className="text-muted-foreground/60" />
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-[5px] rounded-[7px] bg-brand-green/10 px-[9px] py-0.5 text-[11.5px] font-semibold text-brand-green">
                        <Icon name="arrowUp" size={11} strokeWidth={2.6} />
                        Income
                      </span>
                    )}
                    <span className="text-[11.5px] text-muted-foreground/70 md:text-xs">· {shortDate(tx.date)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openModal(isSpend ? { kind: "txn", txnId: tx.id } : { kind: "income", txnId: tx.id })}
                  className="flex items-center gap-2 md:gap-2.5"
                >
                  <span className={cn("tnum text-sm font-semibold md:text-[14.5px]", isIncome ? "text-brand-green" : "text-foreground")}>
                    {isIncome ? `+${usd2(-tx.amount)}` : usd2(tx.amount)}
                  </span>
                  <Icon name="chevronRight" size={15} strokeWidth={2.2} style={{ flex: "none" }} className="text-muted-foreground/60" />
                </button>

                {quickOpen === tx.id && isSpend && (
                  <div className="absolute top-14 left-[49px] z-30 w-[210px] rounded-[13px] border bg-card p-2 shadow-[0_18px_40px_-14px_rgba(44,39,34,.45)] md:top-[62px] md:left-[52px] md:w-[230px] md:p-[9px]">
                    <div className="px-1.5 pt-[3px] pb-[7px] text-[10.5px] font-semibold tracking-[0.03em] text-muted-foreground md:text-[11px]">MOVE TO CATEGORY</div>
                    <div className="flex flex-col gap-px">
                      {s.categories.map((o) => {
                        const sel = o.id === tx.categoryId;
                        return (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => {
                              dispatch({ t: "setTxnCategory", id: tx.id, categoryId: o.id });
                              setQuickOpen(null);
                            }}
                            className="flex w-full items-center gap-[9px] rounded-lg px-[7px] py-2 text-left text-[13px] text-foreground/80 md:text-[13.5px]"
                          >
                            <span className="size-[9px] flex-none rounded-[3px]" style={{ background: o.color }} />
                            <span className="flex-1">{o.name}</span>
                            {sel && <Icon name="check" size={13} strokeWidth={2.6} className="text-brand-green" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {noMatch && (
            <div className="border-t border-border/60 px-4 pt-[30px] pb-[26px] text-center md:pt-[34px] md:pb-[30px]">
              <div className="text-[26px]">🔍</div>
              <div className="mt-2 text-[13.5px] leading-normal text-muted-foreground">No transactions match. Try a different search or filter.</div>
              <Button onClick={clearFilters} className="mt-3.5 h-auto rounded-[9px] bg-primary/10 px-[15px] py-2 text-[12.5px] font-semibold text-primary hover:bg-primary/20">
                Clear filters
              </Button>
            </div>
          )}

          {zero && (
            <div className="border-t border-border/60 px-[18px] pt-[34px] pb-[30px] text-center md:px-5 md:pt-10 md:pb-[34px]">
              <div className="mx-auto flex size-[46px] items-center justify-center rounded-[13px] bg-primary/10 text-primary md:size-12 md:rounded-[14px]">
                <Icon name="card" size={22} strokeWidth={1.8} />
              </div>
              <div className="mt-3 font-serif text-[17px] font-medium md:mt-3.5 md:text-lg">No transactions yet</div>
              <div className="mx-auto mt-[5px] max-w-[340px] text-[13px] leading-normal text-muted-foreground md:text-[13.5px]">
                Link an account to sync automatically, or add one by hand to start tracking where your money goes.
              </div>
              <Button onClick={() => openModal({ kind: "txn" })} className="mt-3.5 h-auto rounded-[10px] px-4 py-2.5 text-[13px] font-semibold md:mt-4 md:px-[18px]">
                + Add a transaction
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* spending plan strategy card */}
      <Card className="mt-[15px] border-primary/[0.18] p-[18px] md:mt-[18px] md:p-6">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2.5 md:mb-0 md:gap-3.5">
          <div className="flex min-w-0 items-center gap-[9px] md:gap-3">
            <div className="flex size-7 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-primary to-brand-accent-soft md:size-[38px] md:rounded-[11px]">
              <Sparkle size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold tracking-[0.04em] text-primary uppercase md:text-[11px]">
                <span className="md:hidden">Spending plan · advisor</span>
                <span className="hidden md:inline">Spending plan · set by your advisor</span>
              </div>
              <div className="mt-px font-serif text-[18px] font-medium tracking-[-0.01em] md:text-[23px]">{spend.name}</div>
            </div>
          </div>
          <Button onClick={() => go("advisor")} className="h-auto flex-none rounded-[9px] bg-primary/[0.12] px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20 md:rounded-[10px] md:px-[15px] md:py-[9px] md:text-[13px]">
            <span className="md:hidden">Adjust →</span>
            <span className="hidden md:inline">Adjust with advisor →</span>
          </Button>
        </div>
        <div className="mb-[13px] mt-0 max-w-[640px] text-[13px] leading-relaxed text-muted-foreground md:mt-3.5 md:text-sm">{spend.desc}</div>
        <div className="mb-2.5 hidden text-[11.5px] font-semibold tracking-[0.02em] text-muted-foreground md:mt-5 md:block">NOTES</div>
        <div className="flex flex-col gap-[9px] md:gap-2.5">
          {spend.notes.map((n) => {
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
                      onClick={() => dispatch({ t: "deleteStratNote", which: "spend", id: n.id })}
                      title="Delete note"
                      className="size-[22px] rounded-md text-muted-foreground/60 hover:bg-transparent md:size-6"
                    >
                      <Icon name="plus" size={12} style={{ transform: "rotate(45deg)" }} />
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
