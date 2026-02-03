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
      <div className="space-y-2">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Access control is enforced server-side. Departments may contain multiple users; deletion is permitted only when no users are assigned.
        </p>
        <hr className="border-border/80" aria-hidden />
      </div>
      <Suspense fallback={<DepartmentsManagementSkeleton />}>
        <DepartmentsManagement />
      </Suspense>
    </div>
  );
}
