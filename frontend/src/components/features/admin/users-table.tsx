"use client";

import { useMemo } from "react";
import { Can } from "@/components/ui/can";
import { useUpdateUserIsActiveMutation } from "@/hooks/use-users";
import type { UserListItem } from "@/lib/schemas/users.schema";
import { cn } from "@/lib/utils";

interface UsersTableProps {
  users: UserListItem[];
  isRefetching?: boolean;
}

export function UsersTable({ users, isRefetching }: UsersTableProps) {
  const updateMutation = useUpdateUserIsActiveMutation();

  const togglingId = useMemo(
    () =>
      updateMutation.isPending && updateMutation.variables
        ? updateMutation.variables.id
        : null,
    [updateMutation.isPending, updateMutation.variables]
  );

  return (
    <div className={cn("overflow-x-auto", isRefetching && "opacity-70")}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="p-4 font-medium text-foreground">Email</th>
            <th className="p-4 font-medium text-foreground">Role</th>
            <th className="p-4 font-medium text-foreground">Department</th>
            <th className="p-4 font-medium text-foreground">Status</th>
            <Can permission="USERS">
              <th className="p-4 font-medium text-foreground">Actions</th>
            </Can>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0">
                <td className="p-4 font-medium text-foreground">{user.email}</td>
                <td className="p-4 text-muted-foreground">
                  {user.roles?.join(", ") ?? "—"}
                </td>
                <td className="p-4 text-muted-foreground">
                  {user.department?.name ?? "—"}
                </td>
                <td className="p-4">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      user.isActive
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <Can permission="USERS">
                  <td className="p-4">
                    <button
                      type="button"
                      disabled={togglingId === user.id}
                      onClick={() =>
                        updateMutation.mutate({
                          id: user.id,
                          body: { isActive: !user.isActive },
                        })
                      }
                      className="text-primary hover:underline disabled:opacity-50"
                    >
                      {togglingId === user.id
                        ? "Updating…"
                        : user.isActive
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                  </td>
                </Can>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
