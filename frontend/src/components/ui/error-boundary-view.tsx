"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import {
  ERROR_VIEW_WRAPPER_CLASS,
  ERROR_VIEW_ICON_CLASS,
  ERROR_VIEW_TITLE_CLASS,
  ERROR_VIEW_DESCRIPTION_CLASS,
  ERROR_VIEW_ACTIONS_CLASS,
} from "@/config/design";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  /** Show icon above title. Default true. */
  showIcon?: boolean;
}

/**
 * Shared error boundary content: refined layout, typography, and actions.
 * Use in error.tsx and not-found.tsx.
 */
export function ErrorBoundaryView({
  title,
  description,
  onRetry,
  primaryLink,
  secondaryLink,
  className = "",
  showIcon = true,
}: ErrorBoundaryViewProps) {
  return (
    <div className={cn(ERROR_VIEW_WRAPPER_CLASS, className)}>
      {showIcon && (
        <div className={ERROR_VIEW_ICON_CLASS} aria-hidden>
          <AlertCircle className="size-5" />
        </div>
      )}
      <h1 className={ERROR_VIEW_TITLE_CLASS}>{title}</h1>
      {description && (
        <p className={ERROR_VIEW_DESCRIPTION_CLASS}>{description}</p>
      )}
      <div className={ERROR_VIEW_ACTIONS_CLASS}>
        {onRetry != null ? (
          <>
            <Button size="default" onClick={onRetry} type="button">
              Try again
            </Button>
            {primaryLink && (
              <Button variant="outline" size="default" asChild>
                <Link href={primaryLink.href}>{primaryLink.label}</Link>
              </Button>
            )}
          </>
        ) : (
          primaryLink && (
            <Button size="default" asChild>
              <Link href={primaryLink.href}>{primaryLink.label}</Link>
            </Button>
          )
        )}
        {secondaryLink && (
          <Button variant="outline" size="default" asChild>
            <Link href={secondaryLink.href}>{secondaryLink.label}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
