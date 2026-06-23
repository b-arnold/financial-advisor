"use client";
// Create/edit a fund. Seeds form state from the matching fund (looked up by id) and
// mutates via store dispatch. Shared composed components live in @/components/composed.
import { useState } from "react";
import { palette } from "@/lib/theme";
import { useStore } from "@/lib/store";
import { EMOJI_OPTIONS } from "@/lib/seed";
import { usd0, monthYear } from "@/lib/format";
import type { Fund } from "@/lib/types";
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
  OptionChips,
} from "@/components/composed";

export function FundModal() {
  const { s, modal, dispatch, closeModal, showToast, uid } = useStore();
  const fundId = modal.kind === "fund" ? modal.fundId : undefined;
  const existing = fundId ? s.funds.find((g) => g.id === fundId) : undefined;
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name ?? "");
  const [emoji, setEmoji] = useState(existing?.emoji ?? EMOJI_OPTIONS[0]);
  const [kind, setKind] = useState<Fund["kind"]>(existing?.kind ?? "Target");
  const [target, setTarget] = useState(existing?.target != null ? String(existing.target) : "");
  const [saved, setSaved] = useState(existing ? String(existing.saved) : "");
  const [date, setDate] = useState(existing?.date ?? "");

  const typeOptions: Fund["kind"][] = ["Target", "Recurring", "Open"];

  const save = () => {
    const v: Fund = {
      id: existing?.id ?? uid("g"),
      name: name.trim() || "New fund",
      emoji,
      kind,
      target: target ? Number(target) : null,
      saved: saved ? Number(saved) : 0,
      date: date || null,
      color: existing?.color ?? palette[s.funds.length % palette.length],
    };
    dispatch({ t: "upsertFund", v });
    closeModal();
    showToast(isEdit ? "Fund updated" : "Fund created");
  };

  const targetNum = target ? Number(target) : null;
  const savedNum = saved ? Number(saved) : 0;
  const hasPreview = kind === "Target" && targetNum != null && targetNum > savedNum && !!date;
  let monthly = "";
  if (hasPreview && targetNum != null) {
    const [yy, mm] = date.split("-").map(Number);
    const base = new Date(2026, 5, 1);
    const tgt = new Date(yy, mm - 1, 1);
    const months = Math.max(1, (tgt.getFullYear() - base.getFullYear()) * 12 + (tgt.getMonth() - base.getMonth()));
    monthly = usd0(Math.ceil((targetNum - savedNum) / months));
  }

  return (
    <ModalShell onClose={closeModal} maxWidth={460}>
      <ModalHeader title={isEdit ? "Edit fund" : "New fund"} />

      <div className="mt-[22px] flex items-center gap-[11px]">
        <div className="flex size-12 flex-none items-center justify-center rounded-[13px] bg-secondary text-2xl">
          {emoji}
        </div>
        <TextInput value={name} onChange={setName} placeholder="Name your fund" className="flex-1" autoFocus />
      </div>

      <FieldLabel className="mt-[18px] mb-2">PICK AN ICON</FieldLabel>
      <div className="flex flex-wrap gap-[7px]">
        {EMOJI_OPTIONS.map((e) => {
          const sel = e === emoji;
          return (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={cn(
                "size-10 rounded-[11px] text-[19px]",
                sel ? "border-2 border-primary bg-primary/10" : "border bg-secondary"
              )}
            >
              {e}
            </button>
          );
        })}
      </div>

      <FieldLabel>WHAT KIND OF FUND?</FieldLabel>
      <OptionChips options={typeOptions} value={kind} onChange={setKind} fill />

      <div className="mt-5 flex gap-3">
        <FieldHalf>
          <FieldLabel className="m-0 mb-2">
            TARGET AMOUNT <span className="font-medium text-muted-foreground/70">· optional</span>
          </FieldLabel>
          <MoneyInput value={target} onChange={setTarget} placeholder="5,000" />
        </FieldHalf>
        <FieldHalf>
          <FieldLabel className="m-0 mb-2">ALREADY HAVE</FieldLabel>
          <MoneyInput value={saved} onChange={setSaved} placeholder="0" />
        </FieldHalf>
      </div>

      <FieldLabel className="mt-4 mb-2">TARGET DATE</FieldLabel>
      <DateInput value={date} onChange={setDate} type="month" />

      {hasPreview && (
        <div className="mt-[18px] flex items-start gap-[11px] rounded-[13px] border border-primary/20 bg-primary/[0.08] px-4 py-3.5">
          <span className="mt-px text-base">✨</span>
          <div className="text-[13.5px] leading-relaxed text-foreground/90">
            Set aside <strong className="text-primary">{monthly}/mo</strong> to reach this by{" "}
            <strong>{monthYear(date)}</strong>. I&apos;ll track your pace and nudge you if you fall behind.
          </div>
        </div>
      )}

      <FooterRow
        onDelete={
          isEdit
            ? () => {
                dispatch({ t: "deleteFund", id: existing!.id });
                closeModal();
                showToast("Fund deleted");
              }
            : undefined
        }
        onCancel={closeModal}
        onSave={save}
        cta="Save fund"
      />
    </ModalShell>
  );
}
