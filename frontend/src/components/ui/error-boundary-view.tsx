"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";

export interface ErrorBoundaryViewProps {
  /** Short, clear title (e.g. "Something went wrong", "Unable to load users"). */
  title: string;
  /** Optional description; use getErrorMessage(error) for API errors. */
  description?: string;
  /** Callback for "Try again" (re-render boundary). Omit to hide the button. */
  onRetry?: () => void;
  /** Primary action link (e.g. Back to dashboard, Go home). */
  primaryLink?: { href: string; label: string };
  /** Optional secondary link. */
  secondaryLink?: { href: string; label: string };
  /** Optional class for the wrapper (e.g. for full-screen centering). */
  className?: string;
}

/**
 * Shared error boundary content: consistent layout, typography (font-sans),
 * and actions. Use in error.tsx and not-found.tsx.
 */
export function ErrorBoundaryView({
  title,
  description,
  onRetry,
  primaryLink,
  secondaryLink,
  className = "",
}: ErrorBoundaryViewProps) {
  return (
    <div
      className={
        className ||
        "flex flex-col items-center justify-center gap-5 rounded-xl border border-border/90 bg-card px-6 py-12 shadow-sm"
      }
    >
      <h1 className="text-center text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      {description && (
        <p className="max-w-md text-center text-sm text-muted-foreground">
          {description}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry != null && (
          <Button variant="outline" onClick={onRetry} type="button">
            Try again
          </Button>
        )}
        {primaryLink && (
          <Link
            href={primaryLink.href}
            className={buttonVariants({ variant: "default" })}
          >
            {primaryLink.label}
          </Link>
        )}
        {secondaryLink && (
          <Link
            href={secondaryLink.href}
            className={buttonVariants({ variant: "outline" })}
          >
            {secondaryLink.label}
          </Link>
        )}
      </div>
    </div>
  );
}
