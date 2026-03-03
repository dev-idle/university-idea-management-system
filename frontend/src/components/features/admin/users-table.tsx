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
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEAD_CELL_ACTIONS_CLASS,
  TABLE_ACTIONS_MIN_W_2,
  TABLE_ACTIONS_CELL_CLASS,
  TABLE_EMPTY_CELL_CLASS,
  TABLE_EMPTY_PRIMARY_CLASS,
  TABLE_EMPTY_HINT_CLASS,
  TABLE_BASE_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_ROW_CLASS,
  TABLE_CELL_CLASS,
  TABLE_CELL_NAME_CLASS,
  TABLE_CELL_STATUS_CLASS,
  TABLE_ACTIONS_WRAPPER_CLASS,
  ACTION_BUTTON_EDIT_CLASS,
  ACTION_BUTTON_WARNING_CLASS,
  ACTION_BUTTON_SUCCESS_CLASS,
  ACTION_BUTTON_DISABLED_BLUR_CLASS,
  STATUS_BADGE_ACTIVE_CLASS,
  STATUS_BADGE_INACTIVE_CLASS,
  DIALOG_CONTENT_SCULPTED_CLASS,
  DIALOG_OVERLAY_SCULPTED_CLASS,
  DIALOG_HEADER_SCULPTED_CLASS,
  DIALOG_TITLE_SCULPTED_CLASS,
  ALERT_DIALOG_ERROR_CLASS,
} from "./constants";
import { getErrorMessage, ERROR_FALLBACK_FORM } from "@/lib/errors";
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
  /** When true and empty, show "No users found" / "Try another search."; otherwise "No users yet." / "Add one to begin." */
  hasActiveSearch?: boolean;
  /** Per-department: hasQaCoordinator (active QC). Used to disable Activate for inactive QCs when dept already has one. */
  departmentCompliance?: Array<{ id: string; hasQaCoordinator: boolean }>;
}

export function UsersTable({ users, isRefetching, hasActiveSearch = false, departmentCompliance }: UsersTableProps) {
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

  const deptHasActiveQc = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const c of departmentCompliance ?? []) {
      map.set(c.id, c.hasQaCoordinator);
    }
    return map;
  }, [departmentCompliance]);

  function shouldDisableActivate(user: UserListItem): boolean {
    const role = user.roles?.[0];
    if (role !== "QA_COORDINATOR" || user.isActive) return false;
    const deptId = user.departmentId;
    if (!deptId) return false;
    return deptHasActiveQc.get(deptId) === true;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="overflow-x-auto">
        <table className={TABLE_BASE_CLASS}>
          <thead>
            <tr className={TABLE_HEAD_ROW_CLASS}>
              <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                Email
              </th>
              <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                Full name
              </th>
              <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                Role
              </th>
              <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                Department
              </th>
              <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                Status
              </th>
              <Can permission="USERS">
                <th scope="col" className={cn(TABLE_ACTIONS_MIN_W_2, TABLE_HEAD_CELL_ACTIONS_CLASS)}>
                  Actions
                </th>
              </Can>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={USERS_TABLE_COLUMN_COUNT} className={TABLE_EMPTY_CELL_CLASS}>
                  <p className={TABLE_EMPTY_PRIMARY_CLASS}>
                    {hasActiveSearch ? "No users found." : "No users yet."}
                  </p>
                  <p className={TABLE_EMPTY_HINT_CLASS}>
                    {hasActiveSearch ? "Try another search." : "Add one to begin."}
                  </p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className={TABLE_ROW_CLASS}>
                  <td className={TABLE_CELL_NAME_CLASS}>
                    {user.email}
                  </td>
                  <td className={TABLE_CELL_CLASS}>
                    {user.fullName?.trim() || "—"}
                  </td>
                  <td className={TABLE_CELL_CLASS}>
                    {formatRoles(user.roles)}
                  </td>
                  <td className={cn(TABLE_CELL_CLASS, "max-w-[12rem]")}>
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
                  <td className={TABLE_CELL_STATUS_CLASS}>
                    <span className={user.isActive ? STATUS_BADGE_ACTIVE_CLASS : STATUS_BADGE_INACTIVE_CLASS}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <Can permission="USERS">
                    <td className={cn(TABLE_ACTIONS_MIN_W_2, TABLE_ACTIONS_CELL_CLASS)}>
                      <div className={TABLE_ACTIONS_WRAPPER_CLASS}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className={cn(
                                updateMutation.isPending
                                  ? ACTION_BUTTON_DISABLED_BLUR_CLASS
                                  : ACTION_BUTTON_EDIT_CLASS
                              )}
                              disabled={updateMutation.isPending}
                              onClick={() => setEditUser(user)}
                              aria-label="Edit User"
                            >
                              <Pencil className="size-4" aria-hidden />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Edit</TooltipContent>
                        </Tooltip>
                        {user.isActive ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className={cn(
                                  togglingId === user.id
                                    ? ACTION_BUTTON_DISABLED_BLUR_CLASS
                                    : ACTION_BUTTON_WARNING_CLASS
                                )}
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
                              <span className="inline-flex shrink-0">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  className={cn(
                                    togglingId === user.id ||
                                      shouldDisableActivate(user)
                                      ? ACTION_BUTTON_DISABLED_BLUR_CLASS
                                      : ACTION_BUTTON_SUCCESS_CLASS
                                  )}
                                  disabled={
                                    togglingId === user.id ||
                                    shouldDisableActivate(user)
                                  }
                                  onClick={() =>
                                    !shouldDisableActivate(user) &&
                                    updateMutation.mutate({
                                      id: user.id,
                                      body: { isActive: true },
                                    })
                                  }
                                  aria-label="Activate user"
                                >
                                  <CircleCheck className="size-4" aria-hidden />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {shouldDisableActivate(user)
                                ? "Department already has an active QA Coordinator"
                                : "Activate"}
                            </TooltipContent>
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
              {updateMutation.isError && (
                <span className={ALERT_DIALOG_ERROR_CLASS}>
                  {getErrorMessage(updateMutation.error, ERROR_FALLBACK_FORM.deactivate)}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="warning"
              onClick={handleConfirmDeactivate}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Deactivating…" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!editUser}
        onOpenChange={(open) => {
          if (!open) updateMutation.reset();
          if (!open) setEditUser(null);
        }}
      >
        <DialogContent
          className={DIALOG_CONTENT_SCULPTED_CLASS}
          overlayClassName={DIALOG_OVERLAY_SCULPTED_CLASS}
        >
          <DialogHeader className={DIALOG_HEADER_SCULPTED_CLASS}>
            <DialogTitle className={DIALOG_TITLE_SCULPTED_CLASS}>
              Edit User
            </DialogTitle>
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
