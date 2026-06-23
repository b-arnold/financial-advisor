"use client";
// Account & profile panel reachable from the shell. Edits the user's name/email, picks
// the appearance theme, and lists/manages people with access. Shared composed
// components live in @/components/composed.
import { Icon } from "@/components/Icon";
import { useStore } from "@/lib/store";
import { initialOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModalShell, ModalHeader, FieldLabel, TextInput, FieldHalf } from "@/components/composed";

export function ProfilePanel() {
  const { s, dispatch, closeModal, openModal, setTheme } = useStore();
  const themes: { id: "light" | "dark" | "system"; label: string; icon: "sun" | "moon" | "monitor" }[] = [
    { id: "light", label: "Light", icon: "sun" },
    { id: "dark", label: "Dark", icon: "moon" },
    { id: "system", label: "System", icon: "monitor" },
  ];

  return (
    <ModalShell onClose={closeModal} maxWidth={520}>
      <ModalHeader title="Account & profile" />

      <div className="mt-[22px] flex items-center gap-[15px]">
        <div className="flex size-[58px] flex-none items-center justify-center rounded-full bg-gradient-to-br from-brand-warm to-brand-warm-soft text-2xl font-semibold text-white">
          {initialOf(s.userName)}
        </div>
        <div>
          <div className="text-[17px] font-semibold text-foreground">{s.userName}</div>
          <div className="text-[13px] text-muted-foreground">{s.profileEmail}</div>
          <Badge className="mt-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold tracking-[0.04em] text-primary uppercase">
            Owner
          </Badge>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <FieldHalf>
          <FieldLabel className="m-0 mb-2">FULL NAME</FieldLabel>
          <TextInput value={s.userName} onChange={(v) => dispatch({ t: "set", patch: { userName: v } })} />
        </FieldHalf>
        <FieldHalf>
          <FieldLabel className="m-0 mb-2">EMAIL</FieldLabel>
          <TextInput value={s.profileEmail} onChange={(v) => dispatch({ t: "set", patch: { profileEmail: v } })} type="email" />
        </FieldHalf>
      </div>

      <FieldLabel className="mt-6 mb-2">APPEARANCE</FieldLabel>
      <div className="grid grid-cols-3 gap-2">
        {themes.map((th) => {
          const sel = s.theme === th.id;
          return (
            <button
              key={th.id}
              type="button"
              onClick={() => setTheme(th.id)}
              className={cn(
                "flex flex-col items-center gap-[7px] rounded-xl px-2 py-3.5 transition-colors",
                sel ? "border-2 border-primary bg-card text-foreground" : "border bg-secondary text-muted-foreground"
              )}
            >
              <Icon name={th.icon} size={20} strokeWidth={2} />
              <span className={cn("text-[12.5px]", sel ? "font-semibold" : "font-medium")}>{th.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mx-0 mt-[26px] mb-1 flex items-baseline justify-between">
        <div className="font-serif text-lg font-medium">People with access</div>
        <span className="text-[12.5px] text-muted-foreground">{s.members.length} invited</span>
      </div>
      <div className="flex flex-col">
        {s.members.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => openModal({ kind: "member", memberId: m.id })}
            className="flex w-full items-center gap-[13px] border-t border-border/60 px-0.5 py-3 text-left first:border-t-0"
          >
            <div
              className="flex size-[38px] flex-none items-center justify-center rounded-full text-[15px] font-semibold text-white"
              style={{ background: m.color }}
            >
              {initialOf(m.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14.5px] font-medium text-foreground">{m.name}</div>
              <div className="text-xs text-muted-foreground/70">{m.email}</div>
            </div>
            <span className="rounded-md border bg-secondary px-[9px] py-[3px] text-[11.5px] font-semibold text-muted-foreground">
              {m.role}
            </span>
            <Icon name="chevronRight" size={16} strokeWidth={2.2} style={{ flex: "none" }} className="text-muted-foreground/60" />
          </button>
        ))}
      </div>
      <Button
        onClick={() => openModal({ kind: "member" })}
        className="mt-4 h-auto w-full gap-[7px] rounded-xl p-3 text-sm font-semibold"
      >
        <Icon name="plus" size={16} strokeWidth={2.4} />
        Add a user
      </Button>
    </ModalShell>
  );
}
