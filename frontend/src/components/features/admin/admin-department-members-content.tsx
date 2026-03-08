"use client";

import { useEffect, useMemo, useState } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { ChevronDown, Search } from "lucide-react";
import { useAdminDashboardStats } from "@/hooks/use-admin-dashboard";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { LoadingState } from "@/components/ui/loading-state";
import {
  UNIFIED_CARD_CLASS,
  UNIFIED_CARD_TOOLBAR_CLASS,
  UNIFIED_SEARCH_INPUT_CLASS,
  SHOWING_RANGE_BADGE_CLASS,
  TOOLBAR_SEARCH_WIDTH,
  TOOLBAR_SEARCH_FILTERS_GROUP,
  TOOLBAR_FILTER_DEPT_WIDTH,
  TOOLBAR_FILTER_ROLE_WIDTH,
  TOOLBAR_FILTER_DIVIDER,
  TABLE_BASE_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_ROW_CLASS,
  TABLE_CELL_CLASS,
  TABLE_CELL_NAME_CLASS,
  TABLE_CELL_STATUS_CLASS,
  TABLE_EMPTY_CELL_CLASS,
  TABLE_EMPTY_PRIMARY_CLASS,
  TABLE_EMPTY_HINT_CLASS,
  STATUS_BADGE_ACTIVE_CLASS,
  STATUS_BADGE_INACTIVE_CLASS,
  TOOLBAR_FILTER_SELECT_TRIGGER_CLASS,
  TOOLBAR_FILTER_CHEVRON_CLASS,
  MANAGEMENT_PAGE_SIZE,
  MANAGEMENT_PAGINATION_MIN_TOTAL,
} from "./constants";
import { ManagementTablePagination } from "./management-table-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getRoleLabel, type Role } from "@/lib/rbac";
import { TYPO_BODY_SM } from "@/config/design";
import { cn, getAvatarInitial } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 350;

export function AdminDepartmentMembersContent() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, flushSearch] = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const [deptId, setDeptId] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { data: stats, isLoading } = useAdminDashboardStats();

  const usersByDept = stats?.usersByDepartment ?? {};
  const departments = stats?.departments ?? [];

  const defaultDept = useMemo(() => {
    if (departments.length === 0) return null;
    const itServices = departments.find(
      (d) => d.name === "IT Services / System Administration Department"
    );
    return itServices ?? departments[0];
  }, [departments]);

  useEffect(() => {
    if (defaultDept && !deptId) setDeptId(defaultDept.id);
  }, [defaultDept, deptId]);

  const selectedDeptId = deptId || (defaultDept?.id ?? "");
  const selectedDeptName = departments.find((d) => d.id === selectedDeptId)?.name ?? "";

  /** Roles that exist in the selected department (for Role filter options). */
  const rolesInSelectedDept = useMemo(() => {
    if (!selectedDeptId) return [];
    const users = usersByDept[selectedDeptId] ?? [];
    const roleSet = new Set<string>();
    for (const u of users) {
      const r = u.roles?.[0] ?? "STAFF";
      roleSet.add(r);
    }
    const roleOrder: Record<string, number> = {
      ADMIN: 0,
      QA_MANAGER: 1,
      QA_COORDINATOR: 2,
      STAFF: 3,
    };
    return Array.from(roleSet).sort((a, b) => (roleOrder[a] ?? 99) - (roleOrder[b] ?? 99));
  }, [selectedDeptId, usersByDept]);

  useEffect(() => {
    if (roleFilter !== "all" && selectedDeptId && !rolesInSelectedDept.includes(roleFilter)) {
      setRoleFilter("all");
    }
  }, [selectedDeptId, roleFilter, rolesInSelectedDept]);

  const filteredUsers = useMemo(() => {
    if (!selectedDeptId) return [];
    let users = (usersByDept[selectedDeptId] ?? []).slice();
    if (roleFilter !== "all") {
      users = users.filter((u) => (u.roles?.[0] ?? "STAFF") === roleFilter);
    }
    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      users = users.filter((u) => {
        const name = (u.fullName ?? "").toLowerCase();
        const email = u.email.toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }
    users.sort((a, b) => {
      const roleA = a.roles?.[0] ?? "STAFF";
      const roleB = b.roles?.[0] ?? "STAFF";
      if (roleA === "QA_COORDINATOR" && roleB !== "QA_COORDINATOR") return -1;
      if (roleA !== "QA_COORDINATOR" && roleB === "QA_COORDINATOR") return 1;
      return 0;
    });
    return users;
  }, [usersByDept, selectedDeptId, roleFilter, debouncedSearch]);

  const totalFiltered = filteredUsers.length;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalFiltered / MANAGEMENT_PAGE_SIZE)),
    [totalFiltered]
  );
  const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1;
  const paginatedUsers = useMemo(() => {
    const start = (safePage - 1) * MANAGEMENT_PAGE_SIZE;
    return filteredUsers.slice(start, start + MANAGEMENT_PAGE_SIZE);
  }, [filteredUsers, safePage]);
  const showPagination =
    totalFiltered >= MANAGEMENT_PAGINATION_MIN_TOTAL && totalPages > 0;

  useEffect(() => {
    setPage(1);
  }, [selectedDeptId, roleFilter, debouncedSearch, setPage]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages, setPage]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className={`${UNIFIED_CARD_CLASS} min-h-[200px] p-8`}>
          <LoadingState compact />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className={`${UNIFIED_CARD_CLASS} p-8`}>
          <p className={TYPO_BODY_SM}>Unable to load data.</p>
        </div>
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="space-y-6">
        <div className={`${UNIFIED_CARD_CLASS} py-12 text-center`}>
          <p className={TYPO_BODY_SM}>No departments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className={UNIFIED_CARD_CLASS}>
        <div className={UNIFIED_CARD_TOOLBAR_CLASS}>
          <div className={TOOLBAR_SEARCH_FILTERS_GROUP}>
            <div className={cn("relative", TOOLBAR_SEARCH_WIDTH)}>
              <Search
                className={cn(
                  "pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted-foreground/80 transition-opacity duration-200 ease-out motion-reduce:transition-none",
                  searchInput !== debouncedSearch && "opacity-60"
                )}
                aria-hidden
              />
              <input
                type="search"
                role="searchbox"
                aria-label="Search by name or email"
                placeholder="Search by name or email…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    flushSearch();
                  }
                }}
                onBlur={() => flushSearch()}
                className={UNIFIED_SEARCH_INPUT_CLASS}
              />
              <kbd className={SHOWING_RANGE_BADGE_CLASS} aria-hidden>
                ⌘K
              </kbd>
            </div>
            <div className={TOOLBAR_FILTER_DIVIDER} aria-hidden />
            <Select value={selectedDeptId} onValueChange={setDeptId}>
              <SelectTrigger
                className={cn(TOOLBAR_FILTER_SELECT_TRIGGER_CLASS, TOOLBAR_FILTER_DEPT_WIDTH, "[&>svg:first-of-type]:hidden")}
                title={selectedDeptName || undefined}
              >
                <SelectValue placeholder="Department" />
                <ChevronDown className={TOOLBAR_FILTER_CHEVRON_CLASS} aria-hidden />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id} title={d.name}>
                    <span className="block truncate" title={d.name}>
                      {d.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDeptId ? (
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger
                  className={cn(TOOLBAR_FILTER_SELECT_TRIGGER_CLASS, TOOLBAR_FILTER_ROLE_WIDTH, "[&>svg:first-of-type]:hidden")}
                  title={roleFilter === "all" ? "All" : getRoleLabel(roleFilter as Role)}
                >
                  <SelectValue placeholder="Role" />
                  <ChevronDown className={TOOLBAR_FILTER_CHEVRON_CLASS} aria-hidden />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {rolesInSelectedDept.map((r) => (
                    <SelectItem key={r} value={r} title={getRoleLabel(r as Role)}>
                      {getRoleLabel(r as Role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>
          <span className="inline-flex w-full items-center justify-center rounded-md border border-border/40 bg-muted/[0.04] px-2.5 py-1 font-sans text-xs font-medium text-muted-foreground/80 sm:w-auto sm:justify-start">
            {`${totalFiltered} ${totalFiltered === 1 ? "member" : "members"}`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className={TABLE_BASE_CLASS}>
            <thead>
              <tr className={TABLE_HEAD_ROW_CLASS}>
                <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                  Name
                </th>
                <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                  Email
                </th>
                <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                  Role
                </th>
                <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className={TABLE_EMPTY_CELL_CLASS}>
                    <p className={TABLE_EMPTY_PRIMARY_CLASS}>
                      {departments.length === 0
                        ? "No departments."
                        : "No members match."}
                    </p>
                    <p className={TABLE_EMPTY_HINT_CLASS}>
                      {departments.length === 0
                        ? "Contact your administrator."
                        : "Try a different filter or search."}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id} className={TABLE_ROW_CLASS}>
                    <td className={cn(TABLE_CELL_NAME_CLASS, "py-3.5")}>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 shrink-0 rounded-full border border-border/55 bg-primary/[0.10]">
                          <AvatarFallback className="rounded-full bg-primary/[0.10] text-primary text-xs font-medium">
                            {getAvatarInitial(u.fullName, u.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">
                          {u.fullName?.trim() || u.email}
                        </span>
                      </div>
                    </td>
                    <td className={cn(TABLE_CELL_CLASS, "max-w-[16rem] py-3.5")}>
                      <span className="block truncate" title={u.email}>
                        {u.email}
                      </span>
                    </td>
                    <td className={cn(TABLE_CELL_CLASS, "py-3.5")}>
                      {getRoleLabel((u.roles?.[0] ?? "STAFF") as Role)}
                    </td>
                    <td className={cn(TABLE_CELL_STATUS_CLASS, "py-3.5")}>
                      <span className={u.isActive ? STATUS_BADGE_ACTIVE_CLASS : STATUS_BADGE_INACTIVE_CLASS}>
                        {u.isActive ? "Active" : "Inactive"}
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
    </div>
  );
}
