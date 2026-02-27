import type { Metadata } from "next";
import { QaCoordinatorDashboardContent } from "@/components/features/qa-coordinator/qa-coordinator-dashboard-content";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "QA Coordinator dashboard. Browse ideas and view department members.",
};

export default function QaCoordinatorDashboardPage() {
  return (
    <div className={`space-y-8 ${PAGE_CONTAINER_CLASS}`}>
      <QaCoordinatorDashboardContent />
    </div>
  );
}
