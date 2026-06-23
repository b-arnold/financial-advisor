"use client";
// Controlled modal shell on top of shadcn Dialog. Called imperatively by the modals
// (open=true, onClose to dismiss); backdrop blur, focus trap, and escape handling
// come from the Dialog primitive.
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function ModalShell({
  onClose,
  maxWidth = 440,
  z = 100,
  children,
  className,
}: {
  onClose: () => void;
  maxWidth?: number;
  z?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        style={{ maxWidth, zIndex: z }}
        className={cn(
          "appscroll block max-h-[92vh] w-full overflow-y-auto rounded-[22px] bg-card p-[26px] text-foreground shadow-[0_36px_70px_-22px_rgba(0,0,0,0.45)]",
          className
        )}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
