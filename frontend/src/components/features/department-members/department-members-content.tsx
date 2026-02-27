"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { Search } from "lucide-react";
import { useDepartmentMembersQuery } from "@/hooks/use-profile";
import { LoadingState } from "@/components/ui/loading-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  UNIFIED_CARD_CLASS,
  UNIFIED_CARD_TOOLBAR_CLASS,
  UNIFIED_SEARCH_INPUT_CLASS,
  SHOWING_RANGE_BADGE_CLASS,
  STATUS_BADGE_INACTIVE_CLASS,
  TABLE_BASE_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_ROW_CLASS,
  TABLE_CELL_CLASS,
  TABLE_CELL_NAME_CLASS,
  TABLE_CELL_STATUS_CLASS,
  TABLE_EMPTY_CELL_CLASS,
  MANAGEMENT_PAGE_SIZE,
  MANAGEMENT_PAGINATION_MIN_TOTAL,
  formatManagementShowingRange,
} from "@/components/features/admin/constants";
import { ManagementTablePagination } from "@/components/features/admin/management-table-pagination";
import { TYPO_BODY_SM } from "@/config/design";
import { ROLE_LABELS, type Role } from "@/lib/rbac";
import { getAvatarInitial } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 300;

function getRoleLabel(role: string): string {
  return ROLE_LABELS[role as Role] ?? role;
}

export function DepartmentMembersContent() {
  const { data, isLoading, error } = useDepartmentMembersQuery();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      setSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        e.stopPropagation();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, []);

  const applySearch = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setSearch(searchInput);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, setPage]);

  const members = data?.members ?? [];
  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      const name = (m.fullName ?? "").toLowerCase();
      const email = m.email.toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [members, search]);

  const totalFiltered = filteredMembers.length;
  const totalPages = useMemo(
    () => Math.ceil(totalFiltered / MANAGEMENT_PAGE_SIZE),
    [totalFiltered]
  );
  const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1;
  const paginatedMembers = useMemo(() => {
    const start = (safePage - 1) * MANAGEMENT_PAGE_SIZE;
    return filteredMembers.slice(start, start + MANAGEMENT_PAGE_SIZE);
  }, [filteredMembers, safePage]);

  const showPagination =
    totalFiltered >= MANAGEMENT_PAGINATION_MIN_TOTAL && totalPages > 0;

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages, setPage]);

  if (error) {
    throw error;
  }

  if (!data) {
    if (isLoading) {
      return (
        <div className={UNIFIED_CARD_CLASS}>
          <LoadingState compact />
        </div>
      );
    }
    return (
      <div className={UNIFIED_CARD_CLASS}>
        <div className="px-6 py-8">
          <p className={TYPO_BODY_SM}>
            You are not assigned to any department. Contact your administrator if you need assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={UNIFIED_CARD_CLASS}>
        <div className={UNIFIED_CARD_TOOLBAR_CLASS}>
          <div className="relative w-72">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted-foreground/80"
              aria-hidden
            />
            <input
              ref={searchInputRef}
              type="search"
              role="searchbox"
              aria-label="Search members by name or email"
              placeholder="Search by name or email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applySearch();
                }
              }}
              onBlur={() => applySearch()}
              className={UNIFIED_SEARCH_INPUT_CLASS}
            />
            <kbd className={SHOWING_RANGE_BADGE_CLASS} aria-hidden>
              ⌘K
            </kbd>
          </div>
          <span className="inline-flex items-center rounded-md border border-border/40 bg-muted/[0.04] px-2.5 py-1 font-sans text-xs font-medium text-muted-foreground/80">
            {showPagination
              ? formatManagementShowingRange(safePage, MANAGEMENT_PAGE_SIZE, totalFiltered)
              : `${totalFiltered} ${totalFiltered === 1 ? "member" : "members"}`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className={TABLE_BASE_CLASS}>
            <thead>
              <tr className={TABLE_HEAD_ROW_CLASS}>
                <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                  Member
                </th>
                <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                  Email
                </th>
                <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                  Role
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={3} className={TABLE_EMPTY_CELL_CLASS}>
                    <p className="font-sans text-sm font-medium text-foreground">
                      {search ? "No members found." : "No members yet."}
                    </p>
                    {search && (
                      <p className="mt-1.5 font-sans text-xs text-muted-foreground/80">
                        Try another search.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((m) => (
                  <tr key={m.id} className={TABLE_ROW_CLASS}>
                    <td className={TABLE_CELL_NAME_CLASS}>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 shrink-0 rounded-full border border-border/55 bg-primary/[0.10]">
                          <AvatarFallback className="rounded-full bg-primary/[0.10] text-primary text-xs font-medium">
                            {getAvatarInitial(m.fullName, m.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">
                          {m.fullName?.trim() || m.email}
                        </span>
                      </div>
                    </td>
                    <td className={`${TABLE_CELL_CLASS} max-w-[16rem]`}>
                      <span className="block truncate" title={m.email}>
                        {m.email}
                      </span>
                    </td>
                    <td className={TABLE_CELL_STATUS_CLASS}>
                      <span className={STATUS_BADGE_INACTIVE_CLASS}>
                        {getRoleLabel(m.role)}
                      </span>
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
