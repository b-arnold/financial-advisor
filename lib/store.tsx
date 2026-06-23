"use client";
// Central store for the command center. Holds all domain state, the theme, the open
// modal, and exposes typed actions + a toast. The active *screen* is not stored here —
// it's derived from the URL (App Router), so go()/goMobile() navigate routes and the
// shell reads the pathname; the viewport is read live via useIsMobile. Everything stays
// client provider because the design is a single in-app shell.
import React, { createContext, useContext, useMemo, useReducer, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast as sonnerToast } from "sonner";
import { pathForScreen, pathForMobileTab } from "./routes";
import type {
  State,
  ScreenId,
  MobileTab,
  Category,
  Txn,
  Debt,
  Payment,
  Fund,
  Contribution,
  Bill,
  Account,
  Member,
  ChatMessage,
} from "./types";
import type { ThemeMode } from "./theme";
import { makeSeed } from "./seed";

let _id = 1000;
const uid = (p: string) => `${p}${_id++}`;

// ---- modal descriptors -------------------------------------------------------
export type Modal =
  | { kind: "none" }
  | { kind: "fund"; fundId?: string }
  | { kind: "txn"; txnId?: string }
  | { kind: "debt"; debtId?: string }
  | { kind: "category"; categoryId?: string }
  | { kind: "income"; txnId?: string }
  | { kind: "payment"; paymentId?: string }
  | { kind: "contribution"; contributionId?: string }
  | { kind: "accounts" }
  | { kind: "connect" }
  | { kind: "account"; accountId?: string }
  | { kind: "profile" }
  | { kind: "member"; memberId?: string };

// ---- reducer -----------------------------------------------------------------
export type Action =
  | { t: "set"; patch: Partial<State> }
  | { t: "upsertCategory"; v: Category }
  | { t: "deleteCategory"; id: string }
  | { t: "upsertTxn"; v: Txn }
  | { t: "deleteTxn"; id: string }
  | { t: "setTxnCategory"; id: string; categoryId: string }
  | { t: "upsertDebt"; v: Debt }
  | { t: "deleteDebt"; id: string }
  | { t: "reorderDebts"; order: string[] }
  | { t: "addPayment"; v: Payment }
  | { t: "updatePayment"; v: Payment }
  | { t: "deletePayment"; id: string }
  | { t: "upsertFund"; v: Fund }
  | { t: "deleteFund"; id: string }
  | { t: "addContribution"; v: Contribution }
  | { t: "updateContribution"; v: Contribution }
  | { t: "deleteContribution"; id: string }
  | { t: "toggleBill"; id: string }
  | { t: "upsertAccount"; v: Account }
  | { t: "deleteAccount"; id: string }
  | { t: "upsertMember"; v: Member }
  | { t: "deleteMember"; id: string }
  | { t: "addMessage"; v: ChatMessage }
  | { t: "addStratNote"; which: "debt" | "spend" | "funds"; text: string }
  | { t: "deleteStratNote"; which: "debt" | "spend" | "funds"; id: string }
  | { t: "toggleCatalog"; id: string };

const upsert = <T extends { id: string }>(list: T[], v: T) => {
  const i = list.findIndex((x) => x.id === v.id);
  if (i === -1) return [...list, v];
  const next = list.slice();
  next[i] = v;
  return next;
};

export function reducer(s: State, a: Action): State {
  switch (a.t) {
    case "set":
      return { ...s, ...a.patch };
    case "upsertCategory":
      return { ...s, categories: upsert(s.categories, a.v) };
    case "deleteCategory":
      return {
        ...s,
        categories: s.categories.filter((c) => c.id !== a.id),
        txns: s.txns.map((t) => (t.categoryId === a.id ? { ...t, categoryId: null } : t)),
      };
    case "upsertTxn":
      return { ...s, txns: upsert(s.txns, a.v) };
    case "deleteTxn":
      return { ...s, txns: s.txns.filter((t) => t.id !== a.id) };
    case "setTxnCategory":
      return { ...s, txns: s.txns.map((t) => (t.id === a.id ? { ...t, categoryId: a.categoryId } : t)) };
    case "upsertDebt":
      return { ...s, debts: upsert(s.debts, a.v) };
    case "deleteDebt":
      return {
        ...s,
        debts: s.debts.filter((d) => d.id !== a.id),
        payments: s.payments.filter((p) => p.debtId !== a.id),
      };
    case "reorderDebts": {
      const orderMap = new Map(a.order.map((id, i) => [id, i + 1]));
      return {
        ...s,
        debts: s.debts.map((d) => ({ ...d, order: orderMap.get(d.id) ?? d.order })),
      };
    }
    case "addPayment":
      return {
        ...s,
        payments: [a.v, ...s.payments],
        debts: s.debts.map((d) =>
          d.id === a.v.debtId ? { ...d, balance: Math.max(0, d.balance - a.v.amount) } : d
        ),
      };
    case "updatePayment": {
      const prev = s.payments.find((p) => p.id === a.v.id);
      return {
        ...s,
        payments: s.payments.map((p) => (p.id === a.v.id ? a.v : p)),
        debts: s.debts.map((d) => {
          let bal = d.balance;
          if (prev && prev.debtId === d.id) bal += prev.amount;
          if (a.v.debtId === d.id) bal -= a.v.amount;
          return bal === d.balance ? d : { ...d, balance: Math.max(0, bal) };
        }),
      };
    }
    case "deletePayment": {
      const prev = s.payments.find((p) => p.id === a.id);
      return {
        ...s,
        payments: s.payments.filter((p) => p.id !== a.id),
        debts: prev
          ? s.debts.map((d) => (d.id === prev.debtId ? { ...d, balance: d.balance + prev.amount } : d))
          : s.debts,
      };
    }
    case "upsertFund":
      return { ...s, funds: upsert(s.funds, a.v) };
    case "deleteFund":
      return {
        ...s,
        funds: s.funds.filter((g) => g.id !== a.id),
        contributions: s.contributions.filter((c) => c.fundId !== a.id),
      };
    case "addContribution":
      return {
        ...s,
        contributions: [a.v, ...s.contributions],
        funds: s.funds.map((g) => (g.id === a.v.fundId ? { ...g, saved: g.saved + a.v.amount } : g)),
      };
    case "updateContribution": {
      const prev = s.contributions.find((c) => c.id === a.v.id);
      return {
        ...s,
        contributions: s.contributions.map((c) => (c.id === a.v.id ? a.v : c)),
        funds: s.funds.map((g) => {
          let saved = g.saved;
          if (prev && prev.fundId === g.id) saved -= prev.amount;
          if (a.v.fundId === g.id) saved += a.v.amount;
          return saved === g.saved ? g : { ...g, saved: Math.max(0, saved) };
        }),
      };
    }
    case "deleteContribution": {
      const prev = s.contributions.find((c) => c.id === a.id);
      return {
        ...s,
        contributions: s.contributions.filter((c) => c.id !== a.id),
        funds: prev
          ? s.funds.map((g) => (g.id === prev.fundId ? { ...g, saved: Math.max(0, g.saved - prev.amount) } : g))
          : s.funds,
      };
    }
    case "toggleBill":
      return { ...s, bills: s.bills.map((b) => (b.id === a.id ? { ...b, paid: !b.paid } : b)) };
    case "upsertAccount":
      return { ...s, accounts: upsert(s.accounts, a.v) };
    case "deleteAccount":
      return { ...s, accounts: s.accounts.filter((x) => x.id !== a.id) };
    case "upsertMember":
      return { ...s, members: upsert(s.members, a.v) };
    case "deleteMember":
      return { ...s, members: s.members.filter((m) => m.id !== a.id) };
    case "addMessage":
      return { ...s, messages: [...s.messages, a.v] };
    case "addStratNote": {
      const key = a.which === "debt" ? "debtStrategy" : a.which === "spend" ? "spendStrategy" : "fundsStrategy";
      const strat = s[key];
      return {
        ...s,
        [key]: { ...strat, notes: [...strat.notes, { id: uid("n"), by: "you", at: "Just now", text: a.text }] },
      };
    }
    case "deleteStratNote": {
      const key = a.which === "debt" ? "debtStrategy" : a.which === "spend" ? "spendStrategy" : "fundsStrategy";
      const strat = s[key];
      return { ...s, [key]: { ...strat, notes: strat.notes.filter((n) => n.id !== a.id) } };
    }
    case "toggleCatalog":
      return {
        ...s,
        selectedFundCatalog: s.selectedFundCatalog.includes(a.id)
          ? s.selectedFundCatalog.filter((x) => x !== a.id)
          : [...s.selectedFundCatalog, a.id],
      };
    default:
      return s;
  }
}

// ---- context -----------------------------------------------------------------
type Ctx = {
  s: State;
  dispatch: React.Dispatch<Action>;
  modal: Modal;
  openModal: (m: Modal) => void;
  closeModal: () => void;
  showToast: (t: string) => void;
  // shell helpers
  go: (screen: ScreenId) => void;
  goMobile: (tab: MobileTab) => void;
  setTheme: (t: ThemeMode) => void;
  isDark: boolean;
  uid: (p: string) => string;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children, systemDark = false }: { children: React.ReactNode; systemDark?: boolean }) {
  const router = useRouter();
  const [s, dispatch] = useReducer(reducer, undefined, makeSeed);
  const [modal, setModal] = useState<Modal>({ kind: "none" });

  const showToast = useCallback((t: string) => sonnerToast(t), []);

  const openModal = useCallback((m: Modal) => setModal(m), []);
  const closeModal = useCallback(() => setModal({ kind: "none" }), []);
  // Navigation now drives the URL; both shells render the screen for the active path.
  const go = useCallback((screen: ScreenId) => router.push(pathForScreen(screen)), [router]);
  const goMobile = useCallback((mobileTab: MobileTab) => router.push(pathForMobileTab(mobileTab)), [router]);
  const setTheme = useCallback((theme: ThemeMode) => dispatch({ t: "set", patch: { theme } }), []);

  const isDark = s.theme === "dark" || (s.theme === "system" && systemDark);

  const value = useMemo<Ctx>(
    () => ({ s, dispatch, modal, openModal, closeModal, showToast, go, goMobile, setTheme, isDark, uid }),
    [s, modal, openModal, closeModal, showToast, go, goMobile, setTheme, isDark]
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be used within StoreProvider");
  return c;
}
