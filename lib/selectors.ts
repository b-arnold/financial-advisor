// Derived view-models for the command center. Pure functions over State so screens
// stay declarative. Covers the donut math, debt payoff projection, net-worth /
// savings-rate series, cash-flow bars and the headline KPIs.
import type { State, Category } from "./types";
import { usd0 } from "./format";

const CIRC = 2 * Math.PI * 80; // donut radius 80

export type DonutSlice = { color: string; dash: string; offset: string };

export function donut(cats: Category[]) {
  const total = cats.reduce((a, c) => a + c.spent, 0) || 1;
  let acc = 0;
  const slices: DonutSlice[] = cats.map((c) => {
    const frac = c.spent / total;
    const len = frac * CIRC;
    const dash = `${len} ${CIRC - len}`;
    const offset = `${-acc}`;
    acc += len;
    return { color: c.color, dash, offset };
  });
  return { slices, total };
}

export const totalSpend = (s: State) => s.categories.reduce((a, c) => a + c.spent, 0);
export const lastMonthSpend = (s: State) => s.categories.reduce((a, c) => a + c.lastMonth, 0);

export const totalDebt = (s: State) => s.debts.reduce((a, d) => a + d.balance, 0);
export const originalDebt = (s: State) => s.debts.reduce((a, d) => a + d.original, 0);

export const totalSaved = (s: State) => s.funds.reduce((a, g) => a + g.saved, 0);

export function netWorth(s: State) {
  return s.accounts.reduce((a, x) => a + x.balance, 0);
}
export const assets = (s: State) => s.accounts.filter((a) => a.balance > 0).reduce((x, a) => x + a.balance, 0);
export const owed = (s: State) => s.accounts.filter((a) => a.balance < 0).reduce((x, a) => x + a.balance, 0);

export const monthlyIncome = (s: State) =>
  s.txns.filter((t) => t.amount < 0).reduce((a, t) => a + -t.amount, 0);

export const freeCashFlow = (s: State) => monthlyIncome(s) - totalSpend(s);

export const savingsRate = (s: State) => {
  const inc = monthlyIncome(s) || 1;
  return Math.round((totalSaved(s) / 12 / inc) * 100); // rough share of income
};

// ---- debt payoff projection --------------------------------------------------
// History (last 6 months, declining) + projection to zero at $1,180/mo.
export function debtSeries(s: State) {
  const now = totalDebt(s);
  const pace = 1180;
  // synthesize a plausible 6-month history ending at `now`
  const hist = Array.from({ length: 6 }, (_, i) => now + pace * (5 - i));
  // project forward until zero
  const proj: number[] = [now];
  let bal = now;
  let months = 0;
  while (bal > 0 && months < 60) {
    bal = Math.max(0, bal - pace);
    proj.push(bal);
    months++;
  }
  const maxV = hist[0];
  const totalPts = hist.length + proj.length - 1;
  const x = (i: number) => (i / (totalPts - 1)) * 300;
  const y = (v: number) => 84 - (v / maxV) * 80;

  const histPts = hist.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const projStart = hist.length - 1;
  const projPts = proj.map((v, i) => `${x(projStart + i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const zeroIdx = projStart + (proj.length - 1);
  const debtZeroX = x(zeroIdx).toFixed(1);
  const debtZeroY = y(0).toFixed(1);
  const debtNowLeft = `${((projStart / (totalPts - 1)) * 100).toFixed(1)}%`;

  // eta date label
  const etaMonths = months;
  const etaDate = new Date(2026, 5 + etaMonths, 1); // base June 2026
  const eta = `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][etaDate.getMonth()]} ${etaDate.getFullYear()}`;

  return { now, histPts, projPts, debtZeroX, debtZeroY, debtNowLeft, eta };
}

// ---- net worth series (6 pts, rising) ---------------------------------------
export function nwSeries(s: State) {
  const nw = netWorth(s);
  const pts = Array.from({ length: 6 }, (_, i) => nw - 900 * (5 - i));
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const span = max - min || 1;
  const x = (i: number) => (i / (pts.length - 1)) * 300;
  const y = (v: number) => 56 - ((v - min) / span) * 50;
  const line = pts.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `0,60 ${line} 300,60`;
  return {
    nw,
    line,
    area,
    dotX: x(pts.length - 1).toFixed(1),
    dotY: y(pts[pts.length - 1]).toFixed(1),
    mom: usd0(900),
    six: usd0(4500),
    first: "Jan",
    last: "Jun",
  };
}

// ---- savings-rate series -----------------------------------------------------
export function savSeries(s: State) {
  const rate = savingsRate(s);
  const pts = [rate - 6, rate - 4, rate - 5, rate - 2, rate - 1, rate];
  const max = Math.max(...pts) + 2;
  const min = Math.max(0, Math.min(...pts) - 2);
  const span = max - min || 1;
  const x = (i: number) => (i / (pts.length - 1)) * 300;
  const y = (v: number) => 84 - ((v - min) / span) * 76;
  const line = pts.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `0,92 ${line} 300,92`;
  return {
    rate,
    line,
    area,
    dotX: x(pts.length - 1).toFixed(1),
    dotY: y(pts[pts.length - 1]).toFixed(1),
    delta: "+4 pts",
    first: "Jan",
    last: "Jun",
  };
}

// ---- cash flow bars ----------------------------------------------------------
export function cashflow(s: State) {
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const rows = labels.map((label, i) => {
    const inc = 4500 + i * 60;
    const out = 3900 + ((i * 37) % 320);
    return { label, inc, out };
  });
  const max = Math.max(...rows.flatMap((r) => [r.inc, r.out]));
  const avgNet = rows.reduce((a, r) => a + (r.inc - r.out), 0) / rows.length;
  return {
    rows: rows.map((r) => ({
      label: r.label,
      inH: `${(r.inc / max) * 100}%`,
      outH: `${(r.out / max) * 100}%`,
    })),
    avgNet: usd0(avgNet),
  };
}

// ---- funds savings bars ------------------------------------------------------
export function fundsBars(s: State) {
  const saved = totalSaved(s);
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Now"];
  const vals = labels.map((_, i) => Math.round((saved * (i + 2)) / (labels.length + 1)));
  vals[vals.length - 1] = saved;
  const max = Math.max(...vals) || 1;
  return labels.map((label, i) => ({
    label,
    now: i === labels.length - 1,
    valueLabel: usd0(vals[i]),
    heightPct: `${Math.max(6, (vals[i] / max) * 100)}%`,
  }));
}
