"use client";
// Connect-an-account chooser: walks the Plaid link flow, manual entry, or CSV import in
// a small step machine. Plaid/manual create an account; CSV imports sample transactions.
// Shared composed components live in @/components/composed.
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { useStore } from "@/lib/store";
import { usd0, shortDate } from "@/lib/format";
import type { Account } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ModalShell, ModalHeader, FieldLabel } from "@/components/composed";
import { ChooseRow } from "./ChooseRow";

const PLAID_INSTITUTIONS = [
  { name: "Chase", initial: "C", color: "#3a6ea5" },
  { name: "Bank of America", initial: "B", color: "#c2705a" },
  { name: "Wells Fargo", initial: "W", color: "#b07d22" },
  { name: "Ally", initial: "A", color: "#2f8f6b" },
  { name: "Capital One", initial: "C", color: "#9b5fb0" },
  { name: "Citi", initial: "C", color: "#1f9e8a" },
];

const SAMPLE_CSV_ROWS = [
  { merchant: "Apple Store", cat: "Shopping", date: "2026-06-19", amount: 129.0 },
  { merchant: "Uber", cat: "Transport", date: "2026-06-18", amount: 24.3 },
  { merchant: "Starbucks", cat: "Dining out", date: "2026-06-17", amount: 6.75 },
  { merchant: "Apple.com/bill", cat: "Bills & utilities", date: "2026-06-16", amount: 9.99 },
  { merchant: "Target", cat: "Shopping", date: "2026-06-15", amount: 58.42 },
];

type ConnectStep = "choose" | "plaid" | "connecting" | "csvDrop" | "csvPreview";

export function ConnectModal() {
  const { dispatch, closeModal, openModal, showToast, uid } = useStore();
  const [step, setStep] = useState<ConnectStep>("choose");
  const [inst, setInst] = useState(PLAID_INSTITUTIONS[0]);
  const [csvName, setCsvName] = useState("Apple Card - June 2026.csv");

  const finishPlaid = (chosen: (typeof PLAID_INSTITUTIONS)[number]) => {
    setInst(chosen);
    setStep("connecting");
    setTimeout(() => {
      const v: Account = {
        id: uid("a"),
        name: `${chosen.name} Checking`,
        inst: chosen.name,
        mask: String(1000 + Math.floor(Math.random() * 8999)),
        type: "Checking",
        balance: 3200 + Math.floor(Math.random() * 4000),
        color: chosen.color,
        synced: true,
        syncLabel: "Synced just now",
      };
      dispatch({ t: "upsertAccount", v });
      closeModal();
      showToast(`${chosen.name} connected`);
    }, 1600);
  };

  const importCsv = () => {
    SAMPLE_CSV_ROWS.forEach((r) => {
      dispatch({
        t: "upsertTxn",
        v: { id: uid("t"), merchant: r.merchant, amount: r.amount, date: r.date, categoryId: null },
      });
    });
    closeModal();
    showToast(`Imported ${SAMPLE_CSV_ROWS.length} transactions`);
  };

  const csvTotal = SAMPLE_CSV_ROWS.reduce((a, r) => a + r.amount, 0);

  return (
    <ModalShell onClose={closeModal} maxWidth={440} z={108}>
      <ModalHeader title="Add an account" />

      {step === "choose" && (
        <div className="mt-5 flex flex-col gap-3">
          <ChooseRow
            iconName="refresh"
            iconClass="bg-brand-green/[0.12] text-brand-green"
            title="Link with Plaid"
            desc="Securely connect your bank or card. Balances and transactions sync automatically."
            onClick={() => setStep("plaid")}
          />
          <ChooseRow
            iconName="edit"
            iconClass="bg-brand-amber/[0.14] text-brand-gold"
            title="Add manually"
            desc="For loans, 401(k)s, medical bills, and anything Plaid can't reach. You'll update the balance yourself."
            onClick={() => openModal({ kind: "account" })}
          />
          <ChooseRow
            iconName="file"
            iconClass="bg-brand-blue/[0.12] text-brand-blue"
            title="Import from CSV"
            desc="Upload a statement export from cards Plaid can't link — like Apple Card. We'll add the transactions for you."
            onClick={() => setStep("csvDrop")}
          />
        </div>
      )}

      {step === "plaid" && (
        <>
          <div className="mx-0 mt-[18px] mb-1 flex items-center gap-2">
            <div className="size-2 rounded-full bg-brand-green" />
            <span className="text-[12.5px] text-muted-foreground">
              Powered by <strong className="text-foreground/80">Plaid</strong> · bank-level encryption
            </span>
          </div>
          <FieldLabel className="mt-3.5 mb-[9px]">SELECT YOUR INSTITUTION</FieldLabel>
          <div className="grid grid-cols-2 gap-[9px]">
            {PLAID_INSTITUTIONS.map((i) => (
              <button
                key={i.name}
                type="button"
                onClick={() => finishPlaid(i)}
                className="flex items-center gap-[11px] rounded-[13px] border bg-secondary px-3.5 py-[13px] text-left"
              >
                <div
                  className="flex size-[34px] flex-none items-center justify-center rounded-[9px] text-[15px] font-bold text-white"
                  style={{ background: i.color }}
                >
                  {i.initial}
                </div>
                <span className="text-[13.5px] font-medium text-foreground">{i.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {step === "connecting" && (
        <div className="flex flex-col items-center px-2.5 pt-[34px] pb-[22px] text-center">
          <div
            className="flex size-[58px] items-center justify-center rounded-2xl text-2xl font-bold text-white"
            style={{ background: inst.color }}
          >
            {inst.initial}
          </div>
          <Icon name="refresh" size={26} strokeWidth={2.6} style={{ marginTop: 20 }} className="text-brand-green" />
          <div className="mt-4 text-[15px] font-semibold text-foreground">Connecting to {inst.name}…</div>
          <div className="mt-[5px] max-w-[280px] text-[12.5px] leading-snug text-muted-foreground">
            Verifying credentials and pulling your accounts and recent transactions.
          </div>
        </div>
      )}

      {step === "csvDrop" && (
        <>
          <div className="mx-0 mt-[18px] mb-1 flex items-center gap-2">
            <div className="size-2 rounded-full bg-brand-blue" />
            <span className="text-[12.5px] text-muted-foreground">
              For cards Plaid can&apos;t link — like <strong className="text-foreground/80">Apple Card</strong>
            </span>
          </div>
          <label className="mt-3.5 flex cursor-pointer flex-col items-center gap-[11px] rounded-2xl border-2 border-dashed border-foreground/20 bg-secondary px-5 py-8 text-center">
            <div className="flex size-[50px] items-center justify-center rounded-2xl bg-brand-blue/[0.12] text-brand-blue">
              <Icon name="file" size={25} strokeWidth={1.9} />
            </div>
            <div className="text-[15px] font-semibold text-foreground">Choose a CSV file</div>
            <div className="max-w-[300px] text-[12.5px] leading-relaxed text-muted-foreground">
              In the Wallet app, open your card → ••• → <strong className="text-foreground/80">Export Transactions</strong>, then select the CSV here.
            </div>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setCsvName(f.name);
                setStep("csvPreview");
              }}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setCsvName("Apple Card - Sample.csv");
              setStep("csvPreview");
            }}
            className="mt-3 w-full p-1.5 text-[13px] font-semibold text-brand-blue"
          >
            No file handy? Try a sample Apple Card statement
          </button>
        </>
      )}

      {step === "csvPreview" && (
        <>
          <div className="mt-[18px] flex items-center gap-[11px] rounded-[13px] border border-brand-blue/20 bg-brand-blue/[0.07] px-3.5 py-[13px]">
            <div className="flex size-[38px] flex-none items-center justify-center rounded-[10px] bg-brand-blue/[0.14] text-brand-blue">
              <Icon name="fileSimple" size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13.5px] font-semibold text-foreground">{csvName}</div>
              <div className="mt-px text-xs text-muted-foreground">
                {SAMPLE_CSV_ROWS.length} transactions · {usd0(csvTotal)} total
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-col">
            {SAMPLE_CSV_ROWS.map((r, i) => (
              <div key={i} className="flex items-center gap-2.5 border-t border-border/60 px-0.5 py-2.5 first:border-t-0">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-medium text-foreground">{r.merchant}</div>
                  <div className="text-[11.5px] text-muted-foreground/70">
                    {r.cat} · {shortDate(r.date)}
                  </div>
                </div>
                <span className="tnum text-[13.5px] font-semibold text-brand-warm">{usd0(r.amount)}</span>
              </div>
            ))}
          </div>

          <div className="mt-[18px] flex gap-2.5">
            <Button
              variant="outline"
              onClick={() => setStep("csvDrop")}
              className="h-auto rounded-[11px] border-foreground/15 bg-transparent px-[18px] py-[11px] text-sm font-medium text-foreground/80"
            >
              Back
            </Button>
            <Button onClick={importCsv} className="h-auto flex-1 rounded-[11px] p-3 text-center text-sm font-semibold">
              Import {SAMPLE_CSV_ROWS.length} transactions
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
