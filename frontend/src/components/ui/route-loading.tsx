import { cn } from "@/lib/utils";
import { LoadingState } from "@/components/ui/loading-state";
import { PAGE_CONTAINER_CLASS, TR_LOADING_FRAME } from "@/config/design";

/** Shared route loading. Used by (app)/loading.tsx (dashboard, ideas, profile). */
export function RouteLoading() {
  return (
    <div className={cn(TR_LOADING_FRAME, PAGE_CONTAINER_CLASS)}>
      <LoadingState />
    </div>
  );
}
