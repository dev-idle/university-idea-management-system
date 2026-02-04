"use client";

import { useMemo, useState } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { Can } from "@/components/ui/can";
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
  useAcademicYearsQuery,
  useCreateAcademicYearMutation,
  useUpdateAcademicYearMutation,
} from "@/hooks/use-academic-years";
import type { AcademicYear } from "@/lib/schemas/academic-years.schema";
import { CreateAcademicYearForm } from "./create-academic-year-form";
import { UpdateAcademicYearForm } from "./update-academic-year-form";
import {
  MANAGEMENT_CARD_HEADER_CLASS,
  MANAGEMENT_CARD_CLASS,
  DIALOG_CONTENT_CLASS,
  DIALOG_HEADER_CLASS,
  DIALOG_TITLE_CLASS,
  DIALOG_DESCRIPTION_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEAD_CELL_ACTIONS_CLASS,
  TABLE_ACTIONS_MIN_W_2,
  TABLE_ACTIONS_CELL_CLASS,
  TABLE_LOADING_CELL_CLASS,
  TABLE_EMPTY_CELL_CLASS,
  ACTION_BUTTON_DISABLED_BLUR_CLASS,
  MANAGEMENT_PAGE_SIZE,
  MANAGEMENT_PAGINATION_MIN_TOTAL,
  formatManagementShowingRange,
} from "./constants";
import { ManagementTablePagination } from "./management-table-pagination";
import { cn } from "@/lib/utils";
import { CalendarDays, Pencil, CircleCheck } from "lucide-react";

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

  const { data: listData, status, error, isFetching } = useAcademicYearsQuery();
  const years = useMemo(
    () => listData?.list ?? [],
    [listData?.list]
  );
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

  if (status === "error") {
    throw error;
  }

  const setActive = (year: AcademicYear) => {
    if (year.isActive) return;
    updateMutation.mutate({ id: year.id, body: { isActive: true } });
  };

  return (
    <div className="space-y-6">
      <Can permission="ACADEMIC_YEARS">
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className={DIALOG_CONTENT_CLASS}>
            <DialogHeader className={DIALOG_HEADER_CLASS}>
              <DialogTitle className={DIALOG_TITLE_CLASS}>
                Add academic year
              </DialogTitle>
              <DialogDescription className={DIALOG_DESCRIPTION_CLASS}>
                Define a new academic year with name and date range. Exactly one year can be active at a time.
              </DialogDescription>
            </DialogHeader>
            <CreateAcademicYearForm
              onSuccess={() => setShowCreate(false)}
              onCancel={() => setShowCreate(false)}
              isPending={createMutation.isPending}
              mutateAsync={createMutation.mutateAsync}
              error={createMutation.error ?? null}
              variant="dialog"
            />
          </DialogContent>
        </Dialog>
      </Can>

      <Can permission="ACADEMIC_YEARS">
        <Dialog open={!!editingYear} onOpenChange={(open) => !open && setEditingYear(null)}>
          <DialogContent className={DIALOG_CONTENT_CLASS}>
            <DialogHeader className={DIALOG_HEADER_CLASS}>
              <DialogTitle className={DIALOG_TITLE_CLASS}>
                Edit academic year
              </DialogTitle>
              <DialogDescription className={DIALOG_DESCRIPTION_CLASS}>
                Update name, dates, or active status. Exactly one year can be active at a time.
              </DialogDescription>
            </DialogHeader>
            {editingYear && (
              <UpdateAcademicYearForm
                academicYear={editingYear}
                onSuccess={() => setEditingYear(null)}
                onCancel={() => setEditingYear(null)}
                isPending={updateMutation.isPending}
                mutateAsync={updateMutation.mutateAsync}
                error={updateMutation.error ?? null}
                variant="dialog"
              />
            )}
          </DialogContent>
        </Dialog>
      </Can>

      <Card className={MANAGEMENT_CARD_CLASS}>
        <Can permission="ACADEMIC_YEARS">
          <div className={MANAGEMENT_CARD_HEADER_CLASS}>
            <p className="text-sm text-muted-foreground">
              {years
                ? formatManagementShowingRange(page, MANAGEMENT_PAGE_SIZE, total)
                : "Loading…"}
            </p>
            <Button
              onClick={() => setShowCreate((v) => !v)}
              variant={showCreate ? "secondary" : "default"}
              size="sm"
              className="shrink-0 gap-2"
            >
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              {showCreate ? "Cancel" : "Add academic year"}
            </Button>
          </div>
        </Can>
        <CardContent className="gap-0 p-0">
          {status === "pending" && !years ? (
            <div className={TABLE_LOADING_CELL_CLASS}>
              Loading academic years…
            </div>
          ) : (
            <>
              <TooltipProvider delayDuration={300}>
                <div className={cn("overflow-x-auto", isFetching && "opacity-70")}>
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
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
                          <th scope="col" className={cn(TABLE_ACTIONS_MIN_W_2, TABLE_HEAD_CELL_ACTIONS_CLASS)}>
                            Actions
                          </th>
                        </Can>
                      </tr>
                    </thead>
                    <tbody>
                      {!years || years.length === 0 ? (
                        <tr>
                          <td colSpan={COLUMN_COUNT} className={TABLE_EMPTY_CELL_CLASS}>
                            No academic years yet.
                          </td>
                        </tr>
                      ) : (
                        paginatedList.map((y) => (
                          <tr
                            key={y.id}
                            className="border-b border-border/80 transition-colors last:border-0 hover:bg-muted/10"
                          >
                            <td className="px-4 py-3 font-medium text-foreground sm:px-6">
                              {y.name}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground sm:px-6">
                              {formatDate(y.startDate)}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground sm:px-6">
                              {y.endDate ? formatDate(y.endDate) : "—"}
                            </td>
                            <td className="px-4 py-3 sm:px-6">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                                  y.isActive
                                    ? "border-success/20 bg-success/10 text-success"
                                    : "border-border bg-muted/50 text-muted-foreground"
                                )}
                              >
                                {y.isActive ? "ACTIVE" : "INACTIVE"}
                              </span>
                            </td>
                            <Can permission="ACADEMIC_YEARS">
                              <td className={cn(TABLE_ACTIONS_MIN_W_2, TABLE_ACTIONS_CELL_CLASS)}>
                                <div className="inline-flex items-center justify-end gap-2">
                                  {/* Edit: always available regardless of active submission cycle */}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 shrink-0 text-primary hover:bg-primary/10 hover:text-primary"
                                        disabled={updateMutation.isPending}
                                        onClick={() => setEditingYear(y)}
                                        aria-label="Edit academic year"
                                      >
                                        <Pencil className="size-4" aria-hidden />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">Edit</TooltipContent>
                                  </Tooltip>
                                  {/* Activate: grayed out when any submission cycle is active; or when this year is active and has an active cycle */}
                                  {!y.isActive ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex shrink-0">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                              "size-8 shrink-0",
                                              hasActiveSubmissionCycleInSystem
                                                ? ACTION_BUTTON_DISABLED_BLUR_CLASS
                                                : "text-success hover:bg-success/10 hover:text-success"
                                            )}
                                            disabled={
                                              hasActiveSubmissionCycleInSystem ||
                                              updateMutation.isPending
                                            }
                                            onClick={() =>
                                              !hasActiveSubmissionCycleInSystem &&
                                              setActive(y)
                                            }
                                            aria-label="Activate academic year"
                                          >
                                            <CircleCheck className="size-4" aria-hidden />
                                          </Button>
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        {hasActiveSubmissionCycleInSystem
                                          ? "A submission cycle is active. Deactivate or close it in Submission Cycles (QA Manager) to change active year."
                                          : "Activate"}
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    /* Keep Activate hidden for any row with Status ACTIVE (only inactive rows show the Activate action) */
                                    <span className="size-8 shrink-0" aria-hidden />
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
        </CardContent>
      </Card>
    </div>
  );
}
