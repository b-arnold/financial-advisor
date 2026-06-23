"use client";
// Single-select list of entity rows (payment debt / contribution fund pickers) on
// base-ui RadioGroup, so it announces as a single-choice group with arrow-key nav.
// PickerRow must be rendered inside a PickerGroup, so the pair lives together here.
import { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { RadioGroup } from "@/components/ui/radio-group";
import { Radio } from "@base-ui/react/radio";

export function PickerGroup<T extends string>({
  value,
  onChange,
  children,
}: {
  value: T;
  onChange: (v: T) => void;
  children: ReactNode;
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as T)}
      className="flex flex-col gap-[7px]"
    >
      {children}
    </RadioGroup>
  );
}

// One selectable entity row. Selected state is base-ui's `data-checked`, styled via
// Tailwind data-variants. The per-row color is passed as a CSS custom property so the
// active border + dot can use it without JS.
export function PickerRow({
  value,
  color,
  label,
  sub,
}: {
  value: string;
  color: string;
  label: string;
  sub: string;
}) {
  return (
    <Radio.Root
      value={value}
      style={{ "--row-color": color } as CSSProperties}
      className={cn(
        "group/row flex items-center gap-[11px] rounded-xl border bg-secondary px-[13px] py-[11px] text-left transition-colors outline-none",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        "data-checked:border-2 data-checked:border-(--row-color) data-checked:bg-card"
      )}
    >
      <span
        className="size-2.5 flex-none rounded-full opacity-50 transition-opacity group-data-checked/row:opacity-100"
        style={{ background: color }}
      />
      <span className="flex-1 text-sm font-medium text-foreground/80 group-data-checked/row:font-semibold group-data-checked/row:text-foreground">
        {label}
      </span>
      <span className="tnum text-[12.5px] text-muted-foreground/70 group-data-checked/row:text-muted-foreground">
        {sub}
      </span>
    </Radio.Root>
  );
}
