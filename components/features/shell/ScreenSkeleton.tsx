// Per-route loading placeholder. Mirrors the common screen shell every feature screen
// renders — a header (eyebrow + serif title + action button), a row of KPI stat tiles,
// then a couple of content cards — using the shadcn Skeleton primitive so the shimmer
// and surfaces track the active light/dark theme tokens. Each route's loading.tsx
// renders this as its Suspense fallback.
import { Skeleton } from "@/components/ui/skeleton";

export default function ScreenSkeleton({
  stats = 3,
  cards = 2,
}: {
  stats?: number;
  cards?: number;
}) {
  return (
    <div>
      {/* header: eyebrow + title + action button */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-[13px] w-28" />
          <Skeleton className="h-9 w-72 max-w-[70vw]" />
        </div>
        <Skeleton className="h-10 w-36 rounded-[10px]" />
      </div>

      {/* KPI stat tiles */}
      {stats > 0 && (
        <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-px overflow-hidden rounded-2xl border bg-border">
          {Array.from({ length: stats }).map((_, i) => (
            <div key={i} className="space-y-2 bg-card px-5 py-[18px]">
              <Skeleton className="h-[12.5px] w-24" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
      )}

      {/* content cards */}
      <div className="mt-6 space-y-4">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-2xl border bg-card p-5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
