"use client";
// Add/edit a contribution to a fund. Seeds form state from the matching contribution
// (looked up by id) and mutates via store dispatch. Shared composed components live in
// @/components/composed.
import { useState } from "react";
import { useStore } from "@/lib/store";
import { usd0 } from "@/lib/format";
import type { Contribution } from "@/lib/types";
import {
  ModalShell,
  ModalHeader,
  FieldLabel,
  MoneyInput,
  DateInput,
  FooterRow,
  FieldHalf,
  PickerGroup,
  PickerRow,
} from "@/components/composed";

export function ContributionModal() {
  const { s, modal, dispatch, closeModal, showToast, uid } = useStore();
  const contributionId = modal.kind === "contribution" ? modal.contributionId : undefined;
  const existing = contributionId ? s.contributions.find((x) => x.id === contributionId) : undefined;
  const isEdit = !!existing;

  const [fundId, setFundId] = useState(existing?.fundId ?? s.funds[0]?.id ?? "");
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [date, setDate] = useState(existing?.date ?? "2026-06-21");

  const save = () => {
    const v: Contribution = {
      id: existing?.id ?? uid("co"),
      fundId,
      amount: Number(amount) || 0,
      date,
    };
    if (isEdit) dispatch({ t: "updateContribution", v });
    else dispatch({ t: "addContribution", v });
    closeModal();
    showToast(isEdit ? "Contribution updated" : "Contribution added");
  };

  return (
    <ModalShell onClose={closeModal} maxWidth={440}>
      <ModalHeader title={isEdit ? "Edit contribution" : "Add to a fund"} />

      <FieldLabel className="mt-[22px] mb-2">ADD TO FUND</FieldLabel>
      <PickerGroup value={fundId} onChange={setFundId}>
        {s.funds.map((g) => (
          <PickerRow
            key={g.id}
            value={g.id}
            color={g.color}
            label={`${g.emoji} ${g.name}`}
            sub={g.target != null ? `${usd0(g.saved)} / ${usd0(g.target)}` : usd0(g.saved)}
          />
        ))}
      </PickerGroup>

      <div className="mt-[18px] flex gap-3">
        <FieldHalf>
          <FieldLabel className="m-0 mb-2">CONTRIBUTION AMOUNT</FieldLabel>
          <MoneyInput value={amount} onChange={setAmount} placeholder="0" />
        </FieldHalf>
        <FieldHalf>
          <FieldLabel className="m-0 mb-2">DATE</FieldLabel>
          <DateInput value={date} onChange={setDate} />
        </FieldHalf>
      </div>

      <FooterRow
        onDelete={
          isEdit
            ? () => {
                dispatch({ t: "deleteContribution", id: existing!.id });
                closeModal();
                showToast("Contribution removed");
              }
            : undefined
        }
        deleteLabel="Remove"
        onCancel={closeModal}
        onSave={save}
        cta={isEdit ? "Save" : "Add contribution"}
      />
    </ModalShell>
  );
}
