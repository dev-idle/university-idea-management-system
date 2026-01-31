"use client";

import Link from "next/link";
import { Can } from "@/components/ui/can";
import { ROUTES } from "@/config/constants";

/** UX-only: show Admin link when user has USERS permission. Backend enforces access. */
export function DashboardAdminLink() {
  return (
    <Can permission="USERS">
      <Link
        href={ROUTES.ADMIN_USERS}
        className="text-sm font-medium text-primary hover:underline"
      >
        User management →
      </Link>
    </Can>
  );
}
