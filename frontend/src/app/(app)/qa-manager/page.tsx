import { redirect } from "next/navigation";
import { ROUTES } from "@/config/constants";

/** QA Manager entry route: single dashboard. */
export default function QaManagerPage() {
  redirect(ROUTES.QA_MANAGER_DASHBOARD);
}
