"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";

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
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <h2 className="text-lg font-semibold text-foreground">Failed to load users</h2>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        {error.message || "An error occurred. The backend may have returned 403 (forbidden) or 401 (unauthenticated)."}
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
        <Link href="/dashboard" className={buttonVariants({ variant: "default" })}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
