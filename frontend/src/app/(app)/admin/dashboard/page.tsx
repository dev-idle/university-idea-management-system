import type { Metadata } from "next";
import { AdminDashboardContent } from "@/components/features/admin/dashboard";

export const metadata: Metadata = {
  title: "Administration",
  description: "Greenwich University — Administration portal. Users, departments, and academic years.",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Administration
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage users, departments, and academic years.
        </p>
      </header>
      <AdminDashboardContent />
    </div>
  );
}
