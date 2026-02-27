"use client";

import { UnifiedPagination } from "@/components/ui/unified-pagination";
import { PAGINATION_FOOTER_CLASS } from "./constants";

export interface ManagementTablePaginationProps {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  ariaLabel: string;
}

/**
 * Pagination for Role Manager tables. Uses shared UnifiedPagination with footer bar.
 */
export function ManagementTablePagination({
  page,
  totalPages,
  setPage,
  ariaLabel,
}: ManagementTablePaginationProps) {
  return (
    <UnifiedPagination
      page={page}
      totalPages={totalPages}
      setPage={setPage}
      ariaLabel={ariaLabel}
      className={PAGINATION_FOOTER_CLASS}
      align="end"
    />
  );
}
