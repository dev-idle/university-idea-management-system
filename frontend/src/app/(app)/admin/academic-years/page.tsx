import type { Metadata } from "next";
import { Suspense } from "react";
import { AcademicYearsManagement } from "@/components/features/admin/academic-years-management";
import { LoadingState } from "@/components/ui/loading-state";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Academic Years",
  description:
    "Create and manage academic years. Exactly one can be active. Backend enforces authorization.",
};

export default function AdminAcademicYearsPage() {
  return (
    <div className={`space-y-6 ${PAGE_CONTAINER_CLASS}`}>
      <Suspense fallback={<LoadingState />}>
        <AcademicYearsManagement />
      </Suspense>
    </div>
  );
}
