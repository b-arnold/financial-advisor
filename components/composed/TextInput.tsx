"use client";
// Labelled text field over shadcn Input with the app's warm secondary styling.
import { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  autoFocus,
  style,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <Input
      value={value}
      autoFocus={autoFocus}
      type={type}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={style}
      className={cn("h-auto rounded-[11px] bg-secondary px-3.5 py-3 text-[15px] font-medium", className)}
    />
  );
}
