import type { LucideIcon } from "lucide-react";
import {
  PAGE_HEADER_CARD_CLASS,
  PAGE_HEADER_ACCENT_CLASS,
  PAGE_TITLE_CLASS,
  PAGE_DESCRIPTION_CLASS,
  PAGE_DESCRIPTION_WIDE_CLASS,
  ICON_BOX_PRIMARY_CLASS,
} from "@/config/design";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  /** Optional description below the title. Omit for title-only headers (e.g. Profile). */
  description?: React.ReactNode;
  /** Optional: back link or breadcrumb (e.g. "Return to Ideas") */
  backLink?: React.ReactNode;
  /** Use wider description max-width (e.g. management pages). */
  descriptionWide?: boolean;
  /** Optional icon rendered in a primary icon box before the title. */
  icon?: LucideIcon;
  /** Additional class for the header card. */
  className?: string;
}

/**
 * Standard page header: card with primary left accent, title, and description.
 * Use across Staff (Ideas) and Role Manager (Admin, QA Manager, QA Coordinator) pages
 * for a consistent, professional layout.
 */
export function PageHeader({
  title,
  description,
  backLink,
  descriptionWide,
  icon: Icon,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-6", className)}>
      {backLink && <nav aria-label="Breadcrumb">{backLink}</nav>}
      <div className={PAGE_HEADER_CARD_CLASS}>
        <div className="flex items-start gap-4">
          {Icon && (
            <div className={ICON_BOX_PRIMARY_CLASS} aria-hidden>
              <Icon className="size-5" />
            </div>
          )}
          <div className={PAGE_HEADER_ACCENT_CLASS}>
            <h1 className={PAGE_TITLE_CLASS}>{title}</h1>
            {description != null && description !== "" && (
              <p
                className={cn(
                  descriptionWide ? PAGE_DESCRIPTION_WIDE_CLASS : PAGE_DESCRIPTION_CLASS
                )}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
