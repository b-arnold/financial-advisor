// Seeded data so the app opens in its rich "has data" state, matching the populated
// version of the Command Center design (Northstar). Dates are fixed strings so the
// build is deterministic.
import type { State } from "./types";

const C = {
  groceries: "#2f8f6b",
  dining: "#c2705a",
  transport: "#3a6ea5",
  shopping: "#6d5bd0",
  bills: "#b07d22",
  fun: "#9b5fb0",
  health: "#1f9e8a",
};

export function makeSeed(): State {
  return {
    theme: "light",

    userName: "Brett",
    profileEmail: "brett.arnold40@gmail.com",

    categories: [
      { id: "c1", name: "Groceries", color: C.groceries, spent: 612, lastMonth: 548 },
      { id: "c2", name: "Dining out", color: C.dining, spent: 384, lastMonth: 441 },
      { id: "c3", name: "Transport", color: C.transport, spent: 196, lastMonth: 188 },
      { id: "c4", name: "Shopping", color: C.shopping, spent: 312, lastMonth: 205 },
      { id: "c5", name: "Bills & utilities", color: C.bills, spent: 268, lastMonth: 268 },
      { id: "c6", name: "Entertainment", color: C.fun, spent: 144, lastMonth: 121 },
      { id: "c7", name: "Health", color: C.health, spent: 98, lastMonth: 132 },
    ],

    txns: [
      { id: "t1", merchant: "Whole Foods Market", amount: 86.42, date: "2026-06-18", categoryId: "c1" },
      { id: "t2", merchant: "Acme Corp", amount: -4200, date: "2026-06-15", categoryId: null },
      { id: "t3", merchant: "Blue Bottle Coffee", amount: 7.5, date: "2026-06-18", categoryId: "c2" },
      { id: "t4", merchant: "Shell", amount: 52.1, date: "2026-06-17", categoryId: "c3" },
      { id: "t5", merchant: "Amazon", amount: 64.99, date: "2026-06-16", categoryId: "c4" },
      { id: "t6", merchant: "Trader Joe's", amount: 41.18, date: "2026-06-15", categoryId: "c1" },
      { id: "t7", merchant: "Netflix", amount: 15.49, date: "2026-06-14", categoryId: "c5" },
      { id: "t8", merchant: "Chipotle", amount: 13.85, date: "2026-06-14", categoryId: "c2" },
      { id: "t9", merchant: "Uptown Cinema", amount: 28.0, date: "2026-06-13", categoryId: "c6" },
      { id: "t10", merchant: "CVS Pharmacy", amount: 22.4, date: "2026-06-12", categoryId: "c7" },
      { id: "t11", merchant: "Side gig", amount: -650, date: "2026-06-10", categoryId: null },
      { id: "t12", merchant: "Lyft", amount: 18.6, date: "2026-06-11", categoryId: "c3" },
    ],

    debts: [
      { id: "d1", name: "Visa Signature", apr: "24.9%", balance: 4820, original: 6200, color: "#c2705a", order: 1 },
      { id: "d2", name: "Apple Card", apr: "19.2%", balance: 2140, original: 2800, color: "#6d5bd0", order: 2 },
      { id: "d3", name: "Auto loan", apr: "6.4%", balance: 9650, original: 14000, color: "#3a6ea5", order: 3 },
      { id: "d4", name: "Student loan", apr: "4.1%", balance: 6420, original: 11000, color: "#2f8f6b", order: 4 },
    ],

    payments: [
      { id: "p1", debtId: "d1", amount: 380, date: "2026-06-05" },
      { id: "p2", debtId: "d2", amount: 220, date: "2026-06-05" },
      { id: "p3", debtId: "d3", amount: 310, date: "2026-06-02" },
      { id: "p4", debtId: "d1", amount: 400, date: "2026-05-05" },
      { id: "p5", debtId: "d4", amount: 145, date: "2026-05-03" },
    ],

    funds: [
      { id: "g1", name: "Family vacation", emoji: "🏖️", kind: "Target", target: 5000, saved: 1850, date: "2026-12", color: "#c2705a" },
      { id: "g2", name: "Emergency fund", emoji: "🛟", kind: "Target", target: 12000, saved: 7400, date: "2027-06", color: "#2f8f6b" },
      { id: "g3", name: "New laptop", emoji: "💻", kind: "Open", target: null, saved: 480, date: null, color: "#6d5bd0" },
    ],

    contributions: [
      { id: "co1", fundId: "g1", amount: 263, date: "2026-06-01" },
      { id: "co2", fundId: "g2", amount: 400, date: "2026-06-01" },
      { id: "co3", fundId: "g3", amount: 80, date: "2026-05-20" },
      { id: "co4", fundId: "g1", amount: 263, date: "2026-05-01" },
    ],

    bills: [
      { id: "b1", name: "Rent", kind: "Housing", amount: 1850, due: "Jun 1", paid: true },
      { id: "b2", name: "Electric", kind: "Utility", amount: 124, due: "Jun 22", paid: false, soon: true },
      { id: "b3", name: "Netflix", kind: "Subscription", amount: 15.49, due: "Jun 24", paid: false, soon: true },
      { id: "b4", name: "Internet", kind: "Utility", amount: 70, due: "Jun 26", paid: false },
      { id: "b5", name: "Spotify", kind: "Subscription", amount: 11.99, due: "Jun 28", paid: false },
      { id: "b6", name: "Gym", kind: "Subscription", amount: 39, due: "Jun 30", paid: false },
    ],

    accounts: [
      { id: "a1", name: "Everyday Checking", inst: "Chase", mask: "4821", type: "Checking", balance: 5240, color: "#3a6ea5", synced: true, syncLabel: "Synced 2h ago" },
      { id: "a2", name: "High-yield Savings", inst: "Ally", mask: "9930", type: "Savings", balance: 9730, color: "#2f8f6b", synced: true, syncLabel: "Synced 2h ago" },
      { id: "a3", name: "Visa Signature", inst: "Chase", mask: "1142", type: "Credit", balance: -4820, color: "#c2705a", synced: true, syncLabel: "Synced 2h ago" },
      { id: "a4", name: "Apple Card", inst: "Goldman Sachs", mask: "0077", type: "Credit", balance: -2140, color: "#6d5bd0", synced: false, syncLabel: "Manual" },
      { id: "a5", name: "Auto loan", inst: "Capital One", mask: "5510", type: "Loan", balance: -9650, color: "#b07d22", synced: false, syncLabel: "Manual" },
    ],

    members: [
      { id: "m1", name: "Brett Arnold", email: "brett.arnold40@gmail.com", role: "Owner", color: "#c2705a" },
      { id: "m2", name: "Jordan Chen", email: "jordan@email.com", role: "Editor", color: "#6d5bd0" },
    ],

    activity: [
      { id: "ac1", who: "Jordan", action: "logged a payment", detail: "$220 to Apple Card", ago: "2h", initial: "J", avColor: "#6d5bd0", tone: "green" },
      { id: "ac2", who: "You", action: "added a transaction", detail: "Whole Foods · $86.42", ago: "5h", initial: "B", avColor: "#c2705a", tone: "warm" },
      { id: "ac3", who: "Jordan", action: "contributed to a fund", detail: "$80 to New laptop", ago: "Yesterday", initial: "J", avColor: "#6d5bd0", tone: "green" },
      { id: "ac4", who: "You", action: "marked a bill paid", detail: "Rent · $1,850", ago: "2d", initial: "B", avColor: "#c2705a", tone: "accent" },
      { id: "ac5", who: "Advisor", action: "updated your plan", detail: "Avalanche payoff order", ago: "3d", initial: "✦", avColor: "#8b7bea", tone: "accent" },
    ],

    messages: [
      { id: "msg1", role: "ai", text: "Morning, Brett. Your free cash flow is up $310 this month — nice work. I'd point the extra at the Visa Signature; it's your most expensive balance at 24.9%." },
      { id: "msg2", role: "user", text: "How much sooner would that get me debt-free?" },
      { id: "msg3", role: "ai", text: "About four months sooner — September 2027 instead of January 2028 — and roughly $640 less interest. Want me to set that as your plan?" },
    ],

    selectedFundCatalog: ["pay-down-debt", "emergency-fund", "vacation"],

    debtStrategy: {
      name: "Avalanche",
      desc: "Pay minimums on everything, then throw every spare dollar at the highest-APR balance first. Mathematically the cheapest path — you'll pay the least interest overall.",
      notes: [
        { id: "n1", by: "advisor", at: "Jun 12", text: "Switched you from snowball to avalanche — the Visa's 24.9% APR is costing more than the motivation boost of clearing the Apple Card first." },
        { id: "n2", by: "you", at: "Jun 13", text: "Makes sense. Let's keep the auto-loan on minimums for now." },
      ],
    },
    spendStrategy: {
      name: "50 / 30 / 20",
      desc: "Aim for 50% needs, 30% wants, 20% toward savings and debt. You're running a little hot on dining out — trimming there frees up your vacation contribution.",
      notes: [
        { id: "sn1", by: "advisor", at: "Jun 10", text: "Dining out is up 18% over your 3-month average. A $120/mo trim covers most of the vacation auto-save." },
      ],
    },
    fundsStrategy: {
      name: "Fund-weighted auto-save",
      desc: "Each payday I split your savings across funds by deadline pressure — the vacation gets the most right now because it's closest.",
      notes: [
        { id: "fn1", by: "advisor", at: "Jun 1", text: "Bumped the emergency fund to $400/mo now that the vacation is 37% funded." },
      ],
    },
  };
}

export const FUND_CATALOG = [
  { id: "pay-down-debt", emoji: "💳", title: "Pay down debt", desc: "Get out from under high-interest balances faster." },
  { id: "emergency-fund", emoji: "🛟", title: "Emergency fund", desc: "3–6 months of expenses, safely set aside." },
  { id: "vacation", emoji: "🏖️", title: "Take a trip", desc: "Save toward a getaway without the credit hangover." },
  { id: "home", emoji: "🏠", title: "Buy a home", desc: "Build a down payment, one month at a time." },
  { id: "retire", emoji: "🌅", title: "Retire well", desc: "Invest steadily for the long haul." },
  { id: "big-purchase", emoji: "🚗", title: "Big purchase", desc: "A car, a wedding, a new laptop." },
  { id: "invest", emoji: "📈", title: "Start investing", desc: "Put idle cash to work in the market." },
  { id: "budget", emoji: "🎯", title: "Spend smarter", desc: "Know exactly where every dollar goes." },
];

export const EMOJI_OPTIONS = ["🏖️", "🛟", "💻", "🏠", "🚗", "💍", "🎓", "✈️", "🎯", "🐣", "📷", "🎸"];

export const ADVISOR_SUGGESTIONS = [
  "How do I pay off debt faster?",
  "Can I afford the vacation?",
  "Where am I overspending?",
];
