import type { Metadata } from "next";
import { SubmissionCyclesManagement } from "@/components/features/qa-manager/submission-cycles-management";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Proposal Cycles",
  description: "Create and manage proposal cycles linked to academic years. Backend enforces authorization.",
};

export default function QaManagerProposalCyclesPage() {
  return (
    <div className={`space-y-6 ${PAGE_CONTAINER_CLASS}`}>
      <SubmissionCyclesManagement />
    </div>
  );
}
