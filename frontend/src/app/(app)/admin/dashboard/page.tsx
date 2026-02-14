import type { Metadata } from "next";
import { AdminDashboardContent } from "@/components/features/admin/dashboard";
import { PAGE_CONTAINER_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Administration",
  description: "Greenwich University — Administration portal. Users, departments, and academic years.",
};

export default function AdminDashboardPage() {
  return (
    <div className={`space-y-8 ${PAGE_CONTAINER_CLASS}`}>
      <AdminDashboardContent />
    </div>
  );
}
