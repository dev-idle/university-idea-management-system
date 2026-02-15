"use client";

import {
  UNIFIED_CARD_CLASS,
  UNIFIED_CARD_TOOLBAR_CLASS,
  TABLE_HEAD_ROW_CLASS,
} from "@/components/features/admin/constants";

/** Skeleton matched to Categories unified card layout — Admin source of truth. */
export function CategoriesManagementSkeleton() {
  return (
    <div className={UNIFIED_CARD_CLASS}>
      <div className={UNIFIED_CARD_TOOLBAR_CLASS}>
        <div className="h-9 w-72 animate-pulse rounded-lg border border-border bg-muted/10" />
        <div className="h-9 w-28 animate-pulse rounded-lg bg-muted/40" />
      </div>
      <div className={`${TABLE_HEAD_ROW_CLASS} px-6 py-3.5`}>
        <div className="flex gap-8">
          <div className="h-3.5 w-16 animate-pulse rounded bg-muted/40" />
          <div className="h-3.5 w-16 animate-pulse rounded bg-muted/40" />
        </div>
      </div>
      <div className="divide-y divide-border/60">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-8 px-6 py-4">
            <div className="h-4 w-28 animate-pulse rounded bg-muted/25" />
            <div className="h-8 w-16 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
