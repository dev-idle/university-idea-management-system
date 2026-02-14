"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Can } from "@/components/ui/can";
import { Button } from "@/components/ui/button";
import { useUsersListQuery, useCreateUserMutation } from "@/hooks/use-users";
import { USERS_PAGE_SIZE } from "./users/constants";
import {
  UNIFIED_CARD_CLASS,
  UNIFIED_CARD_TOOLBAR_CLASS,
  UNIFIED_SEARCH_INPUT_CLASS,
  TOOLBAR_ADD_BUTTON_BASE_CLASS,
  TOOLBAR_ADD_BUTTON_PRIMARY_CLASS,
  LOADING_STATE_WRAPPER_CLASS,
  LOADING_STATE_CONTENT_CLASS,
  LOADING_SPINNER_CLASS,
  DIALOG_CONTENT_SCULPTED_CLASS,
  DIALOG_OVERLAY_SCULPTED_CLASS,
  DIALOG_HEADER_SCULPTED_CLASS,
  DIALOG_TITLE_SCULPTED_CLASS,
  MANAGEMENT_PAGINATION_MIN_TOTAL,
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
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 300;

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

  const totalPages = useMemo(
    () => (data ? Math.ceil(data.total / data.limit) : 0),
    [data?.total, data?.limit]
  );

  const createMutation = useCreateUserMutation();

  if (status === "error") {
    throw error;
  }

  return (
    <div className="space-y-6">
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
            <div className="relative w-72">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted-foreground/70"
                aria-hidden
              />
              <input
                ref={searchInputRef}
                type="search"
                role="searchbox"
                aria-label="Search users by email or name"
                placeholder="Search by email or name…"
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
                className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center rounded border border-border bg-muted/20 px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground sm:inline-flex"
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
          <div className={LOADING_STATE_WRAPPER_CLASS}>
            <div className={LOADING_STATE_CONTENT_CLASS}>
              <div className={LOADING_SPINNER_CLASS} aria-hidden />
              <p className="font-sans text-sm font-medium text-muted-foreground">Loading accounts…</p>
            </div>
          </div>
        ) : (
          <>
            <UsersTable
              users={data?.data ?? []}
              isRefetching={isFetching}
              hasActiveSearch={!!search}
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
