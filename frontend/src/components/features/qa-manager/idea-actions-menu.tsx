"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, User, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  IDEAS_ACTIONS_TRIGGER,
  IDEAS_ACTIONS_MENU,
  IDEAS_ACTIONS_ITEM,
  IDEAS_ACTIONS_ITEM_DESTRUCTIVE,
  TYPO_BODY_SM,
} from "@/config/design";
import {
  ALERT_DIALOG_ERROR_CLASS,
  DIALOG_CONTENT_SCULPTED_CLASS,
  DIALOG_OVERLAY_SCULPTED_CLASS,
  DIALOG_HEADER_SCULPTED_CLASS,
  DIALOG_TITLE_SCULPTED_CLASS,
  FORM_DIALOG_FORM_CLASS,
  FORM_DIALOG_ROOT_ERROR_CLASS,
} from "@/components/features/admin/constants";
import { revealIdeaAuthor, useDeleteIdeaMutation } from "@/hooks/use-ideas";
import { ROUTES } from "@/config/constants";
import { getErrorMessage, ERROR_FALLBACK_FORM } from "@/lib/errors";
import { cn } from "@/lib/utils";

export type IdeaForMenu = { id: string; isAnonymous: boolean; cycleStatus?: string | null };

/** True when QA Manager has at least one usable action (Reveal Author or Delete). */
export function hasIdeaActions(idea: IdeaForMenu): boolean {
  return idea.isAnonymous || idea.cycleStatus === "ACTIVE";
}

export function IdeaActionsMenu({ idea }: { idea: IdeaForMenu }) {
  const router = useRouter();
  const deleteMutation = useDeleteIdeaMutation();
  const [revealOpen, setRevealOpen] = useState(false);
  const [revealData, setRevealData] = useState<{ fullName: string | null; email: string } | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const canDelete = idea.cycleStatus === "ACTIVE";
  if (!hasIdeaActions(idea)) return null;

  const handleRevealAuthor = async () => {
    setRevealError(null);
    setRevealData(null);
    try {
      const data = await revealIdeaAuthor(idea.id);
      setRevealData(data);
      setRevealOpen(true);
    } catch (e) {
      setRevealError(e instanceof Error ? e.message : "Could not load author.");
      setRevealOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(idea.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        router.push(ROUTES.QA_MANAGER_IDEAS);
      },
    });
  };

  const revealOnly = idea.isAnonymous && !canDelete;

  return (
    <>
      {revealOnly ? (
        <button
          type="button"
          onClick={handleRevealAuthor}
          className={cn(
            "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors",
            "text-primary hover:bg-primary/[0.08] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          )}
          aria-label="Reveal author"
        >
          <User className="size-3.5 shrink-0" aria-hidden />
          Reveal Author
        </button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={IDEAS_ACTIONS_TRIGGER}
              aria-label="Proposal options"
            >
              <MoreVertical className="size-3.5" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4} className={IDEAS_ACTIONS_MENU}>
            {idea.isAnonymous && (
              <DropdownMenuItem
                onClick={handleRevealAuthor}
                className={IDEAS_ACTIONS_ITEM}
              >
                <User aria-hidden />
                Reveal Author
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => canDelete && setDeleteDialogOpen(true)}
              className={IDEAS_ACTIONS_ITEM_DESTRUCTIVE}
              disabled={!canDelete}
              title={!canDelete ? "Cannot delete ideas in closed proposal cycles" : undefined}
            >
              <Trash2 aria-hidden />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Reveal author result — click outside or Escape to close */}
      <Dialog open={revealOpen} onOpenChange={setRevealOpen}>
        <DialogContent
          showCloseButton={false}
          overlayClassName={DIALOG_OVERLAY_SCULPTED_CLASS}
          className={cn(DIALOG_CONTENT_SCULPTED_CLASS, "sm:max-w-sm")}
        >
          <DialogHeader className={DIALOG_HEADER_SCULPTED_CLASS}>
            <DialogTitle className={DIALOG_TITLE_SCULPTED_CLASS}>
              {revealError ? "Could not load author" : "Author"}
            </DialogTitle>
          </DialogHeader>
          <div className={FORM_DIALOG_FORM_CLASS}>
            {revealError ? (
              <p className={FORM_DIALOG_ROOT_ERROR_CLASS} role="alert">
                {revealError}
              </p>
            ) : revealData ? (
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <span className="text-muted-foreground/80 shrink-0">Full name</span>
                <span className="text-foreground min-w-0">{revealData.fullName?.trim() || "—"}</span>
                <span className="text-muted-foreground/80 shrink-0">Email</span>
                <span className="break-all text-foreground min-w-0">{revealData.email}</span>
              </div>
            ) : (
              <p className={TYPO_BODY_SM}>Not anonymous.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete proposal?</AlertDialogTitle>
            <AlertDialogDescription>
              Removes the proposal permanently. Cannot be undone.
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
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
