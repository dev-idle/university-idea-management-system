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
  useDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from "@/hooks/use-departments";
import type { Department } from "@/lib/schemas/departments.schema";
import { getErrorMessage } from "@/lib/errors";
import { MANAGEMENT_CARD_HEADER_CLASS } from "./constants";
import { CreateDepartmentForm } from "./create-department-form";
import { UpdateDepartmentForm } from "./update-department-form";
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
import { cn } from "@/lib/utils";
import { Building2, Pencil, Trash2 } from "lucide-react";

const PAGE_SIZE = 10;
const COLUMN_COUNT = 2;

export function DepartmentsManagement() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [showCreate, setShowCreate] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

  const { data: departments, status, error, isFetching } = useDepartmentsQuery();

  const total = departments?.length ?? 0;
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
    () => departments?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [],
    [departments, page]
  );
  const createMutation = useCreateDepartmentMutation();
  const updateMutation = useUpdateDepartmentMutation();
  const deleteMutation = useDeleteDepartmentMutation();

  function handleConfirmDelete() {
    if (!departmentToDelete) return;
    deleteMutation.mutate(departmentToDelete.id, {
      onSuccess: () => setDepartmentToDelete(null),
    });
  }

  if (status === "error") {
    throw error;
  }

  return (
    <div className="space-y-6">
      <Can permission="DEPARTMENTS">
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-h-[90vh] overflow-y-auto rounded-xl border border-border/90 bg-card shadow-sm sm:max-w-lg">
            <DialogHeader className="space-y-1.5 text-left border-b border-border/80 pb-4">
              <DialogTitle className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                Add department
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
                Create a new department for institutional organisation.
              </DialogDescription>
            </DialogHeader>
            <CreateDepartmentForm
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

      <Can permission="DEPARTMENTS">
        <Dialog
          open={!!editingDepartment}
          onOpenChange={(open) => !open && setEditingDepartment(null)}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto rounded-xl border border-border/90 bg-card shadow-sm sm:max-w-lg">
            <DialogHeader className="space-y-1.5 text-left border-b border-border/80 pb-4">
              <DialogTitle className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                Edit department
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
                Update the department name.
              </DialogDescription>
            </DialogHeader>
            {editingDepartment && (
              <UpdateDepartmentForm
                department={editingDepartment}
                onSuccess={() => setEditingDepartment(null)}
                onCancel={() => setEditingDepartment(null)}
                isPending={updateMutation.isPending}
                mutateAsync={updateMutation.mutateAsync}
                error={updateMutation.error ?? null}
                variant="dialog"
              />
            )}
          </DialogContent>
        </Dialog>
      </Can>

      <AlertDialog
        open={!!departmentToDelete}
        onOpenChange={(open) => !open && setDepartmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete department?</AlertDialogTitle>
            <AlertDialogDescription>
              {departmentToDelete?.name}
              {" — "}
              All authorization is enforced by the backend. Delete is only available when no users are assigned; reassign or remove users first if needed.
              {deleteMutation.isError && (
                <span className="mt-2 block text-destructive">
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

      <Card className="overflow-hidden rounded-xl border border-border/90 bg-card py-0 shadow-sm">
        <Can permission="DEPARTMENTS">
          <div className={MANAGEMENT_CARD_HEADER_CLASS}>
            <p className="text-sm text-muted-foreground">
              {departments
                ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`
                : "Loading…"}
            </p>
            <Button
              onClick={() => setShowCreate((v) => !v)}
              variant={showCreate ? "secondary" : "default"}
              size="sm"
              className="shrink-0 gap-2"
            >
              <Building2 className="size-4 shrink-0" aria-hidden />
              {showCreate ? "Cancel" : "Add department"}
            </Button>
          </div>
        </Can>
        <CardContent className="gap-0 p-0">
          {status === "pending" && !departments ? (
            <div className="flex items-center justify-center px-6 py-20 text-sm text-muted-foreground">
              Loading departments…
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
                        <Can permission="DEPARTMENTS">
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
                      {!departments || departments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={COLUMN_COUNT}
                            className="px-4 py-14 text-center text-sm text-muted-foreground sm:px-6"
                          >
                            No departments yet.
                          </td>
                        </tr>
                      ) : (
                        paginatedList.map((d) => (
                          <tr
                            key={d.id}
                            className="border-b border-border/80 transition-colors last:border-0 hover:bg-muted/10"
                          >
                            <td className="px-4 py-3 font-medium text-foreground sm:px-6">
                              {d.name}
                            </td>
                            <Can permission="DEPARTMENTS">
                              <td className="px-4 py-3 sm:px-6">
                                <div className="flex items-center gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                                        onClick={() => setEditingDepartment(d)}
                                        aria-label="Edit department"
                                      >
                                        <Pencil className="size-4" aria-hidden />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">Edit name</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex shrink-0">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className={cn(
                                            "size-8 shrink-0",
                                            (d._count?.users ?? 0) === 0 &&
                                              "text-destructive hover:bg-destructive/10 hover:text-destructive",
                                            (d._count?.users ?? 0) > 0 &&
                                              "cursor-not-allowed text-muted-foreground opacity-60"
                                          )}
                                          onClick={() => {
                                            if ((d._count?.users ?? 0) > 0) return;
                                            deleteMutation.reset();
                                            setDepartmentToDelete(d);
                                          }}
                                          disabled={
                                            deleteMutation.isPending ||
                                            (d._count?.users ?? 0) > 0
                                          }
                                          aria-label="Delete department"
                                        >
                                          <Trash2 className="size-4" aria-hidden />
                                        </Button>
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      {(d._count?.users ?? 0) > 0
                                        ? "Has members — reassign or remove users first"
                                        : "Delete department"}
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
              {total > 0 && totalPages > 0 && (
                <div className="flex flex-col gap-3 border-t border-border/80 bg-muted/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
                  <Pagination aria-label="Departments pagination">
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
