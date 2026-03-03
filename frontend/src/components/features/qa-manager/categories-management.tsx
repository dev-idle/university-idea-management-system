"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
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
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/hooks/use-categories";
import type { Category } from "@/lib/schemas/categories.schema";
import { getErrorMessage, ERROR_FALLBACK_FORM } from "@/lib/errors";
import {
  UNIFIED_CARD_CLASS,
  UNIFIED_CARD_TOOLBAR_CLASS,
  UNIFIED_SEARCH_INPUT_CLASS,
  TOOLBAR_ADD_BUTTON_BASE_CLASS,
  TOOLBAR_ADD_BUTTON_PRIMARY_CLASS,
  DIALOG_CONTENT_SCULPTED_CLASS,
  DIALOG_OVERLAY_SCULPTED_CLASS,
  DIALOG_HEADER_SCULPTED_CLASS,
  DIALOG_TITLE_SCULPTED_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEAD_CELL_ACTIONS_CLASS,
  TABLE_ACTIONS_MIN_W_2,
  TABLE_ACTIONS_CELL_CLASS,
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
  SHOWING_RANGE_BADGE_CLASS,
  TOOLBAR_SEARCH_WIDTH,
} from "@/components/features/admin/constants";
import { ManagementTablePagination } from "@/components/features/admin/management-table-pagination";
import { CreateCategoryForm } from "./create-category-form";
import { UpdateCategoryForm } from "./update-category-form";
import { LoadingState } from "@/components/ui/loading-state";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

/** Columns: Name + Actions (when QA_MANAGER). Used for empty-state colSpan. */
const COLUMNS_WITH_ACTIONS = 2;
const COLUMNS_NAME_ONLY = 1;
const SEARCH_DEBOUNCE_MS = 350;

export function CategoriesManagement() {
  const user = useAuthStore((s) => s.user);
  const isQaManager = hasRole(user?.roles, "QA_MANAGER");

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const [showCreate, setShowCreate] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
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

  const { data: categories, status, error, isFetching } = useCategoriesQuery();

  const filtered = useMemo(() => {
    if (!categories) return [];
    if (!debouncedSearch.trim()) return categories;
    const q = debouncedSearch.trim().toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, debouncedSearch]);

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
    setPage(1);
  }, [debouncedSearch, setPage]);

  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();

  function handleConfirmDelete() {
    if (!categoryToDelete) return;
    deleteMutation.mutate(categoryToDelete.id, {
      onSuccess: () => setCategoryToDelete(null),
    });
  }

  const categoryInUse = (c: { _count?: { ideas?: number; cycleCategories?: number } }) =>
    (c._count?.ideas ?? 0) > 0 || (c._count?.cycleCategories ?? 0) > 0;

  if (status === "error") {
    throw error;
  }

  return (
    <div className="space-y-6">
      {isQaManager && (
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
                Add Category
              </DialogTitle>
            </DialogHeader>
            <CreateCategoryForm
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

      {isQaManager && (
        <Dialog
          open={!!editingCategory}
          onOpenChange={(open) => {
            if (!open) updateMutation.reset();
            if (!open) setEditingCategory(null);
          }}
        >
          <DialogContent
            className={DIALOG_CONTENT_SCULPTED_CLASS}
            overlayClassName={DIALOG_OVERLAY_SCULPTED_CLASS}
          >
            <DialogHeader className={DIALOG_HEADER_SCULPTED_CLASS}>
              <DialogTitle className={DIALOG_TITLE_SCULPTED_CLASS}>
                Edit Category
              </DialogTitle>
            </DialogHeader>
            {editingCategory && (
              <UpdateCategoryForm
                category={editingCategory}
                onSuccess={() => setEditingCategory(null)}
                onCancel={() => setEditingCategory(null)}
                isPending={updateMutation.isPending}
                mutateAsync={updateMutation.mutateAsync}
                error={updateMutation.error ?? null}
                variant="dialog"
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete?.name}
              {" — "}
              Remove from cycles or ideas before deletion.
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
                aria-label="Search categories"
                placeholder="Search by name…"
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
              <Plus className="size-4 shrink-0" aria-hidden />
              {showCreate ? "Cancel" : "Add Category"}
            </Button>
          </div>
        )}
        {status === "pending" && !categories ? (
          <LoadingState compact />
        ) : (
            <>
              <TooltipProvider delayDuration={300}>
                <div className="overflow-x-auto">
                  <table className={TABLE_BASE_CLASS}>
                    <thead>
                      <tr className={TABLE_HEAD_ROW_CLASS}>
                        <th scope="col" className={TABLE_HEAD_CELL_CLASS}>
                          Name
                        </th>
                        {isQaManager && (
                          <th scope="col" className={cn(TABLE_ACTIONS_MIN_W_2, TABLE_HEAD_CELL_ACTIONS_CLASS)}>
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {!filtered || filtered.length === 0 ? (
                        <tr>
                          <td
                            colSpan={isQaManager ? COLUMNS_WITH_ACTIONS : COLUMNS_NAME_ONLY}
                            className={TABLE_EMPTY_CELL_CLASS}
                          >
                            <p className="font-sans text-sm font-medium text-foreground">
                              {debouncedSearch.trim()
                                ? "No matching categories."
                                : "No categories yet."}
                            </p>
                            <p className="mt-1.5 font-sans text-xs text-muted-foreground/80">
                              {debouncedSearch.trim() ? "Try another search." : "Add one to begin."}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        paginatedList.map((c) => (
                          <tr key={c.id} className={TABLE_ROW_CLASS}>
                            <td className={TABLE_CELL_NAME_CLASS}>
                              {c.name}
                            </td>
                            {isQaManager && (
                              <td className={cn(TABLE_ACTIONS_MIN_W_2, TABLE_ACTIONS_CELL_CLASS)}>
                                <div className={TABLE_ACTIONS_WRAPPER_CLASS}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        className={ACTION_BUTTON_EDIT_CLASS}
                                        onClick={() => setEditingCategory(c)}
                                        aria-label="Edit Category"
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
                                            !categoryInUse(c)
                                              ? ACTION_BUTTON_DESTRUCTIVE_CLASS
                                              : ACTION_BUTTON_DISABLED_BLUR_CLASS
                                          )}
                                          onClick={() => {
                                            if (categoryInUse(c)) return;
                                            deleteMutation.reset();
                                            setCategoryToDelete(c);
                                          }}
                                          disabled={
                                            deleteMutation.isPending ||
                                            categoryInUse(c)
                                          }
                                          aria-label="Delete category"
                                        >
                                          <Trash2 className="size-4" aria-hidden />
                                        </Button>
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      {categoryInUse(c)
                                        ? "In use; reassign first"
                                        : "Delete"}
                                    </TooltipContent>
                                  </Tooltip>
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
                  ariaLabel="Categories pagination"
                />
              )}
            </>
          )}
      </div>
    </div>
  );
}
