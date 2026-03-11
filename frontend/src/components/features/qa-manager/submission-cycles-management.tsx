"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useAuthStore } from "@/stores/auth.store";
import { hasRole } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
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
import {
  useSubmissionCyclesQuery,
  useCreateSubmissionCycleMutation,
  useUpdateSubmissionCycleMutation,
  useActivateSubmissionCycleMutation,
  useDeactivateSubmissionCycleMutation,
  useLockSubmissionCycleMutation,
  useUnlockSubmissionCycleMutation,
  useDeleteSubmissionCycleMutation,
} from "@/hooks/use-submission-cycles";
import type { SubmissionCycle } from "@/lib/schemas/submission-cycles.schema";
import {
  UNIFIED_CARD_CLASS,
  UNIFIED_CARD_TOOLBAR_CLASS,
  UNIFIED_SEARCH_INPUT_CLASS,
  TOOLBAR_ADD_BUTTON_BASE_CLASS,
  TOOLBAR_ADD_BUTTON_PRIMARY_CLASS,
  DIALOG_CONTENT_SCULPTED_CLASS_LG,
  DIALOG_OVERLAY_SCULPTED_CLASS,
  DIALOG_HEADER_SCULPTED_CLASS,
  DIALOG_TITLE_SCULPTED_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEAD_CELL_ACTIONS_CLASS,
  TABLE_ACTIONS_MIN_W_3,
  TABLE_ACTIONS_CELL_CLASS,
  TABLE_BASE_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_ROW_CLASS,
  TABLE_CELL_CLASS,
  TABLE_CELL_NAME_CLASS,
  TABLE_EMPTY_CELL_CLASS,
  STATUS_BADGE_ACTIVE_CLASS,
  STATUS_BADGE_INACTIVE_CLASS,
  STATUS_BADGE_ACTIVE_WARM_CLASS,
  STATUS_BADGE_CLOSED_CLASS,
  ALERT_DIALOG_ERROR_CLASS,
  MANAGEMENT_PAGE_SIZE,
  MANAGEMENT_PAGINATION_MIN_TOTAL,
  SHOWING_RANGE_BADGE_CLASS,
  TOOLBAR_SEARCH_WIDTH,
} from "@/components/features/admin/constants";
import { ManagementTablePagination } from "@/components/features/admin/management-table-pagination";
import { CreateCycleForm } from "./create-cycle-form";
import { UpdateCycleForm } from "./update-cycle-form";
import {
  CycleActionsCell,
  type CycleActionsCellProps,
} from "./cycle-actions-cell";
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
import { getErrorMessage, ERROR_FALLBACK_FORM } from "@/lib/errors";
import { LoadingState } from "@/components/ui/loading-state";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";
import { CalendarRange, Plus, Search } from "lucide-react";

const COLUMNS_WITH_ACTIONS = 7;
const SEARCH_DEBOUNCE_MS = 350;
const COLUMNS_NAME_ONLY = 6;

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

function getCycleDisplayStatus(c: SubmissionCycle): {
  label: string;
  badgeClass: string;
  tooltip: string;
} {
  const now = new Date();
  const ideaCloses = new Date(c.ideaSubmissionClosesAt);
  const interactionCloses = new Date(c.interactionClosesAt);
  const ideaCount = c._count?.ideas ?? 0;

  if (c.status === "DRAFT") {
    if (ideaCount >= 1) {
      return {
        label: "Closed",
        badgeClass: STATUS_BADGE_CLOSED_CLASS,
        tooltip: "Deactivated; contains ideas",
      };
    }
    return {
      label: "Draft",
      badgeClass: STATUS_BADGE_INACTIVE_CLASS,
      tooltip: "Draft; not yet open",
    };
  }

  if (c.status === "ACTIVE") {
    if (now < ideaCloses) {
      return {
        label: "Active",
        badgeClass: STATUS_BADGE_ACTIVE_CLASS,
        tooltip: "Accepting submissions",
      };
    }
    if (now < interactionCloses) {
      return {
        label: "Active",
        badgeClass: STATUS_BADGE_ACTIVE_WARM_CLASS,
        tooltip: "Voting phase",
      };
    }
    if (ideaCount >= 1) {
      return {
        label: "Closed",
        badgeClass: STATUS_BADGE_CLOSED_CLASS,
        tooltip: "Closed; contains ideas",
      };
    }
    return {
      label: "Draft",
      badgeClass: STATUS_BADGE_INACTIVE_CLASS,
      tooltip: "Closed; no submissions",
    };
  }

  if (c.status === "CLOSED") {
    if (ideaCount >= 1) {
      return {
        label: "Closed",
        badgeClass: STATUS_BADGE_CLOSED_CLASS,
        tooltip: "Closed; contains ideas",
      };
    }
    return {
      label: "Draft",
      badgeClass: STATUS_BADGE_INACTIVE_CLASS,
      tooltip: "Closed; no submissions",
    };
  }

  return { label: c.status, badgeClass: STATUS_BADGE_INACTIVE_CLASS, tooltip: c.status };
}

const StatusBadgeCell = memo(function StatusBadgeCell({
  label,
  badgeClass,
  tooltip,
}: {
  label: string;
  badgeClass: string;
  tooltip: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("cursor-default", badgeClass)}>{label}</span>
      </TooltipTrigger>
      <TooltipContent side="top">{tooltip}</TooltipContent>
    </Tooltip>
  );
});

export function SubmissionCyclesManagement() {
  const user = useAuthStore((s) => s.user);
  const isQaManager = hasRole(user?.roles, "QA_MANAGER");

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [searchInput, setSearchInput] = useState(search);
  const [debouncedSearch] = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const [showCreate, setShowCreate] = useState(false);
  const [editingCycle, setEditingCycle] = useState<SubmissionCycle | null>(null);
  const [cycleToDeactivate, setCycleToDeactivate] = useState<SubmissionCycle | null>(null);
  const [cycleToDelete, setCycleToDelete] = useState<SubmissionCycle | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

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

  const { data: cycles, status, error } = useSubmissionCyclesQuery();

  const filtered = useMemo(() => {
    if (!cycles) return [];
    if (!debouncedSearch.trim()) return cycles;
    const q = debouncedSearch.trim().toLowerCase();
    return cycles.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.academicYear?.name.toLowerCase().includes(q)
    );
  }, [cycles, debouncedSearch]);

  const total = filtered.length;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / MANAGEMENT_PAGE_SIZE)),
    [total]
  );
  const paginatedList = useMemo(
    () =>
      filtered.slice(
        (page - 1) * MANAGEMENT_PAGE_SIZE,
        page * MANAGEMENT_PAGE_SIZE
      ),
    [filtered, page]
  );

  useEffect(() => {
    if (debouncedSearch !== search) {
      setSearch(debouncedSearch);
      setPage(1);
    }
  }, [debouncedSearch, search, setSearch, setPage]);

  const createMutation = useCreateSubmissionCycleMutation();
  const updateMutation = useUpdateSubmissionCycleMutation();
  const activateMutation = useActivateSubmissionCycleMutation();
  const deactivateMutation = useDeactivateSubmissionCycleMutation();
  const lockMutation = useLockSubmissionCycleMutation();
  const unlockMutation = useUnlockSubmissionCycleMutation();
  const deleteMutation = useDeleteSubmissionCycleMutation();

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

  if (status === "error") {
    throw error;
  }

  return (
    <div className="space-y-10">
      <AlertDialog
        open={!!cycleToDeactivate}
        onOpenChange={(open) => !open && setCycleToDeactivate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate proposal cycle?</AlertDialogTitle>
            <AlertDialogDescription>
              {cycleToDeactivate?.name ?? cycleToDeactivate?.academicYear?.name}
              {" — "}
              Reverts to DRAFT; can be edited or activated again.
              {deactivateMutation.isError && (
                <span className={ALERT_DIALOG_ERROR_CLASS}>
                  {getErrorMessage(
                    deactivateMutation.error,
                    ERROR_FALLBACK_FORM.deactivate
                  )}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="warning"
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
            <AlertDialogTitle>Delete proposal cycle?</AlertDialogTitle>
            <AlertDialogDescription>
              {cycleToDelete?.name ?? cycleToDelete?.academicYear?.name}
              {" — "}
              Permanently removes the cycle. Only DRAFT or CLOSED can be deleted.
              {deleteMutation.isError && (
                <span className={ALERT_DIALOG_ERROR_CLASS}>
                  {getErrorMessage(
                    deleteMutation.error,
                    ERROR_FALLBACK_FORM.delete
                  )}
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
        <Dialog
          open={showCreate}
          onOpenChange={(open) => {
            if (!open) createMutation.reset();
            setShowCreate(open);
          }}
        >
          <DialogContent
            className={DIALOG_CONTENT_SCULPTED_CLASS_LG}
            overlayClassName={DIALOG_OVERLAY_SCULPTED_CLASS}
          >
            <DialogHeader className={DIALOG_HEADER_SCULPTED_CLASS}>
              <DialogTitle className={DIALOG_TITLE_SCULPTED_CLASS}>
                Add Proposal Cycle
              </DialogTitle>
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
        <Dialog
          open={!!editingCycle}
          onOpenChange={(open) => {
            if (!open) updateMutation.reset();
            if (!open) setEditingCycle(null);
          }}
        >
          <DialogContent
            className={DIALOG_CONTENT_SCULPTED_CLASS_LG}
            overlayClassName={DIALOG_OVERLAY_SCULPTED_CLASS}
          >
            <DialogHeader className={DIALOG_HEADER_SCULPTED_CLASS}>
              <DialogTitle className={DIALOG_TITLE_SCULPTED_CLASS}>
                Edit Proposal Cycle
              </DialogTitle>
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

      <div className={UNIFIED_CARD_CLASS}>
        {isQaManager && (
          <div className={UNIFIED_CARD_TOOLBAR_CLASS}>
            <div className={cn("relative", TOOLBAR_SEARCH_WIDTH)}>
              <Search
                className={cn(
                  "pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted-foreground/80 transition-opacity duration-200 ease-out motion-reduce:transition-none",
                  searchInput !== debouncedSearch && "opacity-60"
                )}
                aria-hidden
              />
              <input
                ref={searchInputRef}
                type="search"
                role="searchbox"
                aria-label="Search proposal cycles"
                placeholder="Search by name or year…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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
                <CalendarRange className="size-4 shrink-0" aria-hidden />
              ) : (
                <Plus className="size-4 shrink-0" aria-hidden />
              )}
              {showCreate ? "Cancel" : "Add Proposal Cycle"}
            </Button>
          </div>
        )}

        {status === "pending" && !cycles ? (
          <LoadingState compact />
        ) : (
          <>
            <TooltipProvider delayDuration={300}>
              <div
                className="overflow-x-auto"
              >
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
                        <th
                          scope="col"
                          className={cn(
                            TABLE_ACTIONS_MIN_W_3,
                            TABLE_HEAD_CELL_ACTIONS_CLASS
                          )}
                        >
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {!filtered || filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={
                            isQaManager ? COLUMNS_WITH_ACTIONS : COLUMNS_NAME_ONLY
                          }
                          className={TABLE_EMPTY_CELL_CLASS}
                        >
                          <p className="font-sans text-sm font-medium text-foreground">
                            {debouncedSearch.trim()
                              ? "No matching cycles."
                              : "No proposal cycles yet."}
                          </p>
                          <p className="mt-1.5 font-sans text-xs text-muted-foreground/80">
                            {debouncedSearch.trim()
                              ? "Try a different search."
                              : "Add one to begin."}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      paginatedList.map((c) => (
                        <tr key={c.id} className={TABLE_ROW_CLASS}>
                          <td className={TABLE_CELL_NAME_CLASS}>
                            {c.academicYear.name}
                          </td>
                          <td
                            className={cn(
                              TABLE_CELL_CLASS,
                              "text-muted-foreground"
                            )}
                          >
                            {c.name ?? "—"}
                          </td>
                          <td className={TABLE_CELL_CLASS}>
                            <StatusBadgeCell
                              {...getCycleDisplayStatus(c)}
                            />
                          </td>
                          <td
                            className={cn(
                              TABLE_CELL_CLASS,
                              "text-muted-foreground"
                            )}
                          >
                            {formatDateTime(c.ideaSubmissionClosesAt)}
                          </td>
                          <td
                            className={cn(
                              TABLE_CELL_CLASS,
                              "text-muted-foreground"
                            )}
                          >
                            {formatDateTime(c.interactionClosesAt)}
                          </td>
                          <td
                            className={cn(
                              TABLE_CELL_CLASS,
                              "text-muted-foreground"
                            )}
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex cursor-default items-center text-primary underline decoration-primary/30 decoration-dotted underline-offset-2">
                                  {c.categories.length}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                {c.categories.length === 0 ? (
                                  "None assigned"
                                ) : (
                                  <ul className="list-none space-y-0.5 py-0 pl-0">
                                    {c.categories.map((cat) => (
                                      <li key={cat.id}>{cat.name}</li>
                                    ))}
                                  </ul>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </td>
                          {isQaManager && (
                            <td
                              className={cn(
                                TABLE_ACTIONS_MIN_W_3,
                                TABLE_ACTIONS_CELL_CLASS
                              )}
                            >
                              <CycleActionsCell
                                cycle={c}
                                cycles={cycles}
                                onEdit={setEditingCycle}
                                onDeactivateConfirm={setCycleToDeactivate}
                                onDeleteConfirm={setCycleToDelete}
                                activateMutation={
                                  activateMutation as CycleActionsCellProps["activateMutation"]
                                }
                                deactivateMutation={
                                  deactivateMutation as CycleActionsCellProps["deactivateMutation"]
                                }
                                lockMutation={
                                  lockMutation as CycleActionsCellProps["lockMutation"]
                                }
                                unlockMutation={
                                  unlockMutation as CycleActionsCellProps["unlockMutation"]
                                }
                                deleteMutation={
                                  deleteMutation as CycleActionsCellProps["deleteMutation"]
                                }
                                updateMutation={updateMutation}
                              />
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
                ariaLabel="Proposal cycles pagination"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
