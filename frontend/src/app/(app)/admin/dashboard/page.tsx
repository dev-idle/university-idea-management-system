import type { Metadata } from "next";
import { AdminDashboardContent } from "@/components/features/admin/dashboard";
import { MANAGEMENT_PAGE_CLASS } from "@/config/design";

export const metadata: Metadata = {
  title: "Administration",
  description: "Greenwich University — Administration portal. Users, departments, and academic years.",
};

export default function AdminDashboardPage() {
  return (
    <div className={MANAGEMENT_PAGE_CLASS}>
      <AdminDashboardContent />
    </div>
  );
}
