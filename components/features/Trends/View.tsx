"use client";
// TRENDS screen — net worth, cash flow, debt payoff path, savings rate and a
// spending-by-category donut. Range toggle is presentational (labels only). The charts
// stay as inline SVGs (geometry computed in selectors); their stroke/fill colors use the
// brand palette literals, and surfaces/text use theme tokens via Tailwind.
import { useState } from "react";
import { useStore } from "@/lib/store";
import { nwSeries, savSeries, cashflow, debtSeries, donut } from "@/lib/selectors";
import { usd0 } from "@/lib/format";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import { Card, ProgressBar } from "@/components/composed";
import { Button } from "@/components/ui/button";

type Range = "3M" | "6M" | "1Y" | "custom";

const RANGE_OPTIONS: { key: Range; label: string }[] = [
  { key: "3M", label: "3M" },
  { key: "6M", label: "6M" },
  { key: "1Y", label: "1Y" },
  { key: "custom", label: "Custom" },
];

const RANGE_LABEL: Record<Range, string> = {
  "3M": "last 3 months",
  "6M": "last 6 months",
  "1Y": "last year",
  custom: "selected range",
};

export default function Trends() {
  const { s, openModal, go } = useStore();

  const [range, setRange] = useState<Range>("6M");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const rangeLabel = RANGE_LABEL[range];
  const customActive = range === "custom";

  const nw = nwSeries(s);
  const sav = savSeries(s);
  const cf = cashflow(s);
  const ds = debtSeries(s);
  const don = donut(s.categories);

  const hasData = s.accounts.length > 0;
  const spendTotal = don.total;
  const spendSub = "this month";

  const dateStr = "Sunday, June 21";

  return (
    <div>
      <div className="text-[13px] tracking-[0.02em] text-muted-foreground">{dateStr}</div>
      <div className="flex flex-wrap items-center justify-between gap-3.5">
        <h1 className="mt-1.5 font-serif text-[34px] font-normal leading-[1.1] tracking-[-0.02em]">Trends</h1>
        <div className="flex items-center gap-[3px] rounded-[11px] border bg-secondary p-[3px]">
          {RANGE_OPTIONS.map((o) => {
            const active = range === o.key;
            return (
              <button
                key={o.key}
                type="button"
                onClick={() => setRange(o.key)}
                className={cn(
                  "rounded-lg px-[15px] py-[7px] text-[12.5px] transition-colors",
                  active ? "bg-card font-semibold text-foreground shadow-sm" : "font-medium text-muted-foreground"
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      {customActive && (
        <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
          <span className="text-[12.5px] font-semibold tracking-[0.02em] text-muted-foreground">FROM</span>
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            type="date"
            className="rounded-[9px] border bg-card px-[11px] py-2 text-[13.5px] text-foreground outline-none"
          />
          <span className="text-[12.5px] font-semibold tracking-[0.02em] text-muted-foreground">TO</span>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            type="date"
            className="rounded-[9px] border bg-card px-[11px] py-2 text-[13.5px] text-foreground outline-none"
          />
        </div>
      )}

      <p className="mt-[9px] max-w-[560px] text-[15.5px] leading-normal text-muted-foreground">
        {hasData
          ? `How your money has moved over the ${rangeLabel} — and where it's heading.`
          : "Your history, charted — net worth, cash flow and savings rate over time."}
      </p>

      {!hasData && (
        <Card className="mt-[26px] px-10 py-[52px] text-center">
          <div className="mx-auto flex size-[52px] items-center justify-center rounded-[15px] bg-brand-green/[0.12] text-brand-green">
            <Icon name="chart" size={26} strokeWidth={1.9} />
          </div>
          <h2 className="mt-[18px] font-serif text-2xl font-medium">Your trends will appear here</h2>
          <p className="mx-auto mt-2 max-w-[420px] text-[14.5px] leading-relaxed text-muted-foreground text-pretty">
            Connect an account and I&apos;ll chart your net worth, cash flow and savings rate as each month rolls in.
          </p>
          <Button
            onClick={() => openModal({ kind: "connect" })}
            className="mt-5 inline-flex h-auto gap-[7px] rounded-[10px] px-[18px] py-[11px] text-sm font-semibold"
          >
            <Icon name="plus" size={16} strokeWidth={2.4} />
            Connect an account
          </Button>
        </Card>
      )}

      {hasData && (
        <div>
          {/* net worth */}
          <Card className="mt-[26px] px-[30px] py-[26px]">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="text-[13px] tracking-[0.02em] text-muted-foreground">Net worth</div>
                <div className="tnum mt-[3px] font-serif text-[46px] font-medium leading-none tracking-[-0.02em]">{usd0(nw.nw)}</div>
                <div className="mt-[11px] flex items-center gap-2">
                  <span className="flex items-center gap-[5px] text-[13.5px] font-semibold text-brand-green">
                    <Icon name="arrowUpRight" size={13} strokeWidth={2.4} />
                    {nw.mom} this month
                  </span>
                  <span className="text-[12.5px] text-muted-foreground/70">· {nw.six} since {nw.first}</span>
                </div>
              </div>
              <div className="min-w-[220px] max-w-[360px] flex-1">
                <svg viewBox="0 0 300 60" preserveAspectRatio="none" className="block h-[60px] w-full overflow-visible">
                  <defs>
                    <linearGradient id="nwgradtrends" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="rgba(47,143,107,.22)" />
                      <stop offset="1" stopColor="rgba(47,143,107,0)" />
                    </linearGradient>
                  </defs>
                  <polygon points={nw.area} fill="url(#nwgradtrends)" />
                  <polyline points={nw.line} fill="none" stroke="#2f8f6b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                  <circle cx={nw.dotX} cy={nw.dotY} r="3.4" fill="#2f8f6b" stroke="var(--secondary)" strokeWidth="2" />
                </svg>
                <div className="mt-[5px] flex justify-between text-[10.5px] text-muted-foreground/60">
                  <span>{nw.first}</span>
                  <span>{nw.last}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* cash flow */}
          <Card className="mt-[26px] p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="font-serif text-[19px] font-medium">Cash flow</div>
                <div className="mt-[3px] text-[13px] text-muted-foreground">Money in vs. out, by month</div>
              </div>
              <div className="flex items-center gap-[22px]">
                <div className="flex items-center gap-4 text-[12.5px] text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-[3px] bg-brand-green" />In</span>
                  <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-[3px] bg-brand-warm" />Out</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Avg. surplus</div>
                  <div className="tnum text-[19px] font-semibold text-brand-green">{cf.avgNet}/mo</div>
                </div>
              </div>
            </div>
            <div className="mt-[22px] flex items-end gap-[18px]">
              {cf.rows.map((r) => (
                <div key={r.label} className="flex flex-1 flex-col items-center gap-[9px]">
                  <div className="flex h-[172px] w-full items-end justify-center gap-[7px]">
                    <div className="w-[34%] max-w-[30px] rounded-t-[5px] bg-brand-green" style={{ height: r.inH }} />
                    <div className="w-[34%] max-w-[30px] rounded-t-[5px] bg-brand-warm" style={{ height: r.outH }} />
                  </div>
                  <div className="text-[12.5px] text-muted-foreground">{r.label}</div>
                </div>
              ))}
            </div>
          </Card>

          <div className="mt-5 grid grid-cols-2 items-start gap-5">
            {/* debt payoff path */}
            <Card className="p-6">
              <div className="font-serif text-[19px] font-medium">Debt payoff path</div>
              <div className="mt-[3px] text-[13px] text-muted-foreground">At your current pace of $1,180/mo</div>
              <div className="mt-[18px] flex items-end gap-1.5">
                <span className="tnum font-serif text-[32px] font-medium tracking-[-0.02em]">{usd0(ds.now)}</span>
                <span className="pb-1.5 text-[13.5px] text-muted-foreground">left today</span>
              </div>
              <div className="mt-4">
                <svg viewBox="0 0 300 92" preserveAspectRatio="none" className="block h-[118px] w-full overflow-visible">
                  <line x1="0" y1="84" x2="300" y2="84" stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                  <polyline points={ds.histPts} fill="none" stroke="#c2705a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                  <polyline points={ds.projPts} fill="none" stroke="#6d5bd0" strokeWidth="2.2" strokeDasharray="4 5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                  <circle cx={ds.debtZeroX} cy={ds.debtZeroY} r="4" fill="#6d5bd0" stroke="var(--card)" strokeWidth="2" />
                </svg>
                <div className="relative mt-[9px] h-4">
                  <span className="absolute -translate-x-1/2 text-[11.5px] text-muted-foreground" style={{ left: ds.debtNowLeft }}>Now</span>
                  <span className="absolute right-0 text-[11.5px] font-semibold text-primary">{ds.eta}</span>
                </div>
              </div>
              <div className="mt-3.5 flex items-center gap-2 rounded-[11px] border border-primary/[0.16] bg-primary/[0.08] px-3.5 py-[11px]">
                <div className="size-2 flex-none rounded-full bg-primary" />
                <div className="text-[13.5px] text-foreground/80">Debt-free by <strong>{ds.eta}</strong> if you hold the line.</div>
              </div>
            </Card>

            {/* savings rate */}
            <Card className="p-6">
              <div className="font-serif text-[19px] font-medium">Savings rate</div>
              <div className="mt-[3px] text-[13px] text-muted-foreground">Share of income you keep</div>
              <div className="mt-[18px] flex items-end gap-2.5">
                <span className="tnum font-serif text-[32px] font-medium tracking-[-0.02em]">{sav.rate}%</span>
                <span className="flex items-center gap-1 pb-1.5 text-[13px] font-semibold text-brand-green">
                  <Icon name="arrowUpRight" size={13} strokeWidth={2.4} />
                  {sav.delta}
                </span>
              </div>
              <div className="mt-4">
                <svg viewBox="0 0 300 92" preserveAspectRatio="none" className="block h-[118px] w-full overflow-visible">
                  <defs>
                    <linearGradient id="savgrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="rgba(47,143,107,.22)" />
                      <stop offset="1" stopColor="rgba(47,143,107,0)" />
                    </linearGradient>
                  </defs>
                  <polygon points={sav.area} fill="url(#savgrad)" />
                  <polyline points={sav.line} fill="none" stroke="#2f8f6b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                  <circle cx={sav.dotX} cy={sav.dotY} r="4" fill="#2f8f6b" stroke="var(--card)" strokeWidth="2" />
                </svg>
                <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground/60">
                  <span>{sav.first}</span>
                  <span>{sav.last}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* spending by category */}
          <Card className="mt-5 p-6">
            <div className="flex flex-wrap items-end justify-between gap-2.5">
              <div>
                <div className="font-serif text-[19px] font-medium">Where it goes</div>
                <div className="mt-[3px] text-[13px] text-muted-foreground">Spending by category · {spendSub}</div>
              </div>
              <Button
                onClick={() => go("spending")}
                className="h-auto rounded-[9px] bg-primary/[0.08] px-3.5 py-2 text-[13px] font-semibold text-primary hover:bg-primary/[0.14]"
              >
                View transactions
              </Button>
            </div>
            <div className="mt-[22px] flex flex-wrap items-center gap-8">
              <div className="relative mx-auto size-[188px] flex-none">
                <svg viewBox="0 0 188 188" className="size-[188px] -rotate-90">
                  <circle cx="94" cy="94" r="80" fill="none" stroke="var(--border)" strokeWidth="22" />
                  {don.slices.map((sl, i) => (
                    <circle key={i} cx="94" cy="94" r="80" fill="none" stroke={sl.color} strokeWidth="22" strokeDasharray={sl.dash} strokeDashoffset={sl.offset} />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="tnum font-serif text-[25px] font-semibold tracking-[-0.02em]">{usd0(spendTotal)}</span>
                  <span className="mt-0.5 text-xs text-muted-foreground">{spendSub}</span>
                </div>
              </div>
              <div className="flex min-w-[240px] flex-1 flex-col gap-[15px]">
                {s.categories.map((c) => {
                  const share = spendTotal > 0 ? (c.spent / spendTotal) * 100 : 0;
                  return (
                    <div key={c.id}>
                      <div className="mb-[7px] flex items-center justify-between">
                        <div className="flex items-center gap-[9px]">
                          <span className="size-[9px] rounded-[3px]" style={{ background: c.color }} />
                          <span className="text-sm font-medium">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="tnum text-[13.5px] text-muted-foreground">{share.toFixed(0)}%</span>
                          <span className="tnum text-sm font-semibold">{usd0(c.spent)}</span>
                        </div>
                      </div>
                      <ProgressBar pct={share} color={c.color} />
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
