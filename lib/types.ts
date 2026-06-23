// Domain model for the Northstar command center. These shapes back the fully
// interactive app: every screen reads from this state and every modal mutates it.

export type ScreenId =
  | "today"
  | "spending"
  | "debt"
  | "trends"
  | "funds"
  | "bills"
  | "advisor"
  | "onboarding";

export type MobileTab = "today" | "spending" | "advisor" | "funds" | "debt";

export type Category = {
  id: string;
  name: string;
  color: string;
  spent: number;
  lastMonth: number; // for the ▲/▼ vs last month deltas
};

export type Txn = {
  id: string;
  merchant: string;
  amount: number; // positive = spend, negative = income (stored as signed)
  date: string; // ISO yyyy-mm-dd
  categoryId: string | null; // null => income
};

export type Debt = {
  id: string;
  name: string;
  apr: string; // e.g. "22.9%"
  balance: number;
  original: number;
  color: string;
  order: number; // payoff priority
};

export type Payment = {
  id: string;
  debtId: string;
  amount: number;
  date: string;
};

export type Fund = {
  id: string;
  name: string;
  emoji: string;
  kind: "Target" | "Recurring" | "Open";
  target: number | null;
  saved: number;
  date: string | null; // yyyy-mm
  color: string;
};

export type Contribution = {
  id: string;
  fundId: string;
  amount: number;
  date: string;
};

export type Bill = {
  id: string;
  name: string;
  kind: string; // "Subscription" | "Utility" | ...
  amount: number;
  due: string; // human label e.g. "Jun 24"
  paid: boolean;
  soon?: boolean; // due soon → amber "Due soon" status
};

export type Account = {
  id: string;
  name: string;
  inst: string;
  mask: string;
  type: "Checking" | "Savings" | "Credit" | "Loan" | "Investment";
  balance: number; // negative => owed
  color: string;
  synced: boolean;
  syncLabel: string;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Editor" | "Viewer";
  color: string;
};

export type ActivityItem = {
  id: string;
  who: string;
  action: string;
  detail: string;
  ago: string;
  initial: string;
  avColor: string;
  tone: "green" | "warm" | "accent";
};

export type ChatMessage = { id: string; role: "ai" | "user"; text: string };

export type StratNote = {
  id: string;
  by: "advisor" | "you";
  at: string;
  text: string;
};

export type Strategy = {
  name: string;
  desc: string;
  notes: StratNote[];
};

export type FundCatalogItem = {
  id: string;
  emoji: string;
  title: string;
  desc: string;
};

export type State = {
  // shell. The active screen/mobile tab is derived from the URL (see routes.ts) and the
  // viewport is read live via useIsMobile — neither is stored here.
  theme: import("./theme").ThemeMode;

  // user
  userName: string;
  profileEmail: string;

  // data
  categories: Category[];
  txns: Txn[];
  debts: Debt[];
  payments: Payment[];
  funds: Fund[];
  contributions: Contribution[];
  bills: Bill[];
  accounts: Account[];
  members: Member[];
  activity: ActivityItem[];
  messages: ChatMessage[];
  selectedFundCatalog: string[];

  // advisor-authored strategies (debt / spending / funds)
  debtStrategy: Strategy;
  spendStrategy: Strategy;
  fundsStrategy: Strategy;
};
