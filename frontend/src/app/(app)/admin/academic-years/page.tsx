import type { Metadata } from "next";
import { Suspense } from "react";
import { AcademicYearsManagement } from "@/components/features/admin/academic-years-management";
import { AcademicYearsManagementSkeleton } from "@/components/features/admin/academic-years-management-skeleton";

export const metadata: Metadata = {
  title: "Academic years",
  description:
    "Create and manage academic years. Exactly one can be active. Backend enforces authorization.",
};

export default function AdminAcademicYearsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Configure academic years for submission cycles. Exactly one year is active at any time; permissions are enforced server-side.
        </p>
        <hr className="border-border/80" aria-hidden />
      </div>
      <Suspense fallback={<AcademicYearsManagementSkeleton />}>
        <AcademicYearsManagement />
      </Suspense>
    </div>
  );
}
