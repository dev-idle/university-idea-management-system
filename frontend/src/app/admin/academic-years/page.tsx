import type { Metadata } from "next";
import { Suspense } from "react";
import { AcademicYearsManagement } from "@/components/features/admin/academic-years-management";
import { AcademicYearsManagementSkeleton } from "@/components/features/admin/academic-years-management-skeleton";

export const metadata: Metadata = {
  title: "Academic year management",
  description:
    "Create and manage academic years. Exactly one can be active. Backend enforces authorization.",
};

export default function AdminAcademicYearsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Academic year management</h1>
      <p className="text-sm text-muted-foreground">
        All authorization is enforced by the backend. Exactly one academic year can be active; the backend enforces this.
      </p>
      <Suspense fallback={<AcademicYearsManagementSkeleton />}>
        <AcademicYearsManagement />
      </Suspense>
    </div>
  );
}
