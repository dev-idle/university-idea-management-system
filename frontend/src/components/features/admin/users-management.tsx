"use client";

import { useMemo, useState, useEffect } from "react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Can } from "@/components/ui/can";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUsersListQuery, useCreateUserMutation } from "@/hooks/use-users";
import { USERS_PAGE_SIZE } from "./users/constants";
import {
  MANAGEMENT_CARD_HEADER_CLASS,
  MANAGEMENT_CARD_CLASS,
  DIALOG_CONTENT_CLASS,
  DIALOG_HEADER_CLASS,
  DIALOG_TITLE_CLASS,
  DIALOG_DESCRIPTION_CLASS,
  TABLE_LOADING_CELL_CLASS,
  MANAGEMENT_PAGINATION_MIN_TOTAL,
  formatManagementShowingRange,
} from "./constants";
import { ManagementTablePagination } from "./management-table-pagination";
import { UsersTable } from "./users-table";
import { CreateUserForm } from "./create-user-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserPlus, Search } from "lucide-react";

export function AdminUsersManagement() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );
  const [searchInput, setSearchInput] = useState(search);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

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
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className={DIALOG_CONTENT_CLASS}>
            <DialogHeader className={DIALOG_HEADER_CLASS}>
              <DialogTitle className={DIALOG_TITLE_CLASS}>
                Add user
              </DialogTitle>
              <DialogDescription className={DIALOG_DESCRIPTION_CLASS}>
                Create an institutional account. All fields except full name are required.
              </DialogDescription>
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

      <Card className={MANAGEMENT_CARD_CLASS}>
        <Can permission="USERS">
          <div className={MANAGEMENT_CARD_HEADER_CLASS}>
            <p className="text-sm text-muted-foreground">
              {data
                ? formatManagementShowingRange(page, USERS_PAGE_SIZE, data.total)
                : "Loading…"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-0 sm:max-w-[260px]">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  type="search"
                  placeholder="Search by email or name…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setSearch(searchInput);
                      setPage(1);
                    }
                  }}
                  onBlur={() => {
                    if (searchInput !== search) {
                      setSearch(searchInput);
                      setPage(1);
                    }
                  }}
                  className="h-9 rounded-lg bg-background pl-9"
                  aria-label="Search users by email or name"
                />
              </div>
              <Button
                onClick={() => setShowCreate((v) => !v)}
                variant={showCreate ? "secondary" : "default"}
                size="sm"
                className="shrink-0 gap-2"
              >
                <UserPlus className="size-4 shrink-0" aria-hidden />
                {showCreate ? "Cancel" : "Add user"}
              </Button>
            </div>
          </div>
        </Can>
        <CardContent className="gap-0 p-0">
          {status === "pending" && !data ? (
            <div className={TABLE_LOADING_CELL_CLASS}>
              Loading accounts…
            </div>
          ) : (
            <>
              <UsersTable
                users={data?.data ?? []}
                isRefetching={isFetching}
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
        </CardContent>
      </Card>
    </div>
  );
}
