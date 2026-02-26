import type { Metadata } from "next";
import { DepartmentsManagement } from "@/components/features/admin/departments-management";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Department Management",
  description: "Create and manage departments (admin). Backend enforces authorization.",
};

export default function AdminDepartmentsPage() {
  return (
    <div className={`space-y-6 ${PAGE_CONTAINER_CLASS}`}>
      <DepartmentsManagement />
    </div>
  );
}
