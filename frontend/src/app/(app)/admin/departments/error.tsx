"use client";

import { useEffect } from "react";
import { getErrorMessage } from "@/lib/errors";
import { ErrorBoundaryView } from "@/components/ui/error-boundary-view";
import { ROUTES } from "@/config/constants";

export default function AdminDepartmentsError({
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
    <ErrorBoundaryView
      title="Unable to load departments"
      description={getErrorMessage(
        error,
        "The request failed. You may not have permission, or the service may be unavailable."
      )}
      onRetry={reset}
      primaryLink={{ href: ROUTES.ADMIN_DASHBOARD, label: "Back to dashboard" }}
    />
  );
}
