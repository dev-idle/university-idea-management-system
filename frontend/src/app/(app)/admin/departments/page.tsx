import type { Metadata } from "next";
import { Suspense } from "react";
import { Building2 } from "lucide-react";
import { DepartmentsManagement } from "@/components/features/admin/departments-management";
import { DepartmentsManagementSkeleton } from "@/components/features/admin/departments-management-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { MANAGEMENT_PAGE_SPACING, PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Department management",
  description: "Create and manage departments (admin). Backend enforces authorization.",
};

export default function AdminDepartmentsPage() {
  return (
    <div className={`${MANAGEMENT_PAGE_SPACING} ${PAGE_CONTAINER_CLASS}`}>
      <PageHeader
        title="Department management"
        description="Access control is enforced server-side. Departments may contain multiple users; deletion is permitted only when no users are assigned."
        descriptionWide
        icon={Building2}
      />
      <Suspense fallback={<DepartmentsManagementSkeleton />}>
        <DepartmentsManagement />
      </Suspense>
    </div>
  );
}
