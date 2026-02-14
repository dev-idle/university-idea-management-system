"use client";

import {
  BREADCRUMB_GHOST_CLASS,
  BREADCRUMB_SEP_CLASS,
  PAGE_TITLE_HIGH_END_CLASS,
  PAGE_SUBTITLE_CLASS,
  MANAGEMENT_PAGE_HEADER_CLASS,
} from "./constants";
import { cn } from "@/lib/utils";

export interface ManagementPageHeaderProps {
  /** Current page title (e.g. Academic Years). */
  title: string;
  /** Optional breadcrumb path (e.g. "ADMIN / CONFIGURATION"). Omit to hide. */
  breadcrumb?: string;
  /** Optional subtitle below title (e.g. "Manage academic calendars..."). */
  subtitle?: string;
  /** Optional actions (e.g. Add button) to align right. */
  actions?: React.ReactNode;
  /** Additional class for the wrapper. */
  className?: string;
}

/**
 * High-end header: breadcrumb + title + subtitle (left) and actions (right).
 * Uses flex justify-between items-end for sophisticated layout.
 */
export function ManagementPageHeader({
  title,
  breadcrumb,
  subtitle,
  actions,
  className,
}: ManagementPageHeaderProps) {
  return (
    <header className={cn(MANAGEMENT_PAGE_HEADER_CLASS, className)}>
      <div className="flex flex-col gap-1">
        {breadcrumb != null && breadcrumb !== "" && (
          <nav aria-label="Breadcrumb">
            <ol className={cn("flex flex-wrap items-center", BREADCRUMB_GHOST_CLASS)}>
              {breadcrumb.split("/").map((part, i) => (
                <li key={i} className="flex items-center">
                  {i > 0 && <span className={BREADCRUMB_SEP_CLASS} aria-hidden>/</span>}
                  {part.trim()}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className={cn(PAGE_TITLE_HIGH_END_CLASS)}>{title}</h1>
        {subtitle != null && subtitle !== "" && (
          <p className={PAGE_SUBTITLE_CLASS}>{subtitle}</p>
        )}
      </div>
      {actions}
    </header>
  );
}
