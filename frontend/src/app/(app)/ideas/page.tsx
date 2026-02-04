import type { Metadata } from "next";
import { Suspense } from "react";
import { IdeasHubContent } from "@/components/features/ideas/ideas-hub-content";
import { PageHeader } from "@/components/layout/page-header";
import { LOADING_WRAPPER_CLASS, LOADING_TEXT_CLASS, PAGE_WRAPPER_NARROW_CLASS, STAFF_PAGE_SPACING } from "@/config/design";

export const metadata: Metadata = {
  title: "Ideas",
  description:
    "Formal improvement proposals for the active academic year. Proposals may be submitted when a submission cycle is open; discussion is intended for clarification and constructive feedback. Terms and anonymity options apply.",
};

function IdeasHubFallback() {
  return (
    <div className={LOADING_WRAPPER_CLASS}>
      <p className={LOADING_TEXT_CLASS} aria-live="polite">
        Loading…
      </p>
    </div>
  );
}

export default function IdeasPage() {
  return (
    <div className={`${STAFF_PAGE_SPACING} ${PAGE_WRAPPER_NARROW_CLASS}`}>
      <PageHeader
        title="Ideas Hub"
        description="View and submit improvement proposals for the active academic year. When a submission cycle is open, new proposals may be submitted; discussion is intended for clarification and constructive feedback."
      />
      <Suspense fallback={<IdeasHubFallback />}>
        <IdeasHubContent />
      </Suspense>
    </div>
  );
}
