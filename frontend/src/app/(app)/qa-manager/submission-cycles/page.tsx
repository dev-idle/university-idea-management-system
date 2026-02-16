import { redirect } from "next/navigation";
import { ROUTES } from "@/config/constants";

/** Redirect legacy route to new canonical path. */
export default function SubmissionCyclesRedirect() {
  redirect(ROUTES.QA_MANAGER_PROPOSAL_CYCLES);
}
