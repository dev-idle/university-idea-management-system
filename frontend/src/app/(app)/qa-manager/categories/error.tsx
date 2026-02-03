"use client";

import { useEffect } from "react";
import { getErrorMessage } from "@/lib/errors";
import { ErrorBoundaryView } from "@/components/ui/error-boundary-view";
import { ROUTES } from "@/config/constants";

export default function QaManagerCategoriesError({
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
      title="Unable to load categories"
      description={getErrorMessage(
        error,
        "The request failed. You may not have permission, or the service may be unavailable."
      )}
      onRetry={reset}
      primaryLink={{ href: ROUTES.QA_MANAGER_DASHBOARD, label: "Back to QA Manager" }}
    />
  );
}
