"use client";
// Uppercase section caption above a field or group inside the modals. Not a form
// control <label> — it's a styled caption, so it stays distinct from shadcn's Label.
import { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FieldLabel({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-5 mb-2 text-xs font-semibold tracking-[0.02em] text-muted-foreground",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
