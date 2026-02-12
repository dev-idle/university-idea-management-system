import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarDays } from "lucide-react";
import { AcademicYearsManagement } from "@/components/features/admin/academic-years-management";
import { AcademicYearsManagementSkeleton } from "@/components/features/admin/academic-years-management-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { MANAGEMENT_PAGE_SPACING, PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Academic years",
  description:
    "Create and manage academic years. Exactly one can be active. Backend enforces authorization.",
};

export default function AdminAcademicYearsPage() {
  return (
    <div className={`${MANAGEMENT_PAGE_SPACING} ${PAGE_CONTAINER_CLASS}`}>
      <PageHeader
        title="Academic years"
        description="Configure academic years for submission cycles. Exactly one year is active at any time; permissions are enforced server-side."
        descriptionWide
        icon={CalendarDays}
      />
      <Suspense fallback={<AcademicYearsManagementSkeleton />}>
        <AcademicYearsManagement />
      </Suspense>
    </div>
  );
}
