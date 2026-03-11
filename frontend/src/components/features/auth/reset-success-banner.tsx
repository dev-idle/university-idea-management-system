"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { FORM_SUCCESS_BLOCK_CLASS } from "@/components/features/admin/constants";

/**
 * Shows success message when redirected from reset-password with ?reset=success.
 */
export function ResetSuccessBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get("reset") !== "success") return null;

  return (
    <div
      className={"mb-4 flex items-center gap-3 " + FORM_SUCCESS_BLOCK_CLASS}
      role="status"
    >
      <CheckCircle className="size-5 shrink-0" aria-hidden />
      <p>Password reset successfully. Please sign in with your new password.</p>
    </div>
  );
}
