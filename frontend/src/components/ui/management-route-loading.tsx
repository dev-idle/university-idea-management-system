import { cn } from "@/lib/utils";
import {
  PAGE_CONTAINER_CLASS,
  SKELETON_BG_INPUT,
  SKELETON_BG_MEDIUM,
  TR_LOADING_FRAME,
} from "@/config/design";
import {
  UNIFIED_CARD_CLASS,
  UNIFIED_CARD_TOOLBAR_CLASS,
} from "@/components/features/admin/constants";

/**
 * Route loading: frame (card + toolbar) only. No spinner — component will show
 * LoadingState when it mounts and fetches. Avoids "frame loads → content loads" double loading.
 */
export function ManagementRouteLoading() {
  return (
    <div className={cn(TR_LOADING_FRAME, "space-y-6", PAGE_CONTAINER_CLASS)}>
      <div className={UNIFIED_CARD_CLASS}>
        <div className={UNIFIED_CARD_TOOLBAR_CLASS}>
          <div className={cn("h-9 w-72 animate-pulse rounded-lg border border-border/80", SKELETON_BG_INPUT)} />
          <div className={cn("h-9 w-28 animate-pulse rounded-lg", SKELETON_BG_MEDIUM)} />
        </div>
        <div className="min-h-[5rem]" aria-hidden />
      </div>
    </div>
  );
}
