import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminUsersManagement } from "@/components/features/admin/users-management";
import { AdminUsersTableSkeleton } from "@/components/features/admin/users-table-skeleton";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "User management",
  description: "Manage users, roles, and access. Authorization is enforced by the backend.",
};

export default function AdminUsersPage() {
  return (
    <div className={`space-y-8 ${PAGE_CONTAINER_CLASS}`}>
      <Suspense fallback={<AdminUsersTableSkeleton />}>
        <AdminUsersManagement />
      </Suspense>
    </div>
  );
}
