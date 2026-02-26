import { cn } from "@/lib/utils";
import {
  PAGE_WRAPPER_NARROW_CLASS,
  IDEAS_HUB_SPACING,
  SKELETON_BG_INPUT,
  SKELETON_BG_MEDIUM,
  SKELETON_BG_SUBTLE,
  TR_LOADING_FRAME,
} from "@/config/design";

/**
 * Route loading for Staff pages (Ideas Hub, detail, my ideas, edit).
 * Skeleton frame only — no spinner. Content shows LoadingState compact when it mounts.
 * Aligns with ManagementRouteLoading to avoid double loading.
 */
export function StaffRouteLoading() {
  return (
    <div className={cn(TR_LOADING_FRAME, IDEAS_HUB_SPACING, PAGE_WRAPPER_NARROW_CLASS)}>
      {/* Toolbar skeleton */}
      <div className="flex flex-wrap items-center gap-3">
        <div className={cn("h-9 w-28 animate-pulse rounded-xl", SKELETON_BG_INPUT)} />
        <div className={cn("h-9 w-24 animate-pulse rounded-xl", SKELETON_BG_INPUT)} />
        <div className="mx-2 h-4 w-px shrink-0 bg-border/30" aria-hidden />
        <div className={cn("h-8 w-20 animate-pulse rounded-lg", SKELETON_BG_MEDIUM)} />
        <div className={cn("h-8 w-16 animate-pulse rounded-lg", SKELETON_BG_MEDIUM)} />
      </div>
      {/* Card placeholders */}
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "overflow-hidden rounded-2xl border border-border/50 bg-card",
              "min-h-[10rem]"
            )}
          >
            <div className="flex gap-3 px-5 py-4 sm:px-6">
              <div className={cn("size-9 shrink-0 animate-pulse rounded-full", SKELETON_BG_MEDIUM)} />
              <div className="min-w-0 flex-1 space-y-2">
                <div className={cn("h-4 w-3/4 animate-pulse rounded", SKELETON_BG_MEDIUM)} />
                <div className={cn("h-3 w-1/2 animate-pulse rounded", SKELETON_BG_INPUT)} />
              </div>
            </div>
            <div className="border-t border-border/40 px-5 py-3 sm:px-6">
              <div className={cn("h-4 w-full animate-pulse rounded", SKELETON_BG_SUBTLE)} />
              <div className={cn("mt-2 h-4 w-4/5 animate-pulse rounded", SKELETON_BG_SUBTLE)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
