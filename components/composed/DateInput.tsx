"use client";
// Date / month field over shadcn Input with the app's warm secondary styling.
import { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function DateInput({
  value,
  onChange,
  type = "date",
  style,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <Input
      value={value}
      type={type}
      onChange={(e) => onChange(e.target.value)}
      style={style}
      className={cn("h-auto w-full rounded-[11px] bg-secondary px-3.5 py-3 text-[15px]", className)}
    />
  );
}
