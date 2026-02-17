"use client";

import { cn } from "@/lib/utils";
import {
  LOADING_SPINNER_CLASS,
  LOADING_STATE_TEXT_CLASS,
  LOADING_STATE_WRAPPER_CLASS,
  LOADING_STATE_CONTENT_CLASS,
  LOADING_WRAPPER_CLASS,
} from "@/config/design";

export interface LoadingStateProps {
  /** Message below spinner. Omit for spinner-only (minimal). */
  message?: string | null;
  /** Full-page min height (40vh). Default: false. */
  fullPage?: boolean;
  className?: string;
}

/** Refined loading: smooth spinner + optional label. Design-scale colors, prefers-reduced-motion support. */
export function LoadingState({
  message = "Loading…",
  fullPage = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        fullPage ? LOADING_WRAPPER_CLASS : LOADING_STATE_WRAPPER_CLASS,
        "animate-in fade-in-0 duration-200",
        className
      )}
      aria-live="polite"
      aria-busy="true"
    >
      <div className={LOADING_STATE_CONTENT_CLASS}>
        <div className={LOADING_SPINNER_CLASS} aria-hidden />
        {message ? (
          <p className={LOADING_STATE_TEXT_CLASS}>{message}</p>
        ) : null}
      </div>
    </div>
  );
}
