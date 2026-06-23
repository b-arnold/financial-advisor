"use client";
// Root modal dispatcher for the command center. Switches on `modal.kind` and renders
// the matching modal, each of which lives in its own file under the relevant feature
// folder. Shared composed components (shell, header, fields, footer, chips, picker rows)
// live in @/components/composed.
import { useStore } from "@/lib/store";
import { FundModal } from "@/components/features/Funds/FundModal";
import { ContributionModal } from "@/components/features/Funds/ContributionModal";
import { TxnModal } from "@/components/features/Spending/TxnModal";
import { CategoryModal } from "@/components/features/Spending/CategoryModal";
import { IncomeModal } from "@/components/features/Spending/IncomeModal";
import { DebtModal } from "@/components/features/Debt/DebtModal";
import { PaymentModal } from "@/components/features/Debt/PaymentModal";
import { AccountsPanel } from "@/components/features/Accounts/AccountsPanel";
import { ConnectModal } from "@/components/features/Accounts/ConnectModal";
import { AccountModal } from "@/components/features/Accounts/AccountModal";
import { ProfilePanel } from "@/components/features/Accounts/ProfilePanel";
import { MemberModal } from "@/components/features/Accounts/MemberModal";

export default function Modals() {
  const { modal } = useStore();
  switch (modal.kind) {
    case "none":
      return null;
    case "fund":
      return <FundModal />;
    case "txn":
      return <TxnModal />;
    case "debt":
      return <DebtModal />;
    case "category":
      return <CategoryModal />;
    case "income":
      return <IncomeModal />;
    case "payment":
      return <PaymentModal />;
    case "contribution":
      return <ContributionModal />;
    case "accounts":
      return <AccountsPanel />;
    case "connect":
      return <ConnectModal />;
    case "account":
      return <AccountModal />;
    case "profile":
      return <ProfilePanel />;
    case "member":
      return <MemberModal />;
    default:
      return null;
  }
}
