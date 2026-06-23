"use client";
// Add/edit a debt account. Seeds form state from the matching debt (looked up by id)
// and mutates via store dispatch. Shared composed components live in @/components/composed.
import { useState } from "react";
import { palette } from "@/lib/theme";
import { useStore } from "@/lib/store";
import type { Debt } from "@/lib/types";
import {
  ModalShell,
  ModalHeader,
  FieldLabel,
  TextInput,
  MoneyInput,
  FooterRow,
  FieldHalf,
} from "@/components/composed";

export function DebtModal() {
  const { s, modal, dispatch, closeModal, showToast, uid } = useStore();
  const debtId = modal.kind === "debt" ? modal.debtId : undefined;
  const existing = debtId ? s.debts.find((x) => x.id === debtId) : undefined;
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name ?? "");
  const [original, setOriginal] = useState(existing ? String(existing.original) : "");
  const [balance, setBalance] = useState(existing ? String(existing.balance) : "");
  const [apr, setApr] = useState(existing?.apr ?? "");

  const save = () => {
    const v: Debt = {
      id: existing?.id ?? uid("d"),
      name: name.trim() || "Account",
      apr: apr.trim() || "0%",
      balance: Number(balance) || 0,
      original: Number(original) || Number(balance) || 0,
      color: existing?.color ?? palette[s.debts.length % palette.length],
      order: existing?.order ?? s.debts.length + 1,
    };
    dispatch({ t: "upsertDebt", v });
    closeModal();
    showToast(isEdit ? "Debt updated" : "Debt added");
  };

  return (
    <ModalShell onClose={closeModal} maxWidth={420}>
      <ModalHeader title={isEdit ? "Edit debt" : "Add debt"} />

      <FieldLabel className="mt-[22px] mb-2">ACCOUNT</FieldLabel>
      <TextInput value={name} onChange={setName} placeholder="e.g. Visa Signature" autoFocus />

      <div className="mt-[18px] flex gap-3">
        <FieldHalf>
          <FieldLabel className="m-0 mb-2">ORIGINAL BALANCE</FieldLabel>
          <MoneyInput value={original} onChange={setOriginal} placeholder="0" />
        </FieldHalf>
        <FieldHalf>
          <FieldLabel className="m-0 mb-2">CURRENT BALANCE</FieldLabel>
          <MoneyInput value={balance} onChange={setBalance} placeholder="0" />
        </FieldHalf>
      </div>

      <FieldLabel className="mt-4 mb-2">APR</FieldLabel>
      <TextInput value={apr} onChange={setApr} placeholder="22.9%" />

      <FooterRow
        onDelete={
          isEdit
            ? () => {
                dispatch({ t: "deleteDebt", id: existing!.id });
                closeModal();
                showToast("Debt removed");
              }
            : undefined
        }
        deleteLabel="Remove"
        onCancel={closeModal}
        onSave={save}
        cta={isEdit ? "Save" : "Add debt"}
      />
    </ModalShell>
  );
}
