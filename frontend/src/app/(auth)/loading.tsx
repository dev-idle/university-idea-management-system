import { LoadingState } from "@/components/ui/loading-state";
import { TR_LOADING_FRAME } from "@/config/design";

/** Minimal loading — layout shows left panel; only right panel shows spinner. No layout shift. */
export default function AuthLoading() {
  return (
    <div
      className={`flex min-h-[min(24rem,60vh)] w-full max-w-[28rem] flex-1 items-center justify-center ${TR_LOADING_FRAME}`}
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingState />
    </div>
  );
}
