import type { Metadata } from "next";
import { Suspense } from "react";
import { DepartmentsManagement } from "@/components/features/admin/departments-management";
import { DepartmentsManagementSkeleton } from "@/components/features/admin/departments-management-skeleton";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Department management",
  description: "Create and manage departments (admin). Backend enforces authorization.",
};

export default function AdminDepartmentsPage() {
  return (
    <div className={`space-y-8 ${PAGE_CONTAINER_CLASS}`}>
      <Suspense fallback={<DepartmentsManagementSkeleton />}>
        <DepartmentsManagement />
      </Suspense>
    </div>
  );
}
