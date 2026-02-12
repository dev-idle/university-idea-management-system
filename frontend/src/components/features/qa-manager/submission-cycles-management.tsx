"use client";

import { useMemo, useState } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useAuthStore } from "@/stores/auth.store";
import { hasRole } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useSubmissionCyclesQuery,
  useCreateSubmissionCycleMutation,
  useUpdateSubmissionCycleMutation,
  useActivateSubmissionCycleMutation,
  useCloseSubmissionCycleMutation,
  useDeactivateSubmissionCycleMutation,
  useDeleteSubmissionCycleMutation,
} from "@/hooks/use-submission-cycles";
import type { SubmissionCycle } from "@/lib/schemas/submission-cycles.schema";
import {
  MANAGEMENT_CARD_HEADER_CLASS,
  MANAGEMENT_CARD_CLASS,
  DIALOG_CONTENT_CLASS_LG,
  DIALOG_HEADER_CLASS,
  DIALOG_TITLE_CLASS,
  DIALOG_DESCRIPTION_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEAD_CELL_ACTIONS_CLASS,
  TABLE_ACTIONS_MIN_W_3,
  TABLE_ACTIONS_CELL_CLASS,
  TABLE_LOADING_CELL_CLASS,
  TABLE_EMPTY_CELL_CLASS,
  TABLE_BASE_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_ROW_CLASS,
  TABLE_CELL_CLASS,
  TABLE_CELL_NAME_CLASS,
  TABLE_ACTIONS_WRAPPER_CLASS,
  ACTION_BUTTON_EDIT_CLASS,
  ACTION_BUTTON_DESTRUCTIVE_CLASS,
  ACTION_BUTTON_SUCCESS_CLASS,
  ACTION_BUTTON_MUTED_CLASS,
  ACTION_BUTTON_DISABLED_BLUR_CLASS,
  STATUS_BADGE_ACTIVE_CLASS,
  STATUS_BADGE_INACTIVE_CLASS,
  STATUS_BADGE_CLOSED_CLASS,
  ALERT_DIALOG_ERROR_CLASS,
  MANAGEMENT_PAGE_SIZE,
  MANAGEMENT_PAGINATION_MIN_TOTAL,
  formatManagementShowingRange,
} from "@/components/features/admin/constants";
import { ManagementTablePagination } from "@/components/features/admin/management-table-pagination";
import { CreateCycleForm } from "./create-cycle-form";
import { UpdateCycleForm } from "./update-cycle-form";
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
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { CalendarRange, Pencil, CircleCheck, CircleX, Lock, Trash2 } from "lucide-react";

function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const COLUMNS_WITH_ACTIONS = 7;
const COLUMNS_NAME_ONLY = 6;

const STATUS_CLASS: Record<string, string> = {
  DRAFT: STATUS_BADGE_INACTIVE_CLASS,
  ACTIVE: STATUS_BADGE_ACTIVE_CLASS,
  CLOSED: STATUS_BADGE_CLOSED_CLASS,
};

const STATUS_TOOLTIP: Record<string, string> = {
  DRAFT: "Draft – not yet open; can be edited and activated",
  ACTIVE: "Active – open for ideas, comments, and votes",
  CLOSED: "Closed – no longer accepting ideas or interactions",
};

export function SubmissionCyclesManagement() {
  const user = useAuthStore((s) => s.user);
  const isQaManager = hasRole(user?.roles, "QA_MANAGER");

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [showCreate, setShowCreate] = useState(false);
  const [editingCycle, setEditingCycle] = useState<SubmissionCycle | null>(null);

  const { data: cycles, status, error, isFetching } = useSubmissionCyclesQuery();

  const total = cycles?.length ?? 0;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / MANAGEMENT_PAGE_SIZE)), [total]);
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const around = 2;
    const start = Math.max(1, page - around);
    const end = Math.min(totalPages, page + around);
    const pages: (number | "ellipsis-left" | "ellipsis-right")[] = [];
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("ellipsis-left");
    }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("ellipsis-right");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, page]);
  const paginatedList = useMemo(
    () => cycles?.slice((page - 1) * MANAGEMENT_PAGE_SIZE, page * MANAGEMENT_PAGE_SIZE) ?? [],
    [cycles, page]
  );

  const createMutation = useCreateSubmissionCycleMutation();
  const updateMutation = useUpdateSubmissionCycleMutation();
  const activateMutation = useActivateSubmissionCycleMutation();
  const closeMutation = useCloseSubmissionCycleMutation();
  const deactivateMutation = useDeactivateSubmissionCycleMutation();
  const deleteMutation = useDeleteSubmissionCycleMutation();

  const [cycleToDeactivate, setCycleToDeactivate] = useState<SubmissionCycle | null>(null);
  const [cycleToDelete, setCycleToDelete] = useState<SubmissionCycle | null>(null);

  function handleConfirmDeactivate() {
    if (!cycleToDeactivate) return;
    deactivateMutation.mutate(cycleToDeactivate.id, {
      onSuccess: () => setCycleToDeactivate(null),
    });
  }

  function handleConfirmDelete() {
    if (!cycleToDelete) return;
    deleteMutation.mutate(cycleToDelete.id, {
      onSuccess: () => setCycleToDelete(null),
    });
  }

  const canActivate = (c: SubmissionCycle) =>
    c.status === "DRAFT" &&
    c.academicYear?.isActive === true &&
    !cycles?.some((x) => x.id !== c.id && x.status === "ACTIVE");
  const canClose = (c: SubmissionCycle) =>
    c.status === "ACTIVE" && new Date(c.interactionClosesAt) <= new Date();

  if (status === "error") {
    throw error;
  }

  return (
    <div className="space-y-6">
      <AlertDialog
        open={!!cycleToDeactivate}
        onOpenChange={(open) => !open && setCycleToDeactivate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate submission cycle?</AlertDialogTitle>
            <AlertDialogDescription>
              {cycleToDeactivate?.name ?? cycleToDeactivate?.academicYear.name}
              {" — "}
              The cycle will revert to DRAFT and can be edited or activated again. No data is deleted.
              {deactivateMutation.isError && (
                <span className={ALERT_DIALOG_ERROR_CLASS}>
                  {getErrorMessage(deactivateMutation.error, "Deactivate failed.")}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDeactivate}
              disabled={deactivateMutation.isPending}
            >
              {deactivateMutation.isPending ? "Deactivating…" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!cycleToDelete}
        onOpenChange={(open) => !open && setCycleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete submission cycle?</AlertDialogTitle>
            <AlertDialogDescription>
              {cycleToDelete?.name ?? cycleToDelete?.academicYear.name}
              {" — "}
              This will permanently remove the cycle. Only DRAFT or CLOSED cycles can be deleted. This action cannot be undone.
              {deleteMutation.isError && (
                <span className={ALERT_DIALOG_ERROR_CLASS}>
                  {getErrorMessage(deleteMutation.error, "Delete failed.")}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isQaManager && (
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className={DIALOG_CONTENT_CLASS_LG}>
            <DialogHeader className={DIALOG_HEADER_CLASS}>
              <DialogTitle className={DIALOG_TITLE_CLASS}>
                Add submission cycle
              </DialogTitle>
              <DialogDescription className={DIALOG_DESCRIPTION_CLASS}>
                Create a new idea submission cycle (DRAFT). Each cycle is linked to an academic year and defines closure times for ideas, comments, and votes. Name is required and unique; select at least one category. Only one cycle can be ACTIVE at a time.
              </DialogDescription>
            </DialogHeader>
            <CreateCycleForm
              onSuccess={() => setShowCreate(false)}
              onCancel={() => setShowCreate(false)}
              isPending={createMutation.isPending}
              mutateAsync={createMutation.mutateAsync}
              error={createMutation.error ?? null}
              variant="dialog"
            />
          </DialogContent>
        </Dialog>
      )}

      {isQaManager && editingCycle && (
        <Dialog open={!!editingCycle} onOpenChange={(open) => !open && setEditingCycle(null)}>
          <DialogContent className={DIALOG_CONTENT_CLASS_LG}>
            <DialogHeader className={DIALOG_HEADER_CLASS}>
              <DialogTitle className={DIALOG_TITLE_CLASS}>
                Edit submission cycle
              </DialogTitle>
              <DialogDescription className={DIALOG_DESCRIPTION_CLASS}>
                DRAFT and ACTIVE cycles can be updated. Closure times for ideas, comments, and votes can be adjusted. Name is required and cannot be duplicated; academic year is read-only.
              </DialogDescription>
            </DialogHeader>
            <UpdateCycleForm
              cycle={editingCycle}
              onSuccess={() => setEditingCycle(null)}
              onCancel={() => setEditingCycle(null)}
              isPending={updateMutation.isPending}
              mutateAsync={updateMutation.mutateAsync}
              error={updateMutation.error ?? null}
              variant="dialog"
            />
          </DialogContent>
        </Dialog>
      )}

      <Card className={MANAGEMENT_CARD_CLASS}>
        {isQaManager && (
          <div className={MANAGEMENT_CARD_HEADER_CLASS}>
            <p className="text-sm text-muted-foreground">
              {cycles
                ? formatManagementShowingRange(page, MANAGEMENT_PAGE_SIZE, total)
                : "Loading…"}
            </p>
            <Button
              onClick={() => setShowCreate((v) => !v)}
              variant={showCreate ? "secondary" : "default"}
              size="sm"
              className="shrink-0 gap-2"
            >
              <CalendarRange className="size-4 shrink-0" aria-hidden />
              {showCreate ? "Cancel" : "Add cycle"}
            </Button>
          </div>
        )}
        <CardContent className="gap-0 p-0">
          {status === "pending" && !cycles ? (
            <div className={TABLE_LOADING_CELL_CLASS}>
              Loading submission cycles…
            </div>
          ) : (
            <>
              <TooltipProvider delayDuration={300}>
                <div className={cn("overflow-x-auto", isFetching && "opacity-70")}>
                  <table className={TABLE_BASE_CLASS}>
                    <thead>
                      <tr className={TABLE_HEAD_ROW_CLASS}>
                        <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                          Academic year
                        </th>
                        <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                          Name
                        </th>
                        <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                          Status
                        </th>
                        <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                          Idea closes
                        </th>
                        <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                          Comments & votes close
                        </th>
                        <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                          Categories
                        </th>
                        {isQaManager && (
                          <th scope="col" className={cn(TABLE_ACTIONS_MIN_W_3, TABLE_HEAD_CELL_ACTIONS_CLASS)}>
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {!cycles || cycles.length === 0 ? (
                        <tr>
                          <td
                            colSpan={isQaManager ? COLUMNS_WITH_ACTIONS : COLUMNS_NAME_ONLY}
                            className={TABLE_EMPTY_CELL_CLASS}
                          >
                            No submission cycles yet.
                          </td>
                        </tr>
                      ) : (
                        paginatedList.map((c) => (
                          <tr key={c.id} className={TABLE_ROW_CLASS}>
                            <td className={TABLE_CELL_NAME_CLASS}>
                              {c.academicYear.name}
                            </td>
                            <td className={cn(TABLE_CELL_CLASS, "text-muted-foreground")}>
                              {c.name ?? "—"}
                            </td>
                            <td className={TABLE_CELL_CLASS}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className={cn(
                                      "cursor-default",
                                      STATUS_CLASS[c.status] ?? STATUS_CLASS.DRAFT
                                    )}
                                  >
                                    {c.status}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  {STATUS_TOOLTIP[c.status] ?? STATUS_TOOLTIP.DRAFT}
                                </TooltipContent>
                              </Tooltip>
                            </td>
                            <td className={cn(TABLE_CELL_CLASS, "text-muted-foreground")}>
                              {formatDateTime(c.ideaSubmissionClosesAt)}
                            </td>
                            <td className={cn(TABLE_CELL_CLASS, "text-muted-foreground")}>
                              {formatDateTime(c.interactionClosesAt)}
                            </td>
                            <td className={cn(TABLE_CELL_CLASS, "text-muted-foreground")}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex cursor-default items-center text-primary underline decoration-primary/30 decoration-dotted underline-offset-2">
                                    {c.categories.length}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                    Categories
                                  </p>
                                  {c.categories.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">None assigned</p>
                                  ) : (
                                    <ul className="space-y-1 text-sm text-foreground">
                                      {c.categories.map((cat) => (
                                        <li key={cat.id}>{cat.name}</li>
                                      ))}
                                    </ul>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </td>
                            {isQaManager && (
                              <td className={cn(TABLE_ACTIONS_MIN_W_3, TABLE_ACTIONS_CELL_CLASS)}>
                                <div className={TABLE_ACTIONS_WRAPPER_CLASS}>
                                  {/* Slot 1: Edit (DRAFT or ACTIVE) or spacer */}
                                  {c.status === "DRAFT" || c.status === "ACTIVE" ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className={ACTION_BUTTON_EDIT_CLASS}
                                          onClick={() => setEditingCycle(c)}
                                          aria-label="Edit cycle"
                                        >
                                          <Pencil className="size-4" aria-hidden />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">Edit</TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <span className="size-8 shrink-0" aria-hidden />
                                  )}
                                  {/* Slot 2: Activate (DRAFT) or Deactivate (ACTIVE) or spacer */}
                                  {c.status === "DRAFT" ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex shrink-0">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                              canActivate(c)
                                                ? ACTION_BUTTON_SUCCESS_CLASS
                                                : ACTION_BUTTON_DISABLED_BLUR_CLASS + " size-8"
                                            )}
                                            disabled={activateMutation.isPending || !canActivate(c)}
                                            onClick={() => canActivate(c) && activateMutation.mutate(c.id)}
                                            aria-label="Activate cycle"
                                          >
                                            <CircleCheck className="size-4" aria-hidden />
                                          </Button>
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        {canActivate(c)
                                          ? "Activate"
                                          : !c.academicYear?.isActive
                                            ? "Set this cycle's academic year to Active in Academic Years (Admin) first"
                                            : "Another submission cycle is already active"}
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : c.status === "ACTIVE" ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className={ACTION_BUTTON_DESTRUCTIVE_CLASS}
                                          disabled={deactivateMutation.isPending}
                                          onClick={() => {
                                            deactivateMutation.reset();
                                            setCycleToDeactivate(c);
                                          }}
                                          aria-label="Deactivate cycle"
                                        >
                                          <CircleX className="size-4" aria-hidden />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">Deactivate</TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <span className="size-8 shrink-0" aria-hidden />
                                  )}
                                  {/* Slot 3: Close (ACTIVE + after interaction close) or Delete */}
                                  {canClose(c) ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className={ACTION_BUTTON_MUTED_CLASS}
                                          disabled={closeMutation.isPending}
                                          onClick={() => closeMutation.mutate(c.id)}
                                          aria-label="Close cycle"
                                        >
                                          <Lock className="size-4" aria-hidden />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">Close cycle</TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex shrink-0">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                              c.status !== "ACTIVE"
                                                ? ACTION_BUTTON_DESTRUCTIVE_CLASS
                                                : ACTION_BUTTON_DISABLED_BLUR_CLASS + " size-8"
                                            )}
                                            disabled={deleteMutation.isPending || c.status === "ACTIVE"}
                                            onClick={() => {
                                              if (c.status === "ACTIVE") return;
                                              deleteMutation.reset();
                                              setCycleToDelete(c);
                                            }}
                                            aria-label="Delete cycle"
                                          >
                                            <Trash2 className="size-4" aria-hidden />
                                          </Button>
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        {c.status === "ACTIVE"
                                          ? "Deactivate or close the cycle first"
                                          : "Delete"}
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </TooltipProvider>
              {total >= MANAGEMENT_PAGINATION_MIN_TOTAL && totalPages > 0 && (
                <ManagementTablePagination
                  page={page}
                  totalPages={totalPages}
                  setPage={setPage}
                  ariaLabel="Submission cycles pagination"
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
