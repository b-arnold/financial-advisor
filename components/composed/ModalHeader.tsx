"use client";
// Modal title row with a styled close affordance. The close button (muted rounded
// square, rotated-plus glyph) is kept, but routed through DialogClose so the dialog
// owns it rather than a manual onClose call — Escape and overlay-click already close
// via ModalShell's onOpenChange.
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function ModalHeader({
  title,
  sub,
}: {
  title: string;
  sub?: string;
}) {
  return (
    <DialogHeader className="flex-row items-center justify-between gap-2 space-y-0">
      <div>
        <DialogTitle className="font-serif text-[23px] font-medium tracking-[-0.01em]">
          {title}
        </DialogTitle>
        {sub && <DialogDescription className="mt-0.5 text-[13px]">{sub}</DialogDescription>}
      </div>
      <DialogClose
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close"
            className="size-8 shrink-0 rounded-[9px] bg-muted text-muted-foreground"
          />
        }
      >
        <Icon name="plus" size={16} style={{ transform: "rotate(45deg)" }} />
      </DialogClose>
    </DialogHeader>
  );
}
