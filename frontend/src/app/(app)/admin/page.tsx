import { redirect } from "next/navigation";
import { ROUTES } from "@/config/constants";

/** Admin entry route: single dashboard. Redirect /admin to /admin/dashboard. */
export default function AdminPage() {
  redirect(ROUTES.ADMIN_DASHBOARD);
}
