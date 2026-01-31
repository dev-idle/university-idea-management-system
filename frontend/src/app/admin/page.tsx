import type { Metadata } from "next";
import Link from "next/link";
import { Can } from "@/components/ui/can";
import { ROUTES } from "@/config/constants";

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin area. Backend enforces all authorization.",
};

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Admin</h1>
      <p className="text-sm text-muted-foreground">
        All authorization is enforced by the backend. Links below are shown only for UX (permission-based).
      </p>
      <ul className="list-inside list-disc space-y-2 text-sm">
        <Can permission="USERS">
          <li>
            <Link
              href={ROUTES.ADMIN_USERS}
              className="text-primary hover:underline"
            >
              User management
            </Link>
          </li>
        </Can>
        <Can permission="DEPARTMENTS">
          <li>
            <Link
              href={ROUTES.ADMIN_DEPARTMENTS}
              className="text-primary hover:underline"
            >
              Department management
            </Link>
          </li>
        </Can>
        <Can permission="ACADEMIC_YEARS">
          <li>
            <Link
              href={ROUTES.ADMIN_ACADEMIC_YEARS}
              className="text-primary hover:underline"
            >
              Academic year management
            </Link>
          </li>
        </Can>
      </ul>
    </div>
  );
}
