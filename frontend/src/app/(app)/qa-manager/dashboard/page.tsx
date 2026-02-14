import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";
import { QaManagerDashboardContent } from "@/components/features/qa-manager/qa-manager-dashboard-content";
import { PageHeader } from "@/components/layout/page-header";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "QA Manager dashboard. Manage categories and submission cycles.",
};

export default function QaManagerDashboardPage() {
  return (
    <div className={`space-y-8 ${PAGE_CONTAINER_CLASS}`}>
      <PageHeader
        title="QA Manager"
        description="Manage categories and submission cycles for proposal collection. Access control is enforced server-side."
        descriptionWide
        icon={LayoutDashboard}
      />
      <QaManagerDashboardContent />
    </div>
  );
}
