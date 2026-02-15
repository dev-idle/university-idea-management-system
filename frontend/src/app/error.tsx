"use client";

import { useEffect } from "react";
import { getErrorMessage, ERROR_FALLBACK } from "@/lib/errors";
import { ErrorBoundaryView } from "@/components/ui/error-boundary-view";

export default function Error({
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
    <div className="grid min-h-screen place-items-center bg-background px-4 font-sans">
      <ErrorBoundaryView
        title={ERROR_FALLBACK.generic}
        description={getErrorMessage(error, ERROR_FALLBACK.generic)}
        onRetry={reset}
        primaryLink={{ href: "/", label: "Go home" }}
      />
    </div>
  );
}
