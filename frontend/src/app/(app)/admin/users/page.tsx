import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminUsersManagement } from "@/components/features/admin/users-management";
import { AdminUsersTableSkeleton } from "@/components/features/admin/users-table-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { MANAGEMENT_PAGE_SPACING, PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "User management",
  description: "Manage users, roles, and access. Authorization is enforced by the backend.",
};

export default function AdminUsersPage() {
  return (
    <div className={`${MANAGEMENT_PAGE_SPACING} ${PAGE_CONTAINER_CLASS}`}>
      <PageHeader
        title="User management"
        description="Manage institutional accounts, roles, and department assignments. Access control is enforced server-side."
        descriptionWide
      />
      <Suspense fallback={<AdminUsersTableSkeleton />}>
        <AdminUsersManagement />
      </Suspense>
    </div>
  );
}
