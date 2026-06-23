import { describe, it, expect, vi } from "vitest";

// The store module is "use client" and imports browser-oriented deps at the top.
// The reducer itself uses none of them, so stub them out to keep this a pure test.
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: vi.fn() }));

import { reducer } from "./store";
import { makeSeed } from "./seed";
import type { Category, Payment, Contribution } from "./types";

describe("reducer — categories", () => {
  it("upserts a new category", () => {
    const s = makeSeed();
    const v: Category = { id: "cNew", name: "Pets", color: "#111", spent: 40, lastMonth: 0 };
    const next = reducer(s, { t: "upsertCategory", v });
    expect(next.categories).toHaveLength(s.categories.length + 1);
    expect(next.categories.at(-1)).toEqual(v);
  });

  it("updates an existing category in place without growing the list", () => {
    const s = makeSeed();
    const updated: Category = { ...s.categories[0], spent: 999 };
    const next = reducer(s, { t: "upsertCategory", v: updated });
    expect(next.categories).toHaveLength(s.categories.length);
    expect(next.categories[0].spent).toBe(999);
  });

  it("deleting a category orphans its transactions to null", () => {
    const s = makeSeed();
    const next = reducer(s, { t: "deleteCategory", id: "c1" });
    expect(next.categories.find((c) => c.id === "c1")).toBeUndefined();
    const formerlyC1 = s.txns.filter((t) => t.categoryId === "c1");
    expect(formerlyC1.length).toBeGreaterThan(0);
    for (const t of formerlyC1) {
      expect(next.txns.find((x) => x.id === t.id)?.categoryId).toBeNull();
    }
  });

  it("does not mutate the input state", () => {
    const s = makeSeed();
    const before = s.categories.length;
    reducer(s, { t: "deleteCategory", id: "c1" });
    expect(s.categories.length).toBe(before);
  });
});

describe("reducer — transactions", () => {
  it("reassigns a transaction's category", () => {
    const s = makeSeed();
    const next = reducer(s, { t: "setTxnCategory", id: "t1", categoryId: "c3" });
    expect(next.txns.find((t) => t.id === "t1")?.categoryId).toBe("c3");
  });

  it("deletes a transaction", () => {
    const s = makeSeed();
    const next = reducer(s, { t: "deleteTxn", id: "t1" });
    expect(next.txns.find((t) => t.id === "t1")).toBeUndefined();
  });
});

describe("reducer — payments adjust debt balances", () => {
  it("adding a payment reduces the linked debt balance and prepends the payment", () => {
    const s = makeSeed();
    const debtBefore = s.debts.find((d) => d.id === "d1")!.balance;
    const v: Payment = { id: "pNew", debtId: "d1", amount: 100, date: "2026-06-20" };
    const next = reducer(s, { t: "addPayment", v });
    expect(next.payments[0]).toEqual(v);
    expect(next.debts.find((d) => d.id === "d1")!.balance).toBe(debtBefore - 100);
  });

  it("a payment never drives a balance below zero", () => {
    const s = makeSeed();
    const v: Payment = { id: "pBig", debtId: "d2", amount: 999999, date: "2026-06-20" };
    const next = reducer(s, { t: "addPayment", v });
    expect(next.debts.find((d) => d.id === "d2")!.balance).toBe(0);
  });

  it("deleting a payment restores the balance it had reduced", () => {
    const s = makeSeed();
    const afterAdd = reducer(s, {
      t: "addPayment",
      v: { id: "pNew", debtId: "d1", amount: 100, date: "2026-06-20" },
    });
    const restored = reducer(afterAdd, { t: "deletePayment", id: "pNew" });
    const original = s.debts.find((d) => d.id === "d1")!.balance;
    expect(restored.debts.find((d) => d.id === "d1")!.balance).toBe(original);
    expect(restored.payments.find((p) => p.id === "pNew")).toBeUndefined();
  });

  it("deleting a debt also removes its payments", () => {
    const s = makeSeed();
    const next = reducer(s, { t: "deleteDebt", id: "d1" });
    expect(next.debts.find((d) => d.id === "d1")).toBeUndefined();
    expect(next.payments.some((p) => p.debtId === "d1")).toBe(false);
  });
});

describe("reducer — debt ordering", () => {
  it("reorders debts by the given id order", () => {
    const s = makeSeed();
    const next = reducer(s, { t: "reorderDebts", order: ["d3", "d1"] });
    expect(next.debts.find((d) => d.id === "d3")!.order).toBe(1);
    expect(next.debts.find((d) => d.id === "d1")!.order).toBe(2);
    // unlisted debts keep their prior order
    expect(next.debts.find((d) => d.id === "d2")!.order).toBe(
      s.debts.find((d) => d.id === "d2")!.order
    );
  });
});

describe("reducer — funds & contributions", () => {
  it("adding a contribution increases the fund's saved total", () => {
    const s = makeSeed();
    const savedBefore = s.funds.find((g) => g.id === "g1")!.saved;
    const v: Contribution = { id: "coNew", fundId: "g1", amount: 200, date: "2026-06-20" };
    const next = reducer(s, { t: "addContribution", v });
    expect(next.contributions[0]).toEqual(v);
    expect(next.funds.find((g) => g.id === "g1")!.saved).toBe(savedBefore + 200);
  });

  it("deleting a fund cascades to its contributions", () => {
    const s = makeSeed();
    const next = reducer(s, { t: "deleteFund", id: "g1" });
    expect(next.funds.find((g) => g.id === "g1")).toBeUndefined();
    expect(next.contributions.some((c) => c.fundId === "g1")).toBe(false);
  });
});

describe("reducer — bills", () => {
  it("toggles a bill's paid flag", () => {
    const s = makeSeed();
    const before = s.bills.find((b) => b.id === "b2")!.paid;
    const next = reducer(s, { t: "toggleBill", id: "b2" });
    expect(next.bills.find((b) => b.id === "b2")!.paid).toBe(!before);
  });
});

describe("reducer — strategy notes", () => {
  it("appends a note authored by 'you'", () => {
    const s = makeSeed();
    const before = s.debtStrategy.notes.length;
    const next = reducer(s, { t: "addStratNote", which: "debt", text: "Pay the Visa first" });
    expect(next.debtStrategy.notes).toHaveLength(before + 1);
    const added = next.debtStrategy.notes.at(-1)!;
    expect(added.text).toBe("Pay the Visa first");
    expect(added.by).toBe("you");
  });

  it("deletes a note by id", () => {
    const s = makeSeed();
    const id = s.debtStrategy.notes[0].id;
    const next = reducer(s, { t: "deleteStratNote", which: "debt", id });
    expect(next.debtStrategy.notes.some((n) => n.id === id)).toBe(false);
  });
});

describe("reducer — fund catalog selection", () => {
  it("toggles a catalog id on and off", () => {
    const s = makeSeed();
    const removed = reducer(s, { t: "toggleCatalog", id: "vacation" });
    expect(removed.selectedFundCatalog).not.toContain("vacation");
    const readded = reducer(removed, { t: "toggleCatalog", id: "vacation" });
    expect(readded.selectedFundCatalog).toContain("vacation");
  });
});

describe("reducer — unknown action", () => {
  it("returns the same state reference for an unhandled action", () => {
    const s = makeSeed();
    // @ts-expect-error exercising the default branch with an invalid action
    expect(reducer(s, { t: "nope" })).toBe(s);
  });
});
