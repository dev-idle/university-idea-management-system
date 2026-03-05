import type { Metadata } from "next";
import { AcademicYearsManagement } from "@/components/features/admin/academic-years-management";
import { MANAGEMENT_PAGE_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Academic Years",
  description:
    "Create and manage academic years. Exactly one can be active. Backend enforces authorization.",
};

export default function AdminAcademicYearsPage() {
  return (
    <div className={MANAGEMENT_PAGE_CLASS}>
      <AcademicYearsManagement />
    </div>
  );
}
