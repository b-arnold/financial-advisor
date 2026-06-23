"use client";
// Log/edit a payment against a debt. Seeds form state from the matching payment (looked
// up by id) and mutates via store dispatch. Shared composed components live in
// @/components/composed.
import { useState } from "react";
import { useStore } from "@/lib/store";
import { usd0 } from "@/lib/format";
import type { Payment } from "@/lib/types";
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

export function PaymentModal() {
  const { s, modal, dispatch, closeModal, showToast, uid } = useStore();
  const paymentId = modal.kind === "payment" ? modal.paymentId : undefined;
  const existing = paymentId ? s.payments.find((x) => x.id === paymentId) : undefined;
  const isEdit = !!existing;

  const [debtId, setDebtId] = useState(existing?.debtId ?? s.debts[0]?.id ?? "");
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [date, setDate] = useState(existing?.date ?? "2026-06-21");

  const save = () => {
    const v: Payment = {
      id: existing?.id ?? uid("p"),
      debtId,
      amount: Number(amount) || 0,
      date,
    };
    if (isEdit) dispatch({ t: "updatePayment", v });
    else dispatch({ t: "addPayment", v });
    closeModal();
    showToast(isEdit ? "Payment updated" : "Payment logged");
  };

  return (
    <ModalShell onClose={closeModal} maxWidth={440}>
      <ModalHeader title={isEdit ? "Edit payment" : "Log a payment"} />

      <FieldLabel className="mt-[22px] mb-2">APPLY TO</FieldLabel>
      <PickerGroup value={debtId} onChange={setDebtId}>
        {s.debts.map((d) => (
          <PickerRow
            key={d.id}
            value={d.id}
            color={d.color}
            label={d.name}
            sub={`${usd0(d.balance)} · ${d.apr}`}
          />
        ))}
      </PickerGroup>

      <div className="mt-[18px] flex gap-3">
        <FieldHalf>
          <FieldLabel className="m-0 mb-2">PAYMENT AMOUNT</FieldLabel>
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
                dispatch({ t: "deletePayment", id: existing!.id });
                closeModal();
                showToast("Payment removed");
              }
            : undefined
        }
        deleteLabel="Remove"
        onCancel={closeModal}
        onSave={save}
        cta={isEdit ? "Save" : "Log payment"}
      />
    </ModalShell>
  );
}
