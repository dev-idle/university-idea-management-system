"use client";

import { useMemo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
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

export interface ManagementTablePaginationProps {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  ariaLabel: string;
}

/**
 * Standard pagination footer for Role Manager list tables (Admin + QA Manager).
 * Renders "Previous", page numbers with ellipsis, "Next". Use with PAGINATION_FOOTER_CLASS wrapper.
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

  return (
    <div className={PAGINATION_FOOTER_CLASS}>
      <Pagination aria-label={ariaLabel}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) setPage(page - 1);
              }}
              aria-disabled={page <= 1}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {pageNumbers.map((p) =>
            p === "ellipsis-left" || p === "ellipsis-right" ? (
              <PaginationItem key={p}>
                <PaginationEllipsis />
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
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages) setPage(page + 1);
              }}
              aria-disabled={page >= totalPages}
              className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
