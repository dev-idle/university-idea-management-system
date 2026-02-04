import type { Metadata } from "next";
import { Suspense } from "react";
import { SubmissionCyclesManagement } from "@/components/features/qa-manager/submission-cycles-management";
import { SubmissionCyclesManagementSkeleton } from "@/components/features/qa-manager/submission-cycles-management-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { MANAGEMENT_PAGE_SPACING, PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Submission Cycles",
  description:
    "Create and manage idea submission cycles linked to an academic year. Defines closure times for ideas, comments, and votes. One ACTIVE cycle at a time; export (CSV/ZIP) only after a cycle is CLOSED.",
};

export default function QaManagerSubmissionCyclesPage() {
  return (
    <div className={`${MANAGEMENT_PAGE_SPACING} ${PAGE_CONTAINER_CLASS}`}>
      <PageHeader
        title="Submission cycles"
        description="Create and manage proposal submission cycles. Each cycle is linked to an academic year and defines closure times for submissions, comments, and votes. Only one cycle can be ACTIVE at a time. Export (CSV/ZIP) is available only after a cycle is CLOSED."
        descriptionWide
      />
      <Suspense fallback={<SubmissionCyclesManagementSkeleton />}>
        <SubmissionCyclesManagement />
      </Suspense>
    </div>
  );
}
