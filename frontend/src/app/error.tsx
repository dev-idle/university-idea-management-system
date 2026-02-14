"use client";

import { useEffect } from "react";
import { getErrorMessage } from "@/lib/errors";
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
        title="Something went wrong"
        description={getErrorMessage(
          error,
          "An unexpected error occurred."
        )}
        onRetry={reset}
        primaryLink={{ href: "/", label: "Go home" }}
      />
    </div>
  );
}
