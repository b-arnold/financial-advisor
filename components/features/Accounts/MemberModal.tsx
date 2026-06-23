"use client";
// Invite/edit a person with access. Seeds form state from the matching member (looked
// up by id) and mutates via store dispatch. Shared composed components live in
// @/components/composed.
import { useState } from "react";
import { palette } from "@/lib/theme";
import { Icon } from "@/components/Icon";
import { useStore } from "@/lib/store";
import type { Member } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RadioGroup } from "@/components/ui/radio-group";
import { Radio } from "@base-ui/react/radio";
import { ModalShell, ModalHeader, FieldLabel, TextInput, FooterRow } from "@/components/composed";

export function MemberModal() {
  const { s, modal, dispatch, closeModal, showToast, uid } = useStore();
  const memberId = modal.kind === "member" ? modal.memberId : undefined;
  const existing = memberId ? s.members.find((x) => x.id === memberId) : undefined;
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [role, setRole] = useState<Member["role"]>(existing?.role ?? "Editor");

  const roleOptions: { id: Member["role"]; label: string; desc: string }[] = [
    { id: "Owner", label: "Owner", desc: "Full access, billing, and can manage people." },
    { id: "Editor", label: "Editor", desc: "Can add and edit transactions, debts, and funds." },
    { id: "Viewer", label: "Viewer", desc: "Can view everything but not make changes." },
  ];

  const save = () => {
    const v: Member = {
      id: existing?.id ?? uid("m"),
      name: name.trim() || "New member",
      email: email.trim(),
      role,
      color: existing?.color ?? palette[s.members.length % palette.length],
    };
    dispatch({ t: "upsertMember", v });
    closeModal();
    showToast(isEdit ? "Member updated" : "Invite sent");
  };

  return (
    <ModalShell onClose={closeModal} maxWidth={440} z={110}>
      <ModalHeader title={isEdit ? "Edit person" : "Add a user"} />

      <FieldLabel className="mt-[22px] mb-2">FULL NAME</FieldLabel>
      <TextInput value={name} onChange={setName} placeholder="e.g. Jordan Chen" autoFocus />

      <FieldLabel className="mt-[18px] mb-2">EMAIL</FieldLabel>
      <TextInput value={email} onChange={setEmail} type="email" placeholder="name@email.com" />

      <FieldLabel className="mt-5 mb-[9px]">ROLE</FieldLabel>
      <RadioGroup value={role} onValueChange={(v) => setRole(v as Member["role"])} className="flex flex-col gap-2">
        {roleOptions.map((r) => (
          <Radio.Root
            key={r.id}
            value={r.id}
            className={cn(
              "group/role flex items-center gap-[11px] rounded-xl border bg-secondary px-3.5 py-3 text-left transition-colors outline-none",
              "focus-visible:ring-3 focus-visible:ring-ring/50",
              "data-checked:border-2 data-checked:border-primary data-checked:bg-card"
            )}
          >
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground/80 group-data-checked/role:font-semibold group-data-checked/role:text-foreground">
                {r.label}
              </div>
              <div className="text-xs text-muted-foreground/70 group-data-checked/role:text-muted-foreground">{r.desc}</div>
            </div>
            <span className="flex size-[18px] flex-none items-center justify-center rounded-full border-[1.5px] border-foreground/15 group-data-checked/role:border-0 group-data-checked/role:bg-primary">
              <Icon name="check" size={11} strokeWidth={3} style={{ color: "#fff" }} className="hidden group-data-checked/role:block" />
            </span>
          </Radio.Root>
        ))}
      </RadioGroup>

      <FooterRow
        onDelete={
          isEdit
            ? () => {
                dispatch({ t: "deleteMember", id: existing!.id });
                closeModal();
                showToast("Member removed");
              }
            : undefined
        }
        deleteLabel="Remove"
        onCancel={closeModal}
        onSave={save}
        cta={isEdit ? "Save" : "Send invite"}
      />
    </ModalShell>
  );
}
