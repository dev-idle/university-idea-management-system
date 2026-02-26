import type { Metadata } from "next";
import { AdminUsersManagement } from "@/components/features/admin/users-management";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage users, roles, and access. Authorization is enforced by the backend.",
};

export default function AdminUsersPage() {
  return (
    <div className={`space-y-6 ${PAGE_CONTAINER_CLASS}`}>
      <AdminUsersManagement />
    </div>
  );
}
