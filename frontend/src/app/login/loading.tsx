import { cn } from "@/lib/utils";
import { LoadingState } from "@/components/ui/loading-state";
import { TR_LOADING_FRAME } from "@/config/design";

export default function LoginLoading() {
  return (
    <div className={cn(TR_LOADING_FRAME, "login-page-split grid min-h-screen place-items-center")}>
      <LoadingState />
    </div>
  );
}
