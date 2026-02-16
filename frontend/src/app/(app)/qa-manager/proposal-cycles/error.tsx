"use client";

import { useEffect } from "react";
import { getErrorMessage, ERROR_FALLBACK } from "@/lib/errors";
import { ErrorBoundaryView } from "@/components/ui/error-boundary-view";
import { ROUTES } from "@/config/constants";

export default function QaManagerProposalCyclesError({
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
      title="Unable to load proposal cycles"
      description={getErrorMessage(error, ERROR_FALLBACK.load)}
      onRetry={reset}
      primaryLink={{ href: ROUTES.QA_MANAGER_DASHBOARD, label: "Back to QA Manager" }}
    />
  );
}
