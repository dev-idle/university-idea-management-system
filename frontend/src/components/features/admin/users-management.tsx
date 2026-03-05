"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Can } from "@/components/ui/can";
import { Button } from "@/components/ui/button";
import { useUsersListQuery, useCreateUserMutation } from "@/hooks/use-users";
import { useAdminDashboardStats } from "@/hooks/use-admin-dashboard";
import { USERS_PAGE_SIZE } from "./users/constants";
import {
  UNIFIED_CARD_CLASS,
  UNIFIED_CARD_TOOLBAR_CLASS,
  UNIFIED_SEARCH_INPUT_CLASS,
  TOOLBAR_ADD_BUTTON_BASE_CLASS,
  TOOLBAR_ADD_BUTTON_PRIMARY_CLASS,
  DIALOG_CONTENT_SCULPTED_CLASS,
  DIALOG_OVERLAY_SCULPTED_CLASS,
  DIALOG_HEADER_SCULPTED_CLASS,
  DIALOG_TITLE_SCULPTED_CLASS,
  MANAGEMENT_PAGINATION_MIN_TOTAL,
  SHOWING_RANGE_BADGE_CLASS,
  TOOLBAR_SEARCH_WIDTH,
} from "./constants";
import { ManagementTablePagination } from "./management-table-pagination";
import { UsersTable } from "./users-table";
import { CreateUserForm } from "./create-user-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserPlus, Plus, Search } from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 350;

export function AdminUsersManagement() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );
  const [searchInput, setSearchInput] = useState(search);
  const [showCreate, setShowCreate] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const applySearch = useCallback(
    (value: string) => {
      setSearch(value);
      setPage(1);
    },
    [setSearch, setPage]
  );

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      if (searchInput !== search) {
        applySearch(searchInput);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput, search, applySearch]);

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

  const { data, status, error, isFetching } = useUsersListQuery({
    page,
    limit: USERS_PAGE_SIZE,
    search: search || undefined,
  });
  const { data: stats } = useAdminDashboardStats({ enabled: true });

  const totalPages = useMemo(
    () => (data ? Math.ceil(data.total / data.limit) : 0),
    [data]
  );

  const createMutation = useCreateUserMutation();

  if (status === "error") {
    throw error;
  }

  return (
    <div className="space-y-10">
      <Can permission="USERS">
        <Dialog
          open={showCreate}
          onOpenChange={(open) => {
            if (!open) createMutation.reset();
            setShowCreate(open);
          }}
        >
          <DialogContent
            className={DIALOG_CONTENT_SCULPTED_CLASS}
            overlayClassName={DIALOG_OVERLAY_SCULPTED_CLASS}
          >
            <DialogHeader className={DIALOG_HEADER_SCULPTED_CLASS}>
              <DialogTitle className={DIALOG_TITLE_SCULPTED_CLASS}>
                Add User
              </DialogTitle>
            </DialogHeader>
            <CreateUserForm
              onSuccess={() => setShowCreate(false)}
              onCancel={() => setShowCreate(false)}
              isPending={createMutation.isPending}
              mutateAsync={createMutation.mutateAsync}
              error={createMutation.error}
              variant="dialog"
            />
          </DialogContent>
        </Dialog>
      </Can>

      <div className={UNIFIED_CARD_CLASS}>
        <Can permission="USERS">
          <div className={UNIFIED_CARD_TOOLBAR_CLASS}>
            <div className={cn("relative", TOOLBAR_SEARCH_WIDTH)}>
              <Search
                className={cn(
                  "pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted-foreground/80 transition-opacity duration-200 ease-out motion-reduce:transition-none",
                  searchInput !== search && "opacity-60"
                )}
                aria-hidden
              />
              <input
                ref={searchInputRef}
                type="search"
                role="searchbox"
                aria-label="Search users by name or email"
                placeholder="Search by name or email…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (debounceRef.current) {
                      clearTimeout(debounceRef.current);
                      debounceRef.current = null;
                    }
                    applySearch(searchInput);
                  }
                }}
                onBlur={() => {
                  if (searchInput !== search) {
                    if (debounceRef.current) {
                      clearTimeout(debounceRef.current);
                      debounceRef.current = null;
                    }
                    applySearch(searchInput);
                  }
                }}
                className={UNIFIED_SEARCH_INPUT_CLASS}
              />
              <kbd
                className={SHOWING_RANGE_BADGE_CLASS}
                aria-hidden
              >
                ⌘K
              </kbd>
            </div>
            <Button
              onClick={() => setShowCreate((v) => !v)}
              variant={showCreate ? "secondary" : "default"}
              size="sm"
              className={cn(
                TOOLBAR_ADD_BUTTON_BASE_CLASS,
                !showCreate && TOOLBAR_ADD_BUTTON_PRIMARY_CLASS
              )}
            >
              {showCreate ? (
                <UserPlus className="size-4 shrink-0" aria-hidden />
              ) : (
                <Plus className="size-4 shrink-0" aria-hidden />
              )}
              {showCreate ? "Cancel" : "Add User"}
            </Button>
          </div>
        </Can>

        {status === "pending" && !data ? (
          <LoadingState compact />
        ) : (
          <>
            <UsersTable
              users={data?.data ?? []}
              isRefetching={isFetching}
              hasActiveSearch={!!search}
              departmentCompliance={stats?.departmentCompliance}
            />
            {data && data.total >= MANAGEMENT_PAGINATION_MIN_TOTAL && totalPages > 0 && (
              <ManagementTablePagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
                ariaLabel="User list pagination"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
