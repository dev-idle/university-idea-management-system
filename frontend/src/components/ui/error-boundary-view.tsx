"use client";

import Link from "next/link";
import {
  ERROR_VIEW_WRAPPER_CLASS,
  ERROR_VIEW_TITLE_CLASS,
  ERROR_VIEW_DESCRIPTION_CLASS,
  ERROR_VIEW_ACTIONS_CLASS,
  FORM_OUTLINE_BUTTON_CLASS,
  FORM_SUBMIT_BUTTON_CLASS,
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
    <div className={cn(ERROR_VIEW_WRAPPER_CLASS, className)}>
      <h1 className={ERROR_VIEW_TITLE_CLASS}>{title}</h1>
      {description && (
        <p className={ERROR_VIEW_DESCRIPTION_CLASS}>{description}</p>
      )}
      <div className={ERROR_VIEW_ACTIONS_CLASS}>
        {onRetry != null && (
          <Button
            onClick={onRetry}
            type="button"
            className={FORM_OUTLINE_BUTTON_CLASS}
          >
            Try again
          </Button>
        )}
        {primaryLink && (
          <Link
            href={primaryLink.href}
            className={cn(
              "inline-flex cursor-pointer items-center justify-center rounded-lg",
              FORM_SUBMIT_BUTTON_CLASS
            )}
          >
            {primaryLink.label}
          </Link>
        )}
        {secondaryLink && (
          <Link
            href={secondaryLink.href}
            className={cn(
              "inline-flex cursor-pointer items-center justify-center rounded-lg",
              FORM_OUTLINE_BUTTON_CLASS
            )}
          >
            {secondaryLink.label}
          </Link>
        )}
      </div>
    </div>
  );
}
