"use client";

import {
  UNIFIED_CARD_CLASS,
  UNIFIED_CARD_TOOLBAR_CLASS,
  TABLE_HEAD_ROW_CLASS,
} from "@/components/features/admin/constants";

/** Skeleton matched to Submission Cycles unified card layout — Admin source of truth. */
export function SubmissionCyclesManagementSkeleton() {
  return (
    <div className={UNIFIED_CARD_CLASS}>
      <div className={UNIFIED_CARD_TOOLBAR_CLASS}>
        <div className="h-9 w-72 animate-pulse rounded-lg border border-border bg-muted/10" />
        <div className="h-9 w-28 animate-pulse rounded-lg bg-muted/40" />
      </div>
      <div className={`${TABLE_HEAD_ROW_CLASS} px-6 py-3.5`}>
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-3.5 w-14 animate-pulse rounded bg-muted/40" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border/60">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 px-6 py-4">
            <div className="h-4 w-24 animate-pulse rounded bg-muted/25" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted/25" />
            <div className="h-6 w-14 animate-pulse rounded-full bg-muted/25" />
            <div className="h-4 w-28 animate-pulse rounded tabular-nums bg-muted/25" />
            <div className="h-4 w-28 animate-pulse rounded tabular-nums bg-muted/25" />
            <div className="h-4 w-8 animate-pulse rounded bg-muted/25" />
          </div>
        ))}
      </div>
    </div>
  );
}
