import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminUsersManagement } from "@/components/features/admin/users-management";
import { AdminUsersTableSkeleton } from "@/components/features/admin/users-table-skeleton";

export const metadata: Metadata = {
  title: "User management",
  description: "Manage users and roles (admin). Backend enforces authorization.",
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">User management</h1>
      <p className="text-sm text-muted-foreground">
        All authorization and validation are enforced by the backend. Role handling here is UX only.
      </p>
      <Suspense fallback={<AdminUsersTableSkeleton />}>
        <AdminUsersManagement />
      </Suspense>
    </div>
  );
}
