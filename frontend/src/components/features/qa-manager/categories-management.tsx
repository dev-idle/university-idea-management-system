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
import { getErrorMessage } from "@/lib/errors";
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
  MANAGEMENT_PAGE_SIZE,
  MANAGEMENT_PAGINATION_MIN_TOTAL,
  formatManagementShowingRange,
} from "@/components/features/admin/constants";
import { ManagementTablePagination } from "@/components/features/admin/management-table-pagination";
import { CreateCategoryForm } from "./create-category-form";
import { UpdateCategoryForm } from "./update-category-form";
import { cn } from "@/lib/utils";
import { Tags, Pencil, Trash2 } from "lucide-react";

/** Columns: Name + Actions (when QA_MANAGER). Used for empty-state colSpan. */
const COLUMNS_WITH_ACTIONS = 2;
const COLUMNS_NAME_ONLY = 1;

export function CategoriesManagement() {
  const user = useAuthStore((s) => s.user);
  const isQaManager = hasRole(user?.roles, "QA_MANAGER");

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [showCreate, setShowCreate] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const { data: categories, status, error, isFetching } = useCategoriesQuery();

  const total = categories?.length ?? 0;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / MANAGEMENT_PAGE_SIZE)),
    [total]
  );
  const paginatedList = useMemo(
    () =>
      categories?.slice(
        (page - 1) * MANAGEMENT_PAGE_SIZE,
        page * MANAGEMENT_PAGE_SIZE
      ) ?? [],
    [categories, page]
  );
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
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className={DIALOG_CONTENT_CLASS}>
            <DialogHeader className={DIALOG_HEADER_CLASS}>
              <DialogTitle className={DIALOG_TITLE_CLASS}>
                Add category
              </DialogTitle>
              <DialogDescription className={DIALOG_DESCRIPTION_CLASS}>
                Create a new category for idea classification. Duplicate names are not allowed.
              </DialogDescription>
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
          onOpenChange={(open) => !open && setEditingCategory(null)}
        >
          <DialogContent className={DIALOG_CONTENT_CLASS}>
            <DialogHeader className={DIALOG_HEADER_CLASS}>
              <DialogTitle className={DIALOG_TITLE_CLASS}>
                Edit category
              </DialogTitle>
              <DialogDescription className={DIALOG_DESCRIPTION_CLASS}>
                Update the category name. Duplicate names are not allowed.
              </DialogDescription>
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
              Delete is only available when the category is not used in submission cycles or by ideas; remove or reassign first if needed.
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

      <Card className={MANAGEMENT_CARD_CLASS}>
        {isQaManager && (
          <div className={MANAGEMENT_CARD_HEADER_CLASS}>
            <p className="text-sm text-muted-foreground">
              {categories
                ? formatManagementShowingRange(page, MANAGEMENT_PAGE_SIZE, total)
                : "Loading…"}
            </p>
            <Button
              onClick={() => setShowCreate((v) => !v)}
              variant={showCreate ? "secondary" : "default"}
              size="sm"
              className="shrink-0 gap-2"
            >
              <Tags className="size-4 shrink-0" aria-hidden />
              {showCreate ? "Cancel" : "Add category"}
            </Button>
          </div>
        )}
        <CardContent className="gap-0 p-0">
          {status === "pending" && !categories ? (
            <div className={TABLE_LOADING_CELL_CLASS}>
              Loading categories…
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
                        {isQaManager && (
                          <th scope="col" className={cn(TABLE_ACTIONS_MIN_W_2, TABLE_HEAD_CELL_ACTIONS_CLASS)}>
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {!categories || categories.length === 0 ? (
                        <tr>
                          <td
                            colSpan={isQaManager ? COLUMNS_WITH_ACTIONS : COLUMNS_NAME_ONLY}
                            className={TABLE_EMPTY_CELL_CLASS}
                          >
                            No categories yet.
                          </td>
                        </tr>
                      ) : (
                        paginatedList.map((c) => (
                          <tr
                            key={c.id}
                            className="border-b border-border/80 transition-colors last:border-0 hover:bg-muted/10"
                          >
                            <td className="px-4 py-3 font-medium text-foreground sm:px-6">
                              {c.name}
                            </td>
                            {isQaManager && (
                              <td className={cn(TABLE_ACTIONS_MIN_W_2, TABLE_ACTIONS_CELL_CLASS)}>
                                <div className="inline-flex items-center justify-end gap-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                                        onClick={() => setEditingCategory(c)}
                                        aria-label="Edit category"
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
                                          size="icon"
                                          className={cn(
                                            "size-8 shrink-0",
                                            !categoryInUse(c) &&
                                              "text-destructive hover:bg-destructive/10 hover:text-destructive",
                                            categoryInUse(c) &&
                                              "cursor-not-allowed text-muted-foreground opacity-60"
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
                                        ? "In use by ideas or submission cycles — remove or reassign first"
                                        : "Delete category"}
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
        </CardContent>
      </Card>
    </div>
  );
}
