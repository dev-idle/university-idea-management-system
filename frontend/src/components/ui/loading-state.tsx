"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import {
  LOADING_SPINNER_CLASS,
  LOADING_STATE_TEXT_CLASS,
  LOADING_STATE_WRAPPER_CLASS,
  LOADING_STATE_CONTENT_CLASS,
  LOADING_INNER_CARD_CLASS,
  LOADING_INLINE_CLASS,
  ROOT_LOADING_FULLSCREEN_CLASS,
  TR_PAGE_FADE,
} from "@/config/design";

/** Default loading label — refined, minimal. */
const DEFAULT_LOADING_LABEL = "Loading";

export interface LoadingStateProps {
  /** Label below spinner. Default: "Loading". Set null for spinner-only. */
  message?: string | null;
  /** Full-screen (root, layout). Same UI, centered on viewport. */
  fullScreen?: boolean;
  /** Inline: no card, minimal. For data fetch inside card — avoids double loading. */
  compact?: boolean;
  className?: string;
}

/** Unified loading UI: minimal spinner + optional label. Memoized for perf. */
function LoadingStateInner({
  message = DEFAULT_LOADING_LABEL,
  fullScreen = false,
  compact = false,
  className,
}: LoadingStateProps) {
  const wrapperClass = fullScreen
    ? ROOT_LOADING_FULLSCREEN_CLASS
    : compact
      ? LOADING_INLINE_CLASS
      : LOADING_STATE_WRAPPER_CLASS;

  const showMessage = message != null && message !== "";

  return (
    <div
      className={cn(
        wrapperClass,
        TR_PAGE_FADE,
        className
      )}
      aria-live="polite"
      aria-busy="true"
    >
      {compact ? (
        <div className={cn(LOADING_STATE_CONTENT_CLASS, "text-center")}>
          <div className={LOADING_SPINNER_CLASS} aria-hidden />
          {showMessage && (
            <span className={LOADING_STATE_TEXT_CLASS}>{message}</span>
          )}
        </div>
      ) : (
        <div className={LOADING_INNER_CARD_CLASS}>
          <div className={cn(LOADING_STATE_CONTENT_CLASS, "text-center")}>
            <div
              className={cn(LOADING_SPINNER_CLASS, fullScreen && "size-6")}
              aria-hidden
            />
            {showMessage && (
              <span
                className={cn(
                  LOADING_STATE_TEXT_CLASS,
                  fullScreen && "text-xs text-muted-foreground/70",
                )}
              >
                {message}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const LoadingState = memo(LoadingStateInner);
