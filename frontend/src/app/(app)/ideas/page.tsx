import type { Metadata } from "next";
import { Suspense } from "react";
import { IdeasHubContent } from "@/components/features/ideas/ideas-hub-content";
import { LoadingState } from "@/components/ui/loading-state";
import {
  PAGE_WRAPPER_NARROW_CLASS,
  IDEAS_HUB_SPACING,
} from "@/config/design";

export const metadata: Metadata = {
  title: "Ideas",
  description: "Formal improvement proposals for the active academic year.",
};

export default function IdeasPage() {
  return (
    <div className={`${IDEAS_HUB_SPACING} ${PAGE_WRAPPER_NARROW_CLASS}`}>
      <Suspense fallback={<LoadingState />}>
        <IdeasHubContent />
      </Suspense>
    </div>
  );
}
