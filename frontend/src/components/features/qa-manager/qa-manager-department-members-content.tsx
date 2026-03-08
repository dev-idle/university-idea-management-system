"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import {
  UNIFIED_CARD_CLASS,
  UNIFIED_CARD_TOOLBAR_CLASS,
  UNIFIED_SEARCH_INPUT_CLASS,
  TOOLBAR_SEARCH_WIDTH,
  SHOWING_RANGE_BADGE_CLASS,
  TABLE_BASE_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_ROW_CLASS,
  TABLE_CELL_CLASS,
  TABLE_CELL_NAME_CLASS,
  TABLE_EMPTY_CELL_CLASS,
  TABLE_EMPTY_PRIMARY_CLASS,
  TABLE_EMPTY_HINT_CLASS,
  MANAGEMENT_PAGE_SIZE,
  MANAGEMENT_PAGINATION_MIN_TOTAL,
} from "@/components/features/admin/constants";
import { ManagementTablePagination } from "@/components/features/admin/management-table-pagination";
import { LoadingState } from "@/components/ui/loading-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQaManagerDepartmentMembersQuery } from "@/hooks/use-profile";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Search } from "lucide-react";
import { cn, getAvatarInitial } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 350;

export function QaManagerDepartmentMembersContent() {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [debouncedSearch] = useDebouncedValue(
    searchInput,
    SEARCH_DEBOUNCE_MS,
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        e.stopPropagation();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () =>
      window.removeEventListener("keydown", handler, { capture: true });
  }, []);

  const { data, isLoading, error } = useQaManagerDepartmentMembersQuery();
  const rows = data ?? [];
  const filtered = useMemo(() => {
    const q = debouncedSearch.trim();
    if (!q) return rows;
    const lower = q.toLowerCase();
    return rows.filter((r) =>
      r.department.name.toLowerCase().includes(lower),
    );
  }, [rows, debouncedSearch]);

  const totalFiltered = filtered.length;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalFiltered / MANAGEMENT_PAGE_SIZE)),
    [totalFiltered],
  );
  const safePage = totalPages > 0 ? Math.min(Math.max(1, page), totalPages) : 1;
  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * MANAGEMENT_PAGE_SIZE;
    return filtered.slice(start, start + MANAGEMENT_PAGE_SIZE);
  }, [filtered, safePage]);

  const showPagination =
    totalFiltered >= MANAGEMENT_PAGINATION_MIN_TOTAL && totalPages > 0;

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages, setPage]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, setPage]);

  if (error) {
    throw error;
  }

  if (isLoading) {
    return (
      <div className={UNIFIED_CARD_CLASS}>
        <LoadingState compact />
      </div>
    );
  }

  return (
    <div className={UNIFIED_CARD_CLASS}>
      <div className={UNIFIED_CARD_TOOLBAR_CLASS}>
        <div className={cn("relative", TOOLBAR_SEARCH_WIDTH)}>
          <Search
            className={cn(
              "pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted-foreground/80 transition-opacity duration-200 ease-out motion-reduce:transition-none",
              searchInput !== debouncedSearch && "opacity-60",
            )}
            aria-hidden
          />
          <input
            ref={searchInputRef}
            type="search"
            role="searchbox"
            aria-label="Search departments"
            placeholder="Search by department name…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={UNIFIED_SEARCH_INPUT_CLASS}
          />
          <kbd className={SHOWING_RANGE_BADGE_CLASS} aria-hidden>
            ⌘K
          </kbd>
        </div>
        <span className="inline-flex w-full items-center justify-center rounded-md border border-border/40 bg-muted/[0.04] px-2.5 py-1 font-sans text-xs font-medium text-muted-foreground/80 sm:w-auto sm:justify-start">
          {`${totalFiltered} ${totalFiltered === 1 ? "department" : "departments"}`}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className={TABLE_BASE_CLASS}>
          <thead>
            <tr className={TABLE_HEAD_ROW_CLASS}>
              <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                Department
              </th>
              <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                QA Coordinator Name
              </th>
              <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                QA Coordinator Email
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className={TABLE_EMPTY_CELL_CLASS}>
                  <p className={TABLE_EMPTY_PRIMARY_CLASS}>
                    {debouncedSearch ? "No departments found." : "No departments yet."}
                  </p>
                  {debouncedSearch && (
                    <p className={TABLE_EMPTY_HINT_CLASS}>
                      Try another search.
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              paginatedRows.map((r) => (
                <tr key={r.department.id} className={TABLE_ROW_CLASS}>
                  <td className={cn(TABLE_CELL_NAME_CLASS, "py-3.5")}>
                    {r.department.name}
                  </td>
                  <td className={cn(TABLE_CELL_NAME_CLASS, "py-3.5")}>
                    {r.qaCoordinator ? (
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 shrink-0 rounded-full border border-border/55 bg-primary/[0.10]">
                          <AvatarFallback className="rounded-full bg-primary/[0.10] text-primary text-xs font-medium">
                            {getAvatarInitial(r.qaCoordinator.fullName, r.qaCoordinator.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">
                          {r.qaCoordinator.fullName?.trim() || r.qaCoordinator.email}
                        </span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={cn(TABLE_CELL_CLASS, "max-w-[16rem] py-3.5")}>
                    {r.qaCoordinator ? (
                      <span className="block truncate" title={r.qaCoordinator.email}>
                        {r.qaCoordinator.email}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showPagination && (
        <ManagementTablePagination
          page={safePage}
          totalPages={totalPages}
          setPage={setPage}
          ariaLabel="Department members pagination"
        />
      )}
    </div>
  );
}
