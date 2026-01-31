"use cache";

import { DashboardAdminLink } from "./dashboard-admin-link";

/**
 * Dashboard: stable content with 'use cache'. Dynamic links (e.g. Admin) are client.
 */

export async function DashboardContent() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="text-muted-foreground">
        Use TanStack Query for dynamic data; role-based links are UX-only (backend enforces).
      </p>
      <div className="flex gap-4">
        <DashboardAdminLink />
      </div>
    </div>
  );
}
