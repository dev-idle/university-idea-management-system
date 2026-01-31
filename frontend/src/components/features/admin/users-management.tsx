"use client";

import { useMemo, useState } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { Can } from "@/components/ui/can";
import { Button } from "@/components/ui/button";
import { useUsersListQuery, useCreateUserMutation } from "@/hooks/use-users";
import { UsersTable } from "./users-table";
import { CreateUserForm } from "./create-user-form";

const PAGE_SIZE = 10;

export function AdminUsersManagement() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [showCreate, setShowCreate] = useState(false);

  const { data, status, error, isFetching } = useUsersListQuery({
    page,
    limit: PAGE_SIZE,
  });

  const totalPages = useMemo(
    () => (data ? Math.ceil(data.total / data.limit) : 0),
    [data]
  );

  const createMutation = useCreateUserMutation();

  if (status === "error") {
    throw error;
  }

  return (
    <div className="space-y-6">
      <Can permission="USERS">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {data
              ? `Showing ${(page - 1) * data.limit + 1}–${Math.min(page * data.limit, data.total)} of ${data.total}`
              : "Loading…"}
          </span>
          <Button onClick={() => setShowCreate((v) => !v)} variant="default">
            {showCreate ? "Cancel" : "Add user"}
          </Button>
        </div>
      </Can>

      {showCreate && (
        <Can permission="USERS">
          <CreateUserForm
            onSuccess={() => {
              setShowCreate(false);
            }}
            onCancel={() => setShowCreate(false)}
            isPending={createMutation.isPending}
            mutateAsync={createMutation.mutateAsync}
            error={createMutation.error}
          />
        </Can>
      )}

      <div className="rounded-lg border border-border bg-card">
        {status === "pending" && !data ? (
          <div className="flex items-center justify-center p-12 text-muted-foreground">
            Loading users…
          </div>
        ) : (
          <>
            <UsersTable
              users={data?.data ?? []}
              isRefetching={isFetching}
            />
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
