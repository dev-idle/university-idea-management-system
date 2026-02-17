import type { Metadata } from "next";
import { Suspense } from "react";
import { IdeasHubContent } from "@/components/features/ideas/ideas-hub-content";
import { LoadingState } from "@/components/ui/loading-state";
import {
  PAGE_WRAPPER_NARROW_CLASS,
  PAGE_TITLE_CLASS,
  STAFF_DESCRIPTION_CLASS,
  STAFF_HEADER_ACCENT_CLASS,
} from "@/config/design";

export const metadata: Metadata = {
  title: "Ideas",
  description: "Formal improvement proposals for the active academic year.",
};

export default function IdeasPage() {
  return (
    <div className={`space-y-10 ${PAGE_WRAPPER_NARROW_CLASS}`}>
      <header>
        <h1 className={PAGE_TITLE_CLASS}>Ideas Hub</h1>
        <p className={STAFF_DESCRIPTION_CLASS}>
          Explore, discuss, and vote on improvement proposals
        </p>
        <div className={`mt-4 ${STAFF_HEADER_ACCENT_CLASS}`} aria-hidden />
      </header>

      <Suspense
        fallback={
          <div className="flex flex-col items-center py-28">
            <LoadingState message="Loading…" />
          </div>
        }
      >
        <IdeasHubContent />
      </Suspense>
    </div>
  );
}
