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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IDEAS_ACTIONS_TRIGGER, IDEAS_ACTIONS_MENU, IDEAS_ACTIONS_ITEM, IDEAS_ACTIONS_ITEM_DESTRUCTIVE } from "@/config/design";
import { revealIdeaAuthor, useDeleteIdeaMutation } from "@/hooks/use-ideas";
import { ROUTES } from "@/config/constants";
import { getErrorMessage, ERROR_FALLBACK_FORM } from "@/lib/errors";

type IdeaForMenu = { id: string; isAnonymous: boolean };

export function IdeaActionsMenu({ idea }: { idea: IdeaForMenu }) {
  const router = useRouter();
  const deleteMutation = useDeleteIdeaMutation();
  const [revealOpen, setRevealOpen] = useState(false);
  const [revealData, setRevealData] = useState<{ fullName: string | null; email: string } | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={IDEAS_ACTIONS_TRIGGER}
            aria-label="Idea options"
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
              View author identity
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className={IDEAS_ACTIONS_ITEM_DESTRUCTIVE}
          >
            <Trash2 aria-hidden />
            Delete idea
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Reveal author result dialog */}
      <AlertDialog open={revealOpen} onOpenChange={setRevealOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {revealError ? "Error" : "Author identity"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {revealError ? (
                <span className="text-destructive/90">{revealError}</span>
              ) : revealData ? (
                <span className="font-medium">
                  {revealData.fullName?.trim() || "(No name)"}
                  {" — "}
                  {revealData.email}
                </span>
              ) : (
                "This idea is not anonymous."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setRevealOpen(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this idea?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the proposal and cannot be undone.
              {deleteMutation.isError && (
                <span className="block mt-2 text-sm text-destructive/90">
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
