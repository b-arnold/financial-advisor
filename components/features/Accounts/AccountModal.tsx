"use client";
// Add/edit a single account. Seeds form state from the matching account (looked up by
// id) and mutates via store dispatch. Synced (Plaid) accounts show an override notice.
// Shared composed components live in @/components/composed.
import { useState } from "react";
import { palette } from "@/lib/theme";
import { Icon } from "@/components/Icon";
import { useStore } from "@/lib/store";
import type { Account } from "@/lib/types";
import {
  ModalShell,
  ModalHeader,
  FieldLabel,
  TextInput,
  MoneyInput,
  FooterRow,
  FieldHalf,
  OptionChips,
} from "@/components/composed";

export function AccountModal() {
  const { s, modal, dispatch, closeModal, showToast, uid } = useStore();
  const accountId = modal.kind === "account" ? modal.accountId : undefined;
  const existing = accountId ? s.accounts.find((x) => x.id === accountId) : undefined;
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name ?? "");
  const [inst, setInst] = useState(existing?.inst ?? "");
  const [mask, setMask] = useState(existing?.mask ?? "");
  const [type, setType] = useState<Account["type"]>(existing?.type ?? "Checking");
  const [balance, setBalance] = useState(existing ? String(existing.balance) : "");

  const typeOptions: Account["type"][] = ["Checking", "Savings", "Credit", "Loan", "Investment"];

  const save = () => {
    const v: Account = {
      id: existing?.id ?? uid("a"),
      name: name.trim() || "Account",
      inst: inst.trim() || "Manual",
      mask: mask.trim(),
      type,
      balance: Number(balance) || 0,
      color: existing?.color ?? palette[s.accounts.length % palette.length],
      synced: existing?.synced ?? false,
      syncLabel: existing?.syncLabel ?? "Manual",
    };
    dispatch({ t: "upsertAccount", v });
    closeModal();
    showToast(isEdit ? "Account updated" : "Account added");
  };

  return (
    <ModalShell onClose={closeModal} maxWidth={440} z={110}>
      <ModalHeader title={isEdit ? "Edit account" : "Add account"} />

      {existing?.synced && (
        <div className="mt-4 flex items-start gap-[9px] rounded-xl border border-brand-green/20 bg-brand-green/[0.09] px-3.5 py-3">
          <Icon name="refresh" size={16} strokeWidth={2.2} style={{ flex: "none", marginTop: 1 }} className="text-brand-green" />
          <div className="text-[12.5px] leading-snug text-foreground/80">
            Linked through Plaid — balance and transactions sync automatically. Any edits here are overridden on the next sync.
          </div>
        </div>
      )}

      <FieldLabel className="mt-[22px] mb-2">ACCOUNT NAME</FieldLabel>
      <TextInput value={name} onChange={setName} placeholder="e.g. Everyday Checking" autoFocus />

      <div className="mt-[18px] flex gap-3">
        <div className="min-w-0 flex-[1.4]">
          <FieldLabel className="m-0 mb-2">INSTITUTION</FieldLabel>
          <TextInput value={inst} onChange={setInst} placeholder="e.g. Chase" />
        </div>
        <FieldHalf>
          <FieldLabel className="m-0 mb-2">LAST 4</FieldLabel>
          <TextInput value={mask} onChange={setMask} placeholder="1234" />
        </FieldHalf>
      </div>

      <FieldLabel>TYPE</FieldLabel>
      <OptionChips options={typeOptions} value={type} onChange={setType} />

      <div className="mt-5">
        <FieldLabel className="m-0 mb-2">
          CURRENT BALANCE <span className="font-normal tracking-normal normal-case">(negative if owed)</span>
        </FieldLabel>
        <MoneyInput value={balance} onChange={setBalance} placeholder="0" />
      </div>

      <FooterRow
        onDelete={
          isEdit
            ? () => {
                dispatch({ t: "deleteAccount", id: existing!.id });
                closeModal();
                showToast("Account disconnected");
              }
            : undefined
        }
        deleteLabel="Disconnect"
        onCancel={closeModal}
        onSave={save}
        cta={isEdit ? "Save" : "Add account"}
      />
    </ModalShell>
  );
}
