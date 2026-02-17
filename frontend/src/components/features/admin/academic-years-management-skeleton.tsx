"use client";

import { cn } from "@/lib/utils";
import {
  UNIFIED_CARD_CLASS,
  UNIFIED_CARD_TOOLBAR_CLASS,
  TABLE_HEAD_ROW_CLASS,
  SKELETON_DIVIDE_CLASS,
  SKELETON_BG_INPUT,
  SKELETON_BG_MEDIUM,
  SKELETON_BG_SUBTLE,
} from "./constants";

/** Skeleton matched to Academic Years card layout — Admin source of truth. */
export function AcademicYearsManagementSkeleton() {
  return (
    <div className={UNIFIED_CARD_CLASS}>
      <div className={UNIFIED_CARD_TOOLBAR_CLASS}>
        <div className={cn("h-9 w-72 animate-pulse rounded-lg border border-border/80", SKELETON_BG_INPUT)} />
        <div className={cn("h-9 w-28 animate-pulse rounded-lg", SKELETON_BG_MEDIUM)} />
      </div>
      <div className={`${TABLE_HEAD_ROW_CLASS} px-6 py-3.5`}>
        <div className="flex gap-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={cn("h-3.5 w-16 animate-pulse rounded", SKELETON_BG_MEDIUM)} />
          ))}
        </div>
      </div>
      <div className={cn("divide-y", SKELETON_DIVIDE_CLASS)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-8 px-6 py-4">
            <div className={cn("h-4 w-28 animate-pulse rounded", SKELETON_BG_SUBTLE)} />
            <div className={cn("h-4 w-24 animate-pulse rounded tabular-nums", SKELETON_BG_SUBTLE)} />
            <div className={cn("h-4 w-24 animate-pulse rounded tabular-nums", SKELETON_BG_SUBTLE)} />
            <div className={cn("h-6 w-16 animate-pulse rounded-full", SKELETON_BG_SUBTLE)} />
          </div>
        ))}
      </div>
    </div>
  );
}
