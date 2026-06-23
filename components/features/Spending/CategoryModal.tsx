"use client";
// Add/edit a spending category. Seeds form state from the matching category (looked up
// by id) and mutates via store dispatch. Shared composed components live in
// @/components/composed.
import { useState } from "react";
import { palette } from "@/lib/theme";
import { useStore } from "@/lib/store";
import type { Category } from "@/lib/types";
import {
  ModalShell,
  ModalHeader,
  FieldLabel,
  TextInput,
  MoneyInput,
  FooterRow,
} from "@/components/composed";

export function CategoryModal() {
  const { s, modal, dispatch, closeModal, showToast, uid } = useStore();
  const categoryId = modal.kind === "category" ? modal.categoryId : undefined;
  const existing = categoryId ? s.categories.find((x) => x.id === categoryId) : undefined;
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name ?? "");
  const [spent, setSpent] = useState(existing ? String(existing.spent) : "");
  const [color, setColor] = useState(existing?.color ?? palette[s.categories.length % palette.length]);

  const swatches = palette.slice(0, 8);

  const save = () => {
    const spentNum = Number(spent) || 0;
    const v: Category = {
      id: existing?.id ?? uid("c"),
      name: name.trim() || "Category",
      color,
      spent: spentNum,
      lastMonth: existing?.lastMonth ?? spentNum,
    };
    dispatch({ t: "upsertCategory", v });
    closeModal();
    showToast(isEdit ? "Category updated" : "Category added");
  };

  return (
    <ModalShell onClose={closeModal} maxWidth={420}>
      <ModalHeader title={isEdit ? "Edit category" : "New category"} />

      <FieldLabel className="mt-[22px] mb-2">CATEGORY NAME</FieldLabel>
      <TextInput value={name} onChange={setName} placeholder="e.g. Groceries" autoFocus />

      <FieldLabel className="mt-[18px] mb-2">SPENT THIS MONTH</FieldLabel>
      <MoneyInput value={spent} onChange={setSpent} placeholder="0" />

      <FieldLabel className="mt-5 mb-[9px]">COLOR</FieldLabel>
      <div className="flex flex-wrap gap-[9px]">
        {swatches.map((c) => {
          const sel = c === color;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="size-[34px] rounded-full"
              style={{
                background: c,
                boxShadow: sel ? `0 0 0 2px var(--card),0 0 0 4px ${c}` : undefined,
              }}
            />
          );
        })}
      </div>

      <FooterRow
        onDelete={
          isEdit
            ? () => {
                dispatch({ t: "deleteCategory", id: existing!.id });
                closeModal();
                showToast("Category removed");
              }
            : undefined
        }
        deleteLabel="Remove"
        onCancel={closeModal}
        onSave={save}
        cta={isEdit ? "Save" : "Add category"}
      />
    </ModalShell>
  );
}
