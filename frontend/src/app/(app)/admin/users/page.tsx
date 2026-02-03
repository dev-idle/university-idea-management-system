import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminUsersManagement } from "@/components/features/admin/users-management";
import { AdminUsersTableSkeleton } from "@/components/features/admin/users-table-skeleton";

export const metadata: Metadata = {
  title: "User management",
  description: "Manage users, roles, and access. Authorization is enforced by the backend.",
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Manage institutional accounts, roles, and department assignments. Access control is enforced server-side.
        </p>
        <hr className="border-border/80" aria-hidden />
      </div>
      <Suspense fallback={<AdminUsersTableSkeleton />}>
        <AdminUsersManagement />
      </Suspense>
    </div>
  );
}
