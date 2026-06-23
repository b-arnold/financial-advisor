"use client";
// Selectable pill / chip with active + inactive styling, with an optional leading dot.
import { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Chip({
  active,
  onClick,
  children,
  dot,
  style,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  dot?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[9px] px-[13px] py-[7px] text-[12.5px] transition-colors",
        active
          ? "bg-primary font-semibold text-primary-foreground"
          : "border bg-secondary font-medium text-muted-foreground",
        className
      )}
    >
      {dot && (
        <span
          className="size-2 rounded-full"
          style={{ background: active ? "rgba(255,255,255,.85)" : dot }}
        />
      )}
      {children}
    </button>
  );
}
