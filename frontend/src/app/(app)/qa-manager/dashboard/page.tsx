import type { Metadata } from "next";
import { QaManagerDashboardContent } from "@/components/features/qa-manager/qa-manager-dashboard-content";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "QA Manager dashboard. Manage categories and proposal cycles.",
};

export default function QaManagerDashboardPage() {
  return (
    <div className={PAGE_CONTAINER_CLASS}>
      <QaManagerDashboardContent />
    </div>
  );
}
