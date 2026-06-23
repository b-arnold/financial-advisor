"use client";
// Per-category colored progress bar on base-ui Progress, so it exposes role="progressbar"
// + aria-valuenow/min/max. The indicator auto-sizes its width from `value`; `color` is the
// arbitrary per-row fill the shadcn Progress wrapper's fixed bg-primary track can't express.
import { cn } from "@/lib/utils";
import { Progress as ProgressPrimitive } from "@base-ui/react/progress";

export function ProgressBar({
  pct,
  color,
  h = 8,
  className,
}: {
  pct: number;
  color: string;
  h?: number;
  className?: string;
}) {
  return (
    <ProgressPrimitive.Root
      value={Math.min(100, Math.max(0, pct))}
      data-slot="progress"
      className={cn("overflow-hidden rounded-md bg-foreground/[0.07]", className)}
      style={{ height: h }}
    >
      <ProgressPrimitive.Track className="size-full">
        <ProgressPrimitive.Indicator className="h-full rounded-md" style={{ background: color }} />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  );
}
