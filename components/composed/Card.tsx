"use client";
// The app's warm raised card baseline over shadcn Card — rounder corners, no shadow,
// and a secondary (sunken) variant. The warm/serif look lives in globals.css.
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Card as ShadCard } from "@/components/ui/card";

export function Card({
  children,
  raised = true,
  className,
  ...props
}: {
  raised?: boolean;
} & ComponentProps<typeof ShadCard>) {
  return (
    <ShadCard
      className={cn(
        "gap-0 rounded-[18px] border p-6 shadow-none",
        raised ? "bg-card" : "bg-secondary",
        className
      )}
      {...props}
    >
      {children}
    </ShadCard>
  );
}
