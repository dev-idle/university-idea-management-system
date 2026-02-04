import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { MANAGEMENT_PAGE_SPACING, PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "QA Coordinator",
  description: "QA Coordinator dashboard.",
};

export default function QaCoordinatorDashboardPage() {
  return (
    <div className={`${MANAGEMENT_PAGE_SPACING} ${PAGE_CONTAINER_CLASS}`}>
      <PageHeader
        title="QA Coordinator"
        description="QA Coordinator dashboard. Access control is enforced server-side."
        descriptionWide
      />
    </div>
  );
}
