"use client";
// Dashed "add" button used at the bottom of lists.
import { ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AddRowBtn({
  onClick,
  children,
  className,
}: {
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn(
        "mt-[18px] h-auto w-full gap-1.5 rounded-[11px] border border-dashed border-foreground/20 bg-secondary p-[11px] text-[13.5px] font-semibold text-foreground/80",
        className
      )}
    >
      <Icon name="plus" size={15} strokeWidth={2.2} />
      {children}
    </Button>
  );
}
