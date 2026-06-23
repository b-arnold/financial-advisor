"use client";
// Currency field: a leading $ glyph + bare numeric input in the warm secondary shell.
// Not a shadcn Input (it's a composed row), so it lives as its own component.
import { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function MoneyInput({
  value,
  onChange,
  placeholder = "0",
  style,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center rounded-[11px] border bg-secondary px-3", className)}
      style={style}
    >
      <span className="text-[15px] text-muted-foreground">$</span>
      <input
        value={value}
        type="number"
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-none bg-transparent px-1.5 py-3 text-[15px] text-foreground outline-none"
      />
    </div>
  );
}
