import { redirect } from "next/navigation";
import { ROUTES } from "@/config/constants";

/** QA Coordinator entry route: single dashboard. */
export default function QaCoordinatorPage() {
  redirect(ROUTES.QA_COORDINATOR_DASHBOARD);
}
