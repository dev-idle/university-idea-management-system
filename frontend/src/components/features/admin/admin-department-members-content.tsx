"use client";

import { useEffect, useMemo, useState } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { Search, Users } from "lucide-react";
import { useAdminDashboardStats } from "@/hooks/use-admin-dashboard";
import { LoadingState } from "@/components/ui/loading-state";
import {
  UNIFIED_CARD_CLASS,
  UNIFIED_CARD_TOOLBAR_CLASS,
  UNIFIED_SEARCH_INPUT_CLASS,
  SHOWING_RANGE_BADGE_CLASS,
  TOOLBAR_SEARCH_WIDTH,
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
  STATUS_BADGE_INACTIVE_CLASS,
  TOOLBAR_FILTER_SELECT_TRIGGER_CLASS,
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
import { ROLES } from "@/lib/rbac";
import { TYPO_BODY_SM } from "@/config/design";
import { cn, getAvatarInitial } from "@/lib/utils";

export function AdminDepartmentMembersContent() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [search, setSearch] = useState("");
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

  const filteredUsers = useMemo(() => {
    if (!selectedDeptId) return [];
    let users = (usersByDept[selectedDeptId] ?? []).slice();
    if (roleFilter !== "all") {
      users = users.filter((u) => (u.roles?.[0] ?? "STAFF") === roleFilter);
    }
    const q = search.trim().toLowerCase();
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
  }, [usersByDept, selectedDeptId, roleFilter, search]);

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
  }, [selectedDeptId, roleFilter, search, setPage]);

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
    <div className="space-y-6">
      <div className={UNIFIED_CARD_CLASS}>
        <div className={UNIFIED_CARD_TOOLBAR_CLASS}>
          <div className="flex flex-wrap items-center gap-3">
            <div className={cn("relative", TOOLBAR_SEARCH_WIDTH)}>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted-foreground/80"
                aria-hidden
              />
              <input
                type="search"
                role="searchbox"
                aria-label="Search by name or email"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={UNIFIED_SEARCH_INPUT_CLASS}
              />
              <kbd className={SHOWING_RANGE_BADGE_CLASS} aria-hidden>
                ⌘K
              </kbd>
            </div>
            <div className={TOOLBAR_FILTER_DIVIDER} aria-hidden />
            <Select value={selectedDeptId} onValueChange={setDeptId}>
              <SelectTrigger
                className={cn(TOOLBAR_FILTER_SELECT_TRIGGER_CLASS, TOOLBAR_FILTER_DEPT_WIDTH)}
                title={selectedDeptName || undefined}
              >
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent className="max-w-[min(24rem,90vw)]">
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id} title={d.name}>
                    <span className="block truncate" title={d.name}>
                      {d.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger
                className={cn(TOOLBAR_FILTER_SELECT_TRIGGER_CLASS, TOOLBAR_FILTER_ROLE_WIDTH)}
                title={roleFilter === "all" ? "All" : getRoleLabel(roleFilter as Role)}
              >
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r} title={getRoleLabel(r as Role)}>
                    {getRoleLabel(r as Role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/[0.04] px-2.5 py-1 font-sans text-xs font-medium text-muted-foreground/80 shrink-0">
            <Users className="size-3.5 shrink-0" aria-hidden />
            {`${totalFiltered} ${totalFiltered === 1 ? "member" : "members"}`}
          </span>
        </div>

        <div className="overflow-x-auto transition-opacity duration-200">
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
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className={TABLE_EMPTY_CELL_CLASS}>
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
                    <td className={cn(TABLE_CELL_STATUS_CLASS, "py-3.5")}>
                      <span className={STATUS_BADGE_INACTIVE_CLASS}>
                        {getRoleLabel((u.roles?.[0] ?? "STAFF") as Role)}
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
