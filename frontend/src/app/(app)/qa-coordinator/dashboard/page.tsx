import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "QA Coordinator",
  description: "QA Coordinator dashboard.",
};

export default function QaCoordinatorDashboardPage() {
  return (
    <div className={`space-y-8 ${PAGE_CONTAINER_CLASS}`}>
      <PageHeader
        title="QA Coordinator"
        description="QA Coordinator dashboard. Access control is enforced server-side."
        descriptionWide
        icon={ClipboardList}
      />
    </div>
  );
}
