"use client";

import { useEffect } from "react";
import { getErrorMessage, ERROR_FALLBACK } from "@/lib/errors";
import { ErrorBoundaryView } from "@/components/ui/error-boundary-view";
import { ROUTES } from "@/config/constants";
import { ERROR_PAGE_WRAPPER_CLASS } from "@/config/design";

export default function AdminUsersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={ERROR_PAGE_WRAPPER_CLASS}>
      <ErrorBoundaryView
        title="Unable to load users"
        description={getErrorMessage(error, ERROR_FALLBACK.load)}
        onRetry={reset}
        primaryLink={{ href: ROUTES.ADMIN_DASHBOARD, label: "Back to dashboard" }}
      />
    </div>
  );
}
