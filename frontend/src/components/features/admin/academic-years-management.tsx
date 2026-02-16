"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { Can } from "@/components/ui/can";
import { Button } from "@/components/ui/button";
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
import {
  useAcademicYearsQuery,
  useCreateAcademicYearMutation,
  useUpdateAcademicYearMutation,
  useDeleteAcademicYearMutation,
} from "@/hooks/use-academic-years";
import type { AcademicYear } from "@/lib/schemas/academic-years.schema";
import { CreateAcademicYearForm } from "./create-academic-year-form";
import { UpdateAcademicYearForm } from "./update-academic-year-form";
import {
  DIALOG_CONTENT_SCULPTED_CLASS,
  DIALOG_HEADER_SCULPTED_CLASS,
  DIALOG_OVERLAY_SCULPTED_CLASS,
  DIALOG_TITLE_SCULPTED_CLASS,
  MANAGEMENT_PAGE_SIZE,
  MANAGEMENT_PAGINATION_MIN_TOTAL,
  SHOWING_RANGE_BADGE_CLASS,
  LOADING_TABLE_TEXT_CLASS,
  UNIFIED_CARD_CLASS,
  UNIFIED_CARD_TOOLBAR_CLASS,
  UNIFIED_SEARCH_INPUT_CLASS,
  LOADING_STATE_WRAPPER_CLASS,
  LOADING_STATE_CONTENT_CLASS,
  LOADING_SPINNER_CLASS,
  TABLE_BASE_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEAD_CELL_ACTIONS_CLASS,
  TABLE_ACTIONS_MIN_W_3,
  TABLE_ROW_CLASS,
  TABLE_CELL_NAME_CLASS,
  TABLE_CELL_CLASS,
  TABLE_CELL_STATUS_CLASS,
  TABLE_ACTIONS_CELL_CLASS,
  TABLE_ACTIONS_WRAPPER_CLASS,
  TABLE_EMPTY_CELL_CLASS,
  STATUS_BADGE_ACTIVE_CLASS,
  STATUS_BADGE_INACTIVE_CLASS,
  ACTION_BUTTON_EDIT_CLASS,
  ACTION_BUTTON_SUCCESS_CLASS,
  ACTION_BUTTON_DISABLED_BLUR_CLASS,
  ACTION_BUTTON_DESTRUCTIVE_CLASS,
  ALERT_DIALOG_ERROR_CLASS,
  TOOLBAR_ADD_BUTTON_BASE_CLASS,
  TOOLBAR_ADD_BUTTON_PRIMARY_CLASS,
} from "./constants";
import { ManagementTablePagination } from "./management-table-pagination";
import { getErrorMessage, ERROR_FALLBACK_FORM } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { CalendarDays, Pencil, CircleCheck, Plus, Search, Trash2 } from "lucide-react";

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const COLUMN_COUNT = 5;

export function AcademicYearsManagement() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [showCreate, setShowCreate] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [yearToDelete, setYearToDelete] = useState<AcademicYear | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const { data: listData, status, error, isFetching } = useAcademicYearsQuery();
  const allYears = useMemo(
    () => listData?.list ?? [],
    [listData?.list]
  );
  const years = useMemo(() => {
    if (!searchQuery.trim()) return allYears;
    const q = searchQuery.trim().toLowerCase();
    return allYears.filter(
      (y) =>
        y.name.toLowerCase().includes(q) ||
        formatDate(y.startDate).toLowerCase().includes(q) ||
        (y.endDate ? formatDate(y.endDate).toLowerCase().includes(q) : false)
    );
  }, [allYears, searchQuery]);
  const hasActiveSubmissionCycleInSystem =
    listData?.hasActiveSubmissionCycleInSystem ?? false;

  const total = years.length;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / MANAGEMENT_PAGE_SIZE)),
    [total]
  );
  const paginatedList = useMemo(
    () =>
      years?.slice(
        (page - 1) * MANAGEMENT_PAGE_SIZE,
        page * MANAGEMENT_PAGE_SIZE
      ) ?? [],
    [years, page]
  );
  const createMutation = useCreateAcademicYearMutation();
  const updateMutation = useUpdateAcademicYearMutation();
  const deleteMutation = useDeleteAcademicYearMutation();

  if (status === "error") {
    throw error;
  }

  const setActive = (year: AcademicYear) => {
    if (year.isActive) return;
    updateMutation.mutate({ id: year.id, body: { isActive: true } });
  };

  function handleConfirmDelete() {
    if (!yearToDelete) return;
    deleteMutation.mutate(yearToDelete.id, {
      onSuccess: () => setYearToDelete(null),
    });
  }

  return (
    <div className="space-y-6">
      <Can permission="ACADEMIC_YEARS">
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
                Add Academic Year
              </DialogTitle>
            </DialogHeader>
            <CreateAcademicYearForm
              onSuccess={() => setShowCreate(false)}
              onCancel={() => setShowCreate(false)}
              isPending={createMutation.isPending}
              mutateAsync={createMutation.mutateAsync}
              variant="dialog"
            />
          </DialogContent>
        </Dialog>
      </Can>

      <Can permission="ACADEMIC_YEARS">
        <Dialog
          open={!!editingYear}
          onOpenChange={(open) => {
            if (!open) updateMutation.reset();
            if (!open) setEditingYear(null);
          }}
        >
          <DialogContent
            className={DIALOG_CONTENT_SCULPTED_CLASS}
            overlayClassName={DIALOG_OVERLAY_SCULPTED_CLASS}
          >
            <DialogHeader className={DIALOG_HEADER_SCULPTED_CLASS}>
              <DialogTitle className={DIALOG_TITLE_SCULPTED_CLASS}>
                Edit academic year
              </DialogTitle>
            </DialogHeader>
            {editingYear && (
              <UpdateAcademicYearForm
                academicYear={editingYear}
                onSuccess={() => setEditingYear(null)}
                onCancel={() => setEditingYear(null)}
                isPending={updateMutation.isPending}
                mutateAsync={updateMutation.mutateAsync}
                variant="dialog"
              />
            )}
          </DialogContent>
        </Dialog>
      </Can>

      <AlertDialog
        open={!!yearToDelete}
        onOpenChange={(open) => !open && setYearToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete academic year?</AlertDialogTitle>
            <AlertDialogDescription>
              {yearToDelete?.name}
              {" — "}
              Deactivate first if active; remove cycles before deletion.
              {deleteMutation.isError && (
                <span className={ALERT_DIALOG_ERROR_CLASS}>
                  {getErrorMessage(
                    deleteMutation.error,
                    ERROR_FALLBACK_FORM.deleteAcademicYear
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

      <div className={UNIFIED_CARD_CLASS}>
        <Can permission="ACADEMIC_YEARS">
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
                aria-label="Search academic years"
                placeholder="Search by name…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
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
                <CalendarDays className="size-4 shrink-0" aria-hidden />
              ) : (
                <Plus className="size-4 shrink-0" aria-hidden />
              )}
              {showCreate ? "Cancel" : "Add Academic Year"}
            </Button>
          </div>
        </Can>

        {status === "pending" && !years ? (
          <div className={LOADING_STATE_WRAPPER_CLASS}>
            <div className={LOADING_STATE_CONTENT_CLASS}>
              <div className={LOADING_SPINNER_CLASS} aria-hidden />
              <p className={LOADING_TABLE_TEXT_CLASS}>Loading academic years…</p>
            </div>
          </div>
        ) : (
          <>
            <TooltipProvider delayDuration={300}>
              <div className={cn("overflow-x-auto transition-opacity duration-200", isFetching && "opacity-60")}>
                <table className={TABLE_BASE_CLASS}>
                  <thead>
                    <tr className={TABLE_HEAD_ROW_CLASS}>
                      <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                        Name
                      </th>
                      <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                        Start
                      </th>
                      <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                        End
                      </th>
                      <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                        Status
                      </th>
                      <Can permission="ACADEMIC_YEARS">
                        <th scope="col" className={cn(TABLE_ACTIONS_MIN_W_3, TABLE_HEAD_CELL_ACTIONS_CLASS)}>
                          Actions
                        </th>
                      </Can>
                    </tr>
                  </thead>
                  <tbody>
                    {!years || years.length === 0 ? (
                      <tr>
                        <td colSpan={COLUMN_COUNT} className={TABLE_EMPTY_CELL_CLASS}>
                          <p className="font-sans text-sm font-medium text-foreground">
                            {searchQuery.trim()
                              ? "No matching academic years."
                              : "No academic years yet."}
                          </p>
                          <p className="mt-1.5 font-sans text-xs text-muted-foreground/90">
                            {searchQuery.trim() ? "Try a different search." : "Add one to begin."}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      paginatedList.map((y) => (
                        <tr key={y.id} className={TABLE_ROW_CLASS}>
                          <td className={TABLE_CELL_NAME_CLASS}>
                            {y.name}
                          </td>
                          <td className={cn(TABLE_CELL_CLASS, "tabular-nums")}>
                            {formatDate(y.startDate)}
                          </td>
                          <td className={cn(TABLE_CELL_CLASS, "tabular-nums")}>
                            {y.endDate ? formatDate(y.endDate) : "—"}
                          </td>
                          <td className={TABLE_CELL_STATUS_CLASS}>
                            <span className={y.isActive ? STATUS_BADGE_ACTIVE_CLASS : STATUS_BADGE_INACTIVE_CLASS}>
                              {y.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <Can permission="ACADEMIC_YEARS">
                            <td className={cn(TABLE_ACTIONS_MIN_W_3, TABLE_ACTIONS_CELL_CLASS)}>
                              <div className={TABLE_ACTIONS_WRAPPER_CLASS}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      className={ACTION_BUTTON_EDIT_CLASS}
                                      disabled={updateMutation.isPending}
                                      onClick={() => setEditingYear(y)}
                                      aria-label="Edit academic year"
                                    >
                                      <Pencil className="size-4" aria-hidden />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Edit</TooltipContent>
                                </Tooltip>
                                {!y.isActive ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex shrink-0">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon-sm"
                                          className={cn(
                                            hasActiveSubmissionCycleInSystem
                                              ? ACTION_BUTTON_DISABLED_BLUR_CLASS + " size-8"
                                              : ACTION_BUTTON_SUCCESS_CLASS
                                          )}
                                          disabled={
                                            hasActiveSubmissionCycleInSystem ||
                                            updateMutation.isPending
                                          }
                                          onClick={() =>
                                            !hasActiveSubmissionCycleInSystem && setActive(y)
                                          }
                                          aria-label="Activate academic year"
                                        >
                                          <CircleCheck className="size-4" aria-hidden />
                                        </Button>
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      {hasActiveSubmissionCycleInSystem
                                        ? "Cycle active; close in Proposal Cycles"
                                        : "Activate"}
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex shrink-0">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon-sm"
                                          className={ACTION_BUTTON_DISABLED_BLUR_CLASS + " size-8"}
                                          disabled
                                          aria-label="Active (disabled)"
                                        >
                                          <CircleCheck className="size-4" aria-hidden />
                                        </Button>
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      Active (disabled)
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex shrink-0">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        className={cn(
                                          y.isActive
                                            ? ACTION_BUTTON_DISABLED_BLUR_CLASS + " size-8"
                                            : ACTION_BUTTON_DESTRUCTIVE_CLASS
                                        )}
                                        disabled={
                                          y.isActive || deleteMutation.isPending
                                        }
                                        onClick={() =>
                                          !y.isActive &&
                                          (deleteMutation.reset(),
                                            setYearToDelete(y))
                                        }
                                        aria-label="Delete academic year"
                                      >
                                        <Trash2 className="size-4" aria-hidden />
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    {y.isActive
                                      ? "Deactivate first"
                                      : "Delete"}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </td>
                          </Can>
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
                ariaLabel="Academic years pagination"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
