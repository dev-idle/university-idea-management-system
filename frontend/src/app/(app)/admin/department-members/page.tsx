import type { Metadata } from "next";
import { AdminDepartmentMembersContent } from "@/components/features/admin/admin-department-members-content";
import { MANAGEMENT_PAGE_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Department Members",
  description: "View users in each department. Admin only.",
};

export default function AdminDepartmentMembersPage() {
  return (
    <div className={MANAGEMENT_PAGE_CLASS}>
      <AdminDepartmentMembersContent />
    </div>
  );
}
