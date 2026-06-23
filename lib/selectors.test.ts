import { describe, it, expect } from "vitest";
import {
  donut,
  totalSpend,
  lastMonthSpend,
  totalDebt,
  originalDebt,
  totalSaved,
  netWorth,
  assets,
  owed,
  monthlyIncome,
  freeCashFlow,
  savingsRate,
} from "./selectors";
import { makeSeed } from "./seed";
import type { State, Category } from "./types";

const CIRC = 2 * Math.PI * 80;

// Build a State by overriding only the slices a test cares about.
const state = (patch: Partial<State>): State => ({ ...makeSeed(), ...patch });

const cat = (spent: number, lastMonth = 0): Category => ({
  id: `c${spent}-${lastMonth}`,
  name: "x",
  color: "#000",
  spent,
  lastMonth,
});

describe("donut", () => {
  it("sums spent into total", () => {
    const { total } = donut([cat(30), cat(70)]);
    expect(total).toBe(100);
  });

  it("emits one slice per category with proportional dash lengths", () => {
    const { slices } = donut([cat(25), cat(75)]);
    expect(slices).toHaveLength(2);
    // first slice covers a quarter of the circumference
    expect(slices[0].dash).toBe(`${0.25 * CIRC} ${CIRC - 0.25 * CIRC}`);
    expect(slices[0].offset).toBe("0");
    // second slice is offset by the first slice's length
    expect(slices[1].offset).toBe(`${-(0.25 * CIRC)}`);
  });

  it("carries through each category color", () => {
    const c = { ...cat(10), color: "#abcdef" };
    expect(donut([c]).slices[0].color).toBe("#abcdef");
  });

  it("avoids divide-by-zero for all-zero spend (total falls back to 1)", () => {
    const { total, slices } = donut([cat(0), cat(0)]);
    expect(total).toBe(1);
    expect(slices[0].dash).toBe(`0 ${CIRC}`);
  });

  it("returns no slices for an empty list", () => {
    expect(donut([]).slices).toEqual([]);
  });
});

describe("spend totals", () => {
  it("sums current and last-month category spend", () => {
    const s = state({ categories: [cat(100, 80), cat(50, 60)] });
    expect(totalSpend(s)).toBe(150);
    expect(lastMonthSpend(s)).toBe(140);
  });
});

describe("debt totals", () => {
  const s = makeSeed();
  it("sums current balances", () => {
    expect(totalDebt(s)).toBe(s.debts.reduce((a, d) => a + d.balance, 0));
    expect(totalDebt(s)).toBe(23030);
  });
  it("sums original balances", () => {
    expect(originalDebt(s)).toBe(34000);
  });
});

describe("totalSaved", () => {
  it("sums saved across funds", () => {
    expect(totalSaved(makeSeed())).toBe(9730);
  });
});

describe("net worth", () => {
  const s = state({
    accounts: [
      { id: "a1", name: "Checking", inst: "X", mask: "1", type: "Checking", balance: 1000, color: "#000", synced: true, syncLabel: "" },
      { id: "a2", name: "Savings", inst: "X", mask: "2", type: "Savings", balance: 500, color: "#000", synced: true, syncLabel: "" },
      { id: "a3", name: "Card", inst: "X", mask: "3", type: "Credit", balance: -300, color: "#000", synced: true, syncLabel: "" },
    ],
  });

  it("nets all balances", () => {
    expect(netWorth(s)).toBe(1200);
  });

  it("splits assets (positive) from owed (negative)", () => {
    expect(assets(s)).toBe(1500);
    expect(owed(s)).toBe(-300);
  });
});

describe("income & cash flow", () => {
  it("treats negative txn amounts as income", () => {
    const s = state({
      txns: [
        { id: "t1", merchant: "Job", amount: -4000, date: "2026-06-01", categoryId: null },
        { id: "t2", merchant: "Store", amount: 25, date: "2026-06-02", categoryId: "c1" },
      ],
      categories: [cat(25)],
    });
    expect(monthlyIncome(s)).toBe(4000);
    expect(freeCashFlow(s)).toBe(4000 - 25);
  });
});

describe("savingsRate", () => {
  it("computes a rough share of income as a rounded percentage", () => {
    const s = state({
      funds: [{ id: "g1", name: "f", emoji: "x", kind: "Open", target: null, saved: 1200, date: null, color: "#000" }],
      txns: [{ id: "t1", merchant: "Job", amount: -1000, date: "2026-06-01", categoryId: null }],
    });
    // (1200 / 12 / 1000) * 100 = 10
    expect(savingsRate(s)).toBe(10);
  });

  it("does not divide by zero when there is no income", () => {
    const s = state({
      funds: [{ id: "g1", name: "f", emoji: "x", kind: "Open", target: null, saved: 1200, date: null, color: "#000" }],
      txns: [],
    });
    // income falls back to 1: (1200 / 12 / 1) * 100 = 10000
    expect(savingsRate(s)).toBe(10000);
  });
});
