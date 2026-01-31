import type { Metadata } from "next";
import { Suspense } from "react";
import { DepartmentsManagement } from "@/components/features/admin/departments-management";
import { DepartmentsManagementSkeleton } from "@/components/features/admin/departments-management-skeleton";

export const metadata: Metadata = {
  title: "Department management",
  description: "Create and manage departments (admin). Backend enforces authorization.",
};

export default function AdminDepartmentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Department management</h1>
      <p className="text-sm text-muted-foreground">
        All authorization is enforced by the backend. One department can have multiple users.
      </p>
      <Suspense fallback={<DepartmentsManagementSkeleton />}>
        <DepartmentsManagement />
      </Suspense>
    </div>
  );
}
