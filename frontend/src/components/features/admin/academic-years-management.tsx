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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
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
import { MANAGEMENT_CARD_HEADER_CLASS } from "./constants";
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

const PAGE_SIZE = 10;
const COLUMN_COUNT = 5;

export function AcademicYearsManagement() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [showCreate, setShowCreate] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

  const { data: years, status, error, isFetching } = useAcademicYearsQuery();

  const total = years?.length ?? 0;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);
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
    () => years?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [],
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
          <DialogContent className="max-h-[90vh] overflow-y-auto rounded-xl border border-border/90 bg-card shadow-sm sm:max-w-lg">
            <DialogHeader className="space-y-1.5 text-left border-b border-border/80 pb-4">
              <DialogTitle className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                Add academic year
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
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
          <DialogContent className="max-h-[90vh] overflow-y-auto rounded-xl border border-border/90 bg-card shadow-sm sm:max-w-lg">
            <DialogHeader className="space-y-1.5 text-left border-b border-border/80 pb-4">
              <DialogTitle className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                Edit academic year
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
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

      <Card className="overflow-hidden rounded-xl border border-border/90 bg-card py-0 shadow-sm">
        <Can permission="ACADEMIC_YEARS">
          <div className={MANAGEMENT_CARD_HEADER_CLASS}>
            <p className="text-sm text-muted-foreground">
              {years
                ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`
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
            <div className="flex items-center justify-center px-6 py-20 text-sm text-muted-foreground">
              Loading academic years…
            </div>
          ) : (
            <>
              <TooltipProvider delayDuration={300}>
                <div className={cn("overflow-x-auto", isFetching && "opacity-70")}>
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th
                          scope="col"
                          className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6"
                        >
                          Start
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6"
                        >
                          End
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6"
                        >
                          Status
                        </th>
                        <Can permission="ACADEMIC_YEARS">
                          <th
                            scope="col"
                            className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6"
                          >
                            Actions
                          </th>
                        </Can>
                      </tr>
                    </thead>
                    <tbody>
                      {!years || years.length === 0 ? (
                        <tr>
                          <td
                            colSpan={COLUMN_COUNT}
                            className="px-4 py-14 text-center text-sm text-muted-foreground sm:px-6"
                          >
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
                                {y.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <Can permission="ACADEMIC_YEARS">
                              <td className="px-4 py-3 sm:px-6">
                                <div className="flex items-center gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 shrink-0 text-primary hover:bg-primary/10 hover:text-primary"
                                        onClick={() => setEditingYear(y)}
                                        aria-label="Edit academic year"
                                      >
                                        <Pencil className="size-4" aria-hidden />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">Edit name, dates & status</TooltipContent>
                                  </Tooltip>
                                  {!y.isActive && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="size-8 shrink-0 text-success hover:bg-success/10 hover:text-success"
                                          disabled={updateMutation.isPending}
                                          onClick={() => setActive(y)}
                                          aria-label="Activate academic year"
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
              </TooltipProvider>
              {total > 0 && totalPages > 0 && (
                <div className="flex flex-col gap-3 border-t border-border/80 bg-muted/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
                  <Pagination aria-label="Academic years pagination">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page > 1) setPage(page - 1);
                          }}
                          aria-disabled={page <= 1}
                          className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {pageNumbers.map((p) =>
                        p === "ellipsis-left" || p === "ellipsis-right" ? (
                          <PaginationItem key={p}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={p}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setPage(p);
                              }}
                              isActive={p === page}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page < totalPages) setPage(page + 1);
                          }}
                          aria-disabled={page >= totalPages}
                          className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
