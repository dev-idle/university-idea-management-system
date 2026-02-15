"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { Can } from "@/components/ui/can";
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
  useDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from "@/hooks/use-departments";
import type { Department } from "@/lib/schemas/departments.schema";
import { getErrorMessage, ERROR_FALLBACK_FORM } from "@/lib/errors";
import {
  UNIFIED_CARD_CLASS,
  UNIFIED_CARD_TOOLBAR_CLASS,
  UNIFIED_SEARCH_INPUT_CLASS,
  TOOLBAR_ADD_BUTTON_BASE_CLASS,
  TOOLBAR_ADD_BUTTON_PRIMARY_CLASS,
  LOADING_STATE_WRAPPER_CLASS,
  LOADING_STATE_CONTENT_CLASS,
  LOADING_SPINNER_CLASS,
  DIALOG_CONTENT_SCULPTED_CLASS,
  DIALOG_OVERLAY_SCULPTED_CLASS,
  DIALOG_HEADER_SCULPTED_CLASS,
  DIALOG_TITLE_SCULPTED_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEAD_CELL_ACTIONS_CLASS,
  TABLE_ACTIONS_MIN_W_2,
  TABLE_ACTIONS_CELL_CLASS,
  TABLE_LOADING_CELL_CLASS,
  TABLE_EMPTY_CELL_CLASS,
  TABLE_BASE_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_ROW_CLASS,
  TABLE_CELL_NAME_CLASS,
  TABLE_ACTIONS_WRAPPER_CLASS,
  ACTION_BUTTON_EDIT_CLASS,
  ACTION_BUTTON_DESTRUCTIVE_CLASS,
  ACTION_BUTTON_DISABLED_BLUR_CLASS,
  ALERT_DIALOG_ERROR_CLASS,
  MANAGEMENT_PAGE_SIZE,
  MANAGEMENT_PAGINATION_MIN_TOTAL,
} from "./constants";
import { ManagementTablePagination } from "./management-table-pagination";
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
import { Building2, Pencil, Plus, Trash2, Search } from "lucide-react";

const COLUMN_COUNT = 2;

export function DepartmentsManagement() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
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

  const { data: departments, status, error, isFetching } = useDepartmentsQuery();

  const filtered = useMemo(() => {
    if (!departments) return [];
    if (!searchQuery.trim()) return departments;
    const q = searchQuery.trim().toLowerCase();
    return departments.filter((d) => d.name.toLowerCase().includes(q));
  }, [departments, searchQuery]);

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
                Add Department
              </DialogTitle>
            </DialogHeader>
            <CreateDepartmentForm
              onSuccess={() => setShowCreate(false)}
              onCancel={() => setShowCreate(false)}
              isPending={createMutation.isPending}
              mutateAsync={createMutation.mutateAsync}
              variant="dialog"
            />
          </DialogContent>
        </Dialog>
      </Can>

      <Can permission="DEPARTMENTS">
        <Dialog
          open={!!editingDepartment}
          onOpenChange={(open) => {
            if (!open) updateMutation.reset();
            if (!open) setEditingDepartment(null);
          }}
        >
          <DialogContent
            className={DIALOG_CONTENT_SCULPTED_CLASS}
            overlayClassName={DIALOG_OVERLAY_SCULPTED_CLASS}
          >
            <DialogHeader className={DIALOG_HEADER_SCULPTED_CLASS}>
              <DialogTitle className={DIALOG_TITLE_SCULPTED_CLASS}>
                Edit department
              </DialogTitle>
            </DialogHeader>
            {editingDepartment && (
              <UpdateDepartmentForm
                department={editingDepartment}
                onSuccess={() => setEditingDepartment(null)}
                onCancel={() => setEditingDepartment(null)}
                isPending={updateMutation.isPending}
                mutateAsync={updateMutation.mutateAsync}
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
                <span className={ALERT_DIALOG_ERROR_CLASS}>
                  {getErrorMessage(deleteMutation.error, ERROR_FALLBACK_FORM.delete)}
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
        <Can permission="DEPARTMENTS">
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
                aria-label="Search departments"
                placeholder="Search by name…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className={UNIFIED_SEARCH_INPUT_CLASS}
              />
              <kbd
                className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center rounded border border-border bg-muted/20 px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground sm:inline-flex"
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
                <Building2 className="size-4 shrink-0" aria-hidden />
              ) : (
                <Plus className="size-4 shrink-0" aria-hidden />
              )}
              {showCreate ? "Cancel" : "Add Department"}
            </Button>
          </div>
        </Can>

        {status === "pending" && !departments ? (
          <div className={LOADING_STATE_WRAPPER_CLASS}>
            <div className={LOADING_STATE_CONTENT_CLASS}>
              <div className={LOADING_SPINNER_CLASS} aria-hidden />
              <p className="font-sans text-sm font-medium text-muted-foreground">Loading departments…</p>
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
                      <Can permission="DEPARTMENTS">
                        <th scope="col" className={cn(TABLE_ACTIONS_MIN_W_2, TABLE_HEAD_CELL_ACTIONS_CLASS)}>
                          Actions
                        </th>
                      </Can>
                    </tr>
                  </thead>
                  <tbody>
                    {!departments || departments.length === 0 ? (
                      <tr>
                        <td colSpan={COLUMN_COUNT} className={TABLE_EMPTY_CELL_CLASS}>
                          <p className="font-sans text-sm font-medium text-foreground">
                            No departments yet.
                          </p>
                          <p className="mt-1.5 font-sans text-xs text-muted-foreground/90">
                            Add one to get started.
                          </p>
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={COLUMN_COUNT} className={TABLE_EMPTY_CELL_CLASS}>
                          <p className="font-sans text-sm font-medium text-foreground">
                            No matching departments.
                          </p>
                          <p className="mt-1.5 font-sans text-xs text-muted-foreground/90">
                            Try a different search.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      paginatedList.map((d) => (
                        <tr key={d.id} className={TABLE_ROW_CLASS}>
                          <td className={TABLE_CELL_NAME_CLASS}>
                            {d.name}
                          </td>
                          <Can permission="DEPARTMENTS">
                            <td className={cn(TABLE_ACTIONS_MIN_W_2, TABLE_ACTIONS_CELL_CLASS)}>
                              <div className={TABLE_ACTIONS_WRAPPER_CLASS}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      className={ACTION_BUTTON_EDIT_CLASS}
                                      onClick={() => setEditingDepartment(d)}
                                      aria-label="Edit department"
                                    >
                                      <Pencil className="size-4" aria-hidden />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Edit</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex shrink-0">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        className={cn(
                                          (d._count?.users ?? 0) === 0
                                            ? ACTION_BUTTON_DESTRUCTIVE_CLASS
                                            : ACTION_BUTTON_DISABLED_BLUR_CLASS + " size-8"
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
            {total >= MANAGEMENT_PAGINATION_MIN_TOTAL && totalPages > 0 && (
              <ManagementTablePagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
                ariaLabel="Departments pagination"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
