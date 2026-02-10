import type { Metadata } from "next";
import { Suspense } from "react";
import { IdeasHubContent } from "@/components/features/ideas/ideas-hub-content";
import { PAGE_WRAPPER_NARROW_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Ideas",
  description: "Formal improvement proposals for the active academic year.",
};

export default function IdeasPage() {
  return (
    <div className={`space-y-10 ${PAGE_WRAPPER_NARROW_CLASS}`}>
      <header>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
          Ideas Hub
        </h1>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground/70">
          Explore, discuss, and vote on improvement proposals
        </p>
        <div
          className="mt-4 h-px w-10 bg-gradient-to-r from-primary/80 to-transparent"
          aria-hidden
        />
      </header>

      <Suspense
        fallback={
          <div className="flex flex-col items-center py-28">
            <div className="size-7 animate-spin rounded-full border-[1.5px] border-muted-foreground/15 border-t-primary/70" />
            <p className="mt-5 text-[13px] text-muted-foreground/60">
              Loading…
            </p>
          </div>
        }
      >
        <IdeasHubContent />
      </Suspense>
    </div>
  );
}
