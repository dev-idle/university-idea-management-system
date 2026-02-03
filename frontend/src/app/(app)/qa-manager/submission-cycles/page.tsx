import type { Metadata } from "next";
import { Suspense } from "react";
import { SubmissionCyclesManagement } from "@/components/features/qa-manager/submission-cycles-management";
import { SubmissionCyclesManagementSkeleton } from "@/components/features/qa-manager/submission-cycles-management-skeleton";

export const metadata: Metadata = {
  title: "Submission Cycles",
  description:
    "Create and manage idea submission cycles linked to an academic year. Defines closure times for ideas, comments, and votes. One ACTIVE cycle at a time; export (CSV/ZIP) only after a cycle is CLOSED.",
};

export default function QaManagerSubmissionCyclesPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Create and manage idea submission cycles. Each cycle is linked to an academic year and defines closure times for ideas, comments, and votes. Only one cycle can be ACTIVE at a time. Export (CSV/ZIP) is allowed only after a cycle is CLOSED.
        </p>
        <hr className="border-border/80" aria-hidden />
      </div>
      <Suspense fallback={<SubmissionCyclesManagementSkeleton />}>
        <SubmissionCyclesManagement />
      </Suspense>
    </div>
  );
}
