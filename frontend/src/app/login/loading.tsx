import { cn } from "@/lib/utils";
import { SKELETON_BG_MEDIUM, SKELETON_BG_SUBTLE, SKELETON_BG_INPUT } from "@/config/design";

export default function LoginLoading() {
  return (
    <div className="login-page-bg grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-[28rem] space-y-8 sm:max-w-[32rem]">
        <div className={cn("mx-auto h-14 w-32 animate-pulse rounded-xl", SKELETON_BG_MEDIUM)} />
        <div className={cn("h-11 w-full animate-pulse rounded-xl border border-border/80", SKELETON_BG_INPUT)} />
        <div className={cn("h-11 w-full animate-pulse rounded-xl border border-border/80", SKELETON_BG_INPUT)} />
        <div className={cn("h-11 w-full animate-pulse rounded-xl", SKELETON_BG_SUBTLE)} />
      </div>
    </div>
  );
}
