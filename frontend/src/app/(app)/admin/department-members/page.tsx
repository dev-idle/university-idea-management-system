import type { Metadata } from "next";
import { AdminDepartmentMembersContent } from "@/components/features/admin/admin-department-members-content";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Department Members",
  description: "View users in each department. Admin only.",
};

export default function AdminDepartmentMembersPage() {
  return (
    <div className={`space-y-6 ${PAGE_CONTAINER_CLASS}`}>
      <AdminDepartmentMembersContent />
    </div>
  );
}
