import type { Metadata } from "next";
import { AdminDashboardContent } from "@/components/features/admin/dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { MANAGEMENT_PAGE_SPACING, PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Administration",
  description: "Greenwich University — Administration portal. Users, departments, and academic years.",
};

export default function AdminDashboardPage() {
  return (
    <div className={`${MANAGEMENT_PAGE_SPACING} ${PAGE_CONTAINER_CLASS}`}>
      <PageHeader
        title="Administration"
        description="Manage users, departments, and academic years. Access control is enforced server-side."
        descriptionWide
      />
      <AdminDashboardContent />
    </div>
  );
}
