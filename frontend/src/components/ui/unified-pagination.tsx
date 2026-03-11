"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

const PAGES_AROUND = 2;
const MAX_VISIBLE_PAGES = 7;

function getPageNumbers(
  totalPages: number,
  page: number
): (number | "ellipsis-left" | "ellipsis-right")[] {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const start = Math.max(1, page - PAGES_AROUND);
  const end = Math.min(totalPages, page + PAGES_AROUND);
  const pages: (number | "ellipsis-left" | "ellipsis-right")[] = [];
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("ellipsis-left");
  }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push("ellipsis-right");
    pages.push(totalPages);
  }
  return pages;
}

/** Minimal, refined pagination — Role Manager + Staff (Ideas Hub). */
const PAGINATION_PAGE_BTN_BASE =
  "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-[13px] font-medium tabular-nums transition-colors duration-200 ease-out select-none";
const PAGINATION_PAGE_INACTIVE =
  "text-foreground/75 hover:text-foreground";
const PAGINATION_PAGE_ACTIVE =
  "border border-primary/35 bg-transparent text-foreground font-semibold min-w-[2.25rem] hover:bg-transparent hover:text-foreground hover:border-primary/35";
const PAGINATION_NAV_BTN_BASE =
  "flex size-9 cursor-pointer items-center justify-center gap-1 rounded-md text-[13px] font-medium text-foreground/75 transition-all duration-200 ease-out hover:text-primary disabled:cursor-not-allowed sm:size-auto sm:h-9 sm:min-w-[2.75rem] sm:px-2";

export interface UnifiedPaginationProps {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  ariaLabel: string;
  /** Wrapper element class (e.g. PAGINATION_FOOTER_CLASS or "pt-8") */
  className?: string;
  /** "start" | "center" | "end" — default "end" for tables, "center" for Ideas feed */
  align?: "start" | "center" | "end";
}

/**
 * Unified pagination for Role Manager tables and Staff Ideas Hub.
 * Same visual design: minimal prev/next, refined page numbers, active state.
 */
export function UnifiedPagination({
  page,
  totalPages,
  setPage,
  ariaLabel,
  className,
  align = "end",
}: UnifiedPaginationProps) {
  const pageNumbers = useMemo(
    () => getPageNumbers(totalPages, page),
    [totalPages, page]
  );

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  const goToPage = (p: number) => {
    setPage(p);
    const main = document.getElementById("app-main");
    if (main) {
      main.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const alignClass =
    align === "center" ? "justify-center" : align === "start" ? "justify-start" : "justify-end";

  return (
    <div className={className}>
      <Pagination aria-label={ariaLabel} className={cn("w-full", alignClass)}>
        <PaginationContent className="gap-1 sm:gap-1.5">
          <PaginationItem>
            <a
              href="#"
              role="button"
              aria-label="Go to previous page"
              aria-disabled={prevDisabled}
              onClick={(e) => {
                e.preventDefault();
                if (!prevDisabled) goToPage(page - 1);
              }}
              className={cn(
                PAGINATION_NAV_BTN_BASE,
                prevDisabled && "pointer-events-none opacity-40"
              )}
            >
              <ChevronLeft className="size-[1.125rem] shrink-0" strokeWidth={2.25} />
              <span className="ml-0.5 hidden text-[13px] font-medium sm:inline">Prev</span>
            </a>
          </PaginationItem>
          {pageNumbers.map((p) =>
            p === "ellipsis-left" || p === "ellipsis-right" ? (
              <PaginationItem key={p}>
                <PaginationEllipsis className="flex size-9 items-center justify-center text-muted-foreground/40 [&_svg]:size-3.5" />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    goToPage(p);
                  }}
                  isActive={p === page}
                  className={cn(
                    PAGINATION_PAGE_BTN_BASE,
                    p === page ? PAGINATION_PAGE_ACTIVE : PAGINATION_PAGE_INACTIVE
                  )}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <a
              href="#"
              role="button"
              aria-label="Go to next page"
              aria-disabled={nextDisabled}
              onClick={(e) => {
                e.preventDefault();
                if (!nextDisabled) goToPage(page + 1);
              }}
              className={cn(
                PAGINATION_NAV_BTN_BASE,
                nextDisabled && "pointer-events-none opacity-40"
              )}
            >
              <span className="mr-0.5 hidden text-[13px] font-medium sm:inline">Next</span>
              <ChevronRight className="size-[1.125rem] shrink-0" strokeWidth={2.25} />
            </a>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
