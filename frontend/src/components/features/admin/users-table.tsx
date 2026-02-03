"use client";

import { useMemo, useState } from "react";
import { Can } from "@/components/ui/can";
import { Pencil, CircleCheck, CircleX } from "lucide-react";
import { useUpdateUserMutation } from "@/hooks/use-users";
import type { UserListItem } from "@/lib/schemas/users.schema";
import { ROLE_LABELS, type Role } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { USERS_TABLE_COLUMN_COUNT } from "./users/constants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { EditUserForm } from "./edit-user-form";

function formatRoles(roles: string[] | undefined): string {
  if (!roles?.length) return "—";
  return roles
    .map((r) => ROLE_LABELS[r as Role] ?? r)
    .join(", ");
}

interface UsersTableProps {
  users: UserListItem[];
  isRefetching?: boolean;
}

export function UsersTable({ users, isRefetching }: UsersTableProps) {
  const updateMutation = useUpdateUserMutation();
  const [deactivateUser, setDeactivateUser] = useState<UserListItem | null>(null);
  const [editUser, setEditUser] = useState<UserListItem | null>(null);

  const togglingId = useMemo(
    () =>
      updateMutation.isPending && updateMutation.variables
        ? updateMutation.variables.id
        : null,
    [updateMutation.isPending, updateMutation.variables]
  );

  function handleConfirmDeactivate() {
    if (!deactivateUser) return;
    updateMutation.mutate(
      { id: deactivateUser.id, body: { isActive: false } },
      { onSettled: () => setDeactivateUser(null) }
    );
  }

  function handleEditSuccess() {
    setEditUser(null);
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("overflow-x-auto", isRefetching && "opacity-70")}>
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">
                Email
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">
                Full name
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">
                Role
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">
                Department
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">
                Status
              </th>
              <Can permission="USERS">
                <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">
                  Actions
                </th>
              </Can>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={USERS_TABLE_COLUMN_COUNT}
                  className="px-4 py-14 text-center text-sm text-muted-foreground sm:px-6"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border/80 transition-colors last:border-0 hover:bg-muted/10"
                >
                  <td className="px-4 py-3 font-medium text-foreground sm:px-6">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground sm:px-6">
                    {user.fullName?.trim() || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground sm:px-6">
                    {formatRoles(user.roles)}
                  </td>
                  <td className="max-w-[12rem] px-4 py-3 text-muted-foreground sm:px-6">
                    {user.department?.name ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block truncate" title={user.department.name}>
                            {user.department.name}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs break-words">
                          {user.department.name}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                        user.isActive
                          ? "border-success/20 bg-success/10 text-success"
                          : "border-border bg-muted/50 text-muted-foreground"
                      )}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <Can permission="USERS">
                    <td className="px-4 py-3 sm:px-6">
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                              disabled={updateMutation.isPending}
                              onClick={() => setEditUser(user)}
                              aria-label="Edit user"
                            >
                              <Pencil className="size-4" aria-hidden />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Edit (name & password)</TooltipContent>
                        </Tooltip>
                        {user.isActive ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                disabled={togglingId === user.id}
                                onClick={() => setDeactivateUser(user)}
                                aria-label="Deactivate user"
                              >
                                <CircleX className="size-4" aria-hidden />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Deactivate</TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 shrink-0 text-success hover:bg-success/10 hover:text-success"
                                disabled={togglingId === user.id}
                                onClick={() =>
                                  updateMutation.mutate({
                                    id: user.id,
                                    body: { isActive: true },
                                  })
                                }
                                aria-label="Activate user"
                              >
                                <CircleCheck className="size-4" aria-hidden />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Activate</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  </Can>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deactivateUser} onOpenChange={(open) => !open && setDeactivateUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke access for{" "}
              {deactivateUser ? (
                <span className="font-medium text-foreground">{deactivateUser.email}</span>
              ) : null}
              . They can be reactivated at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDeactivate}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="rounded-xl border border-border/90 bg-card shadow-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          {editUser && (
            <EditUserForm
              user={editUser}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditUser(null)}
              isPending={updateMutation.isPending}
              mutateAsync={updateMutation.mutateAsync}
              error={updateMutation.error}
              variant="dialog"
            />
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
