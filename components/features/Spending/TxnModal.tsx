"use client";
// Add/edit a transaction. Seeds form state from the matching txn (looked up by id) and
// mutates via store dispatch. Shared composed components live in @/components/composed.
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Txn } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ModalShell,
  ModalHeader,
  FieldLabel,
  TextInput,
  MoneyInput,
  DateInput,
  FooterRow,
  FieldHalf,
} from "@/components/composed";

export function TxnModal() {
  const { s, modal, dispatch, closeModal, showToast, uid } = useStore();
  const txnId = modal.kind === "txn" ? modal.txnId : undefined;
  const existing = txnId ? s.txns.find((x) => x.id === txnId) : undefined;
  const isEdit = !!existing;

  const [merchant, setMerchant] = useState(existing?.merchant ?? "");
  const [amount, setAmount] = useState(existing ? String(Math.abs(existing.amount)) : "");
  const [date, setDate] = useState(existing?.date ?? "2026-06-21");
  const [categoryId, setCategoryId] = useState<string | null>(existing?.categoryId ?? s.categories[0]?.id ?? null);

  const save = () => {
    const v: Txn = {
      id: existing?.id ?? uid("t"),
      merchant: merchant.trim() || "Transaction",
      amount: Math.abs(Number(amount) || 0),
      date,
      categoryId,
    };
    dispatch({ t: "upsertTxn", v });
    closeModal();
    showToast(isEdit ? "Transaction updated" : "Transaction added");
  };

  return (
    <ModalShell onClose={closeModal} maxWidth={440}>
      <ModalHeader title={isEdit ? "Edit transaction" : "Add transaction"} />

      <FieldLabel className="mt-[22px] mb-2">MERCHANT</FieldLabel>
      <TextInput value={merchant} onChange={setMerchant} placeholder="e.g. Whole Foods Market" autoFocus />

      <div className="mt-[18px] flex gap-3">
        <FieldHalf>
          <FieldLabel className="m-0 mb-2">AMOUNT</FieldLabel>
          <MoneyInput value={amount} onChange={setAmount} placeholder="0.00" />
        </FieldHalf>
        <FieldHalf>
          <FieldLabel className="m-0 mb-2">DATE</FieldLabel>
          <DateInput value={date} onChange={setDate} />
        </FieldHalf>
      </div>

      <FieldLabel>CATEGORY</FieldLabel>
      <div className="flex flex-wrap gap-[7px]">
        {s.categories.map((c) => {
          const sel = c.id === categoryId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryId(c.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-[10px] px-3 py-[7px] text-[12.5px] transition-colors",
                sel ? "border-2 bg-card font-semibold text-foreground" : "border bg-secondary font-medium text-muted-foreground"
              )}
              style={sel ? { borderColor: c.color } : undefined}
            >
              <span className="size-[9px] rounded-full" style={{ background: c.color }} />
              {c.name}
            </button>
          );
        })}
      </div>

      <FooterRow
        onDelete={
          isEdit
            ? () => {
                dispatch({ t: "deleteTxn", id: existing!.id });
                closeModal();
                showToast("Transaction removed");
              }
            : undefined
        }
        deleteLabel="Remove"
        onCancel={closeModal}
        onSave={save}
        cta={isEdit ? "Save" : "Add transaction"}
      />
    </ModalShell>
  );
}
