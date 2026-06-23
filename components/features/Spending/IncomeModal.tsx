"use client";
// Add/edit an income source. Income is stored as a negative-amount txn. Seeds form
// state from the matching txn (looked up by id) and mutates via store dispatch. Shared composed
// components live in @/components/composed.
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Txn } from "@/lib/types";
import {
  ModalShell,
  ModalHeader,
  FieldLabel,
  TextInput,
  MoneyInput,
  DateInput,
  FooterRow,
  FieldHalf,
  OptionChips,
} from "@/components/composed";

export function IncomeModal() {
  const { s, modal, dispatch, closeModal, showToast, uid } = useStore();
  const txnId = modal.kind === "income" ? modal.txnId : undefined;
  const existing = txnId ? s.txns.find((x) => x.id === txnId) : undefined;
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.merchant ?? "");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(existing ? String(Math.abs(existing.amount)) : "");
  const [next, setNext] = useState(existing?.date ?? "2026-06-21");
  const [cadence, setCadence] = useState("Biweekly");

  const cadenceOptions = ["Weekly", "Biweekly", "Monthly", "Twice a month", "One-time"];

  const save = () => {
    const v: Txn = {
      id: existing?.id ?? uid("t"),
      merchant: name.trim() || "Income",
      amount: -Math.abs(Number(amount) || 0),
      date: next,
      categoryId: null,
    };
    dispatch({ t: "upsertTxn", v });
    closeModal();
    showToast(isEdit ? "Income updated" : "Income added");
  };

  return (
    <ModalShell onClose={closeModal} maxWidth={440}>
      <ModalHeader title={isEdit ? "Edit income" : "Add income"} />

      <FieldLabel className="mt-[22px] mb-2">SOURCE NAME</FieldLabel>
      <TextInput value={name} onChange={setName} placeholder="e.g. Acme Corp paycheck" autoFocus />

      <FieldLabel className="mt-[18px] mb-2">
        DESCRIPTION <span className="font-medium tracking-normal normal-case">· optional</span>
      </FieldLabel>
      <TextInput value={description} onChange={setDescription} placeholder="e.g. Salary · direct deposit" />

      <div className="mt-[18px] flex gap-3">
        <FieldHalf>
          <FieldLabel className="m-0 mb-2">AMOUNT</FieldLabel>
          <MoneyInput value={amount} onChange={setAmount} placeholder="0" />
        </FieldHalf>
        <FieldHalf>
          <FieldLabel className="m-0 mb-2">NEXT DEPOSIT</FieldLabel>
          <DateInput value={next} onChange={setNext} />
        </FieldHalf>
      </div>

      <FieldLabel className="mt-[18px] mb-[9px]">HOW OFTEN</FieldLabel>
      <OptionChips options={cadenceOptions} value={cadence} onChange={setCadence} />

      <FooterRow
        onDelete={
          isEdit
            ? () => {
                dispatch({ t: "deleteTxn", id: existing!.id });
                closeModal();
                showToast("Income removed");
              }
            : undefined
        }
        deleteLabel="Remove"
        onCancel={closeModal}
        onSave={save}
        cta={isEdit ? "Save" : "Add income"}
      />
    </ModalShell>
  );
}
