import type { Metadata } from "next";
import { Suspense } from "react";
import { AcademicYearsManagement } from "@/components/features/admin/academic-years-management";
import { AcademicYearsManagementSkeleton } from "@/components/features/admin/academic-years-management-skeleton";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Academic years",
  description:
    "Create and manage academic years. Exactly one can be active. Backend enforces authorization.",
};

export default function AdminAcademicYearsPage() {
  return (
    <div className={`space-y-6 ${PAGE_CONTAINER_CLASS}`}>
      <Suspense fallback={<AcademicYearsManagementSkeleton />}>
        <AcademicYearsManagement />
      </Suspense>
    </div>
  );
}
