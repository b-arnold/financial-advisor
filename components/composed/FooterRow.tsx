"use client";
// Cancel / save (+ optional destructive) footer used by every form modal.
import { Button } from "@/components/ui/button";

export function FooterRow({
  onDelete,
  deleteLabel,
  onCancel,
  onSave,
  cta,
}: {
  onDelete?: () => void;
  deleteLabel?: string;
  onCancel: () => void;
  onSave: () => void;
  cta: string;
}) {
  return (
    <div className="mt-[26px] flex items-center gap-2.5">
      {onDelete && (
        <Button
          variant="ghost"
          onClick={onDelete}
          className="h-auto px-1 py-[11px] text-[13.5px] font-medium text-destructive hover:bg-transparent hover:text-destructive/80"
        >
          {deleteLabel ?? "Delete"}
        </Button>
      )}
      <Button
        variant="outline"
        onClick={onCancel}
        className="ml-auto h-auto rounded-[11px] border-foreground/15 bg-transparent px-5 py-[11px] text-sm font-medium text-foreground/80"
      >
        Cancel
      </Button>
      <Button onClick={onSave} className="h-auto rounded-[11px] px-[22px] py-[11px] text-sm font-semibold">
        {cta}
      </Button>
    </div>
  );
}
