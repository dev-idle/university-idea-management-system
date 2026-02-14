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
import { PAGINATION_FOOTER_CLASS } from "./constants";

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

/** Page button: size-8, refined. */
const PAGE_BTN_BASE =
  "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-sm font-medium tabular-nums transition-colors duration-150";
const PAGE_BTN_INACTIVE =
  "text-muted-foreground/90 hover:bg-muted/25 hover:text-foreground";
const PAGE_BTN_ACTIVE =
  "bg-primary/15 text-primary font-semibold";

/** Prev/Next: minimal, harmonious. */
const NAV_BTN_BASE =
  "flex size-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground/90 transition-colors duration-150 hover:bg-muted/25 hover:text-foreground sm:size-auto sm:h-8 sm:min-w-[3.5rem] sm:px-3";

export interface ManagementTablePaginationProps {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  ariaLabel: string;
}

/**
 * Understated pagination for Role Manager tables.
 * Borderless buttons, muted active state, recedes behind content.
 */
export function ManagementTablePagination({
  page,
  totalPages,
  setPage,
  ariaLabel,
}: ManagementTablePaginationProps) {
  const pageNumbers = useMemo(
    () => getPageNumbers(totalPages, page),
    [totalPages, page]
  );

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className={PAGINATION_FOOTER_CLASS}>
      <Pagination aria-label={ariaLabel} className="w-full justify-end">
        <PaginationContent className="gap-1.5">
          <PaginationItem>
            <a
              href="#"
              role="button"
              aria-label="Go to previous page"
              aria-disabled={prevDisabled}
              onClick={(e) => {
                e.preventDefault();
                if (!prevDisabled) setPage(page - 1);
              }}
              className={cn(
                NAV_BTN_BASE,
                prevDisabled && "pointer-events-none opacity-50"
              )}
            >
              <ChevronLeft className="size-4 shrink-0" strokeWidth={2} />
              <span className="hidden sm:inline">Previous</span>
            </a>
          </PaginationItem>
          {pageNumbers.map((p) =>
            p === "ellipsis-left" || p === "ellipsis-right" ? (
              <PaginationItem key={p}>
                <PaginationEllipsis className="flex size-8 items-center justify-center text-muted-foreground/60" />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(p);
                  }}
                  isActive={p === page}
                  className={cn(
                    PAGE_BTN_BASE,
                    p === page ? PAGE_BTN_ACTIVE : PAGE_BTN_INACTIVE
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
                if (!nextDisabled) setPage(page + 1);
              }}
              className={cn(
                NAV_BTN_BASE,
                nextDisabled && "pointer-events-none opacity-50"
              )}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="size-4 shrink-0" strokeWidth={2} />
            </a>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
