"use client";
// A horizontal group of selectable option chips (kind/type/cadence pickers) on top of
// base-ui ToggleGroup, so arrow-key nav + roving tabindex come free. The group value is
// an array; we keep exactly one selected and ignore the empty array a deselect produces.
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function OptionChips<T extends string>({
  options,
  value,
  onChange,
  fill,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  fill?: boolean;
}) {
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(v) => {
        const next = v.find((x) => x !== value) ?? v[0];
        if (next) onChange(next as T);
      }}
      spacing={0}
      className="w-full flex-wrap gap-[7px] rounded-none"
    >
      {options.map((opt) => {
        const sel = opt === value;
        return (
          <ToggleGroupItem
            key={opt}
            value={opt}
            className={cn(
              "h-auto rounded-[10px] px-[14px] py-2 text-[12.5px] transition-colors hover:bg-secondary",
              fill && "flex-1 px-1.5",
              sel
                ? "bg-primary font-semibold text-primary-foreground hover:bg-primary hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                : "border bg-secondary font-medium text-muted-foreground"
            )}
          >
            {opt}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
