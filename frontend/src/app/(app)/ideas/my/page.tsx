"use client";

import { useState } from "react";
import Link from "next/link";
import { useMyIdeasQuery, useDeleteMyIdeaMutation } from "@/hooks/use-ideas";
import type { OwnIdeaListItem } from "@/lib/schemas/ideas.schema";
import { ROUTES } from "@/config/constants";
import { getErrorMessage } from "@/lib/errors";
import { timeAgo } from "@/lib/utils";
import { LoadingState } from "@/components/ui/loading-state";
import { Badge } from "@/components/ui/badge";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  PAGE_WRAPPER_NARROW_CLASS,
  BACK_LINK_CLASS,
  PAGE_TITLE_CLASS,
  STAFF_DESCRIPTION_CLASS,
  STAFF_HEADER_ACCENT_CLASS,
} from "@/config/design";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  FileText,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Lightbulb,
  Lock,
} from "lucide-react";

/* ─── Constants ───────────────────────────────────────────────────────────── */

const PAGE_SIZE = 5;
const PREVIEW_LEN = 140;

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function isEditable(idea: OwnIdeaListItem): boolean {
  if (!idea.submissionClosesAt) return false;
  return new Date() < new Date(idea.submissionClosesAt);
}

/* ─── IdeaRow ─────────────────────────────────────────────────────────────── */

function IdeaRow({
  idea,
  onDelete,
}: {
  idea: OwnIdeaListItem;
  onDelete: (idea: OwnIdeaListItem) => void;
}) {
  const editable = isEditable(idea);
  const votes = idea.voteCounts ?? { up: 0, down: 0 };
  const comments = idea.commentCount ?? 0;
  const desc = idea.description ?? "";
  const truncated = desc.length > PREVIEW_LEN;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/55 bg-card transition-all duration-300 hover:border-border/60 hover:shadow-lg hover:shadow-black/[0.03]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.015] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative px-6 py-5 sm:px-7 sm:py-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link
                href={`${ROUTES.IDEAS}/${idea.id}`}
                className="rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <h2 className="font-sans text-lg font-bold leading-[1.3] tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary sm:text-xl">
                  {idea.title}
                </h2>
              </Link>
              {!editable && (
                <Badge
                  variant="outline"
                  className="gap-1 rounded-full border-warning/30 bg-warning/10 px-2 py-0 text-[10px] font-normal text-warning"
                >
                  <Lock className="size-2.5" aria-hidden />
                  Closed
                </Badge>
              )}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground/50">
              <time dateTime={new Date(idea.createdAt).toISOString()}>
                {timeAgo(idea.createdAt)}
              </time>
              {idea.category?.name && (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <span
                      className="size-1 rounded-full bg-primary/40"
                      aria-hidden
                    />
                    {idea.category.name}
                  </span>
                </>
              )}
              {idea.isAnonymous && (
                <>
                  <span aria-hidden>·</span>
                  <span className="italic">Anonymous</span>
                </>
              )}
              {idea.attachments.length > 0 && (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <FileText className="size-3" aria-hidden />
                    {idea.attachments.length} file
                    {idea.attachments.length !== 1 ? "s" : ""}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1">
            {editable && (
              <Link
                href={`${ROUTES.MY_IDEAS}/${idea.id}/edit`}
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-muted/[0.06] hover:text-foreground/80"
                aria-label="Edit proposal"
              >
                <Pencil className="size-3.5" aria-hidden />
              </Link>
            )}
            <button
              type="button"
              onClick={() => onDelete(idea)}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label="Delete proposal"
            >
              <Trash2 className="size-3.5" aria-hidden />
            </button>
          </div>
        </div>

        {/* Description preview */}
        {desc && (
          <p className="mt-3 text-[13px] leading-[1.7] text-foreground/50 line-clamp-2">
            {truncated ? desc.slice(0, PREVIEW_LEN) + "…" : desc}
          </p>
        )}

        {/* Stats */}
        <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground/40">
          <span className="inline-flex items-center gap-1">
            <ThumbsUp className="size-3" aria-hidden />
            <span className="tabular-nums">{votes.up}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <ThumbsDown className="size-3" aria-hidden />
            <span className="tabular-nums">{votes.down}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="size-3" aria-hidden />
            <span className="tabular-nums">{comments}</span>
          </span>
        </div>
      </div>
    </article>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function MyIdeasPage() {
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<OwnIdeaListItem | null>(
    null,
  );
  const { data, status, error } = useMyIdeasQuery(
    { page, limit: PAGE_SIZE },
    { enabled: true },
  );
  const deleteMutation = useDeleteMyIdeaMutation();

  if (status === "error") throw error;

  const ideas = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      // If we just deleted the last item on this page and we're not on page 1, go back
      if (ideas.length === 1 && page > 1) setPage(page - 1);
    } catch {
      // error is shown in the dialog
    }
  };

  return (
    <div className={`space-y-10 ${PAGE_WRAPPER_NARROW_CLASS}`}>
      {/* Header */}
      <header className="space-y-4">
        <nav aria-label="Breadcrumb">
          <Link
            href={ROUTES.IDEAS}
            className={BACK_LINK_CLASS}
            aria-label="Return to Ideas Hub"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            Ideas Hub
          </Link>
        </nav>
        <div>
          <h1 className={PAGE_TITLE_CLASS}>My Ideas</h1>
          <p className={STAFF_DESCRIPTION_CLASS}>
            View and manage proposals you have submitted.
          </p>
          <div className={`mt-4 ${STAFF_HEADER_ACCENT_CLASS}`} aria-hidden />
        </div>
      </header>

      {/* Feed */}
      {status === "pending" ? (
        <div className="flex flex-col items-center py-28">
          <LoadingState />
        </div>
      ) : !ideas.length ? (
        <div className="flex flex-col items-center py-28 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/[0.08]">
            <Lightbulb
              className="size-6 text-muted-foreground/40"
              aria-hidden
            />
          </div>
          <p className="mt-5 text-[14px] font-medium text-foreground/80">
            You haven&apos;t submitted any proposals yet
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground/50">
            Head to the Ideas Hub to share your first idea
          </p>
          <Link
            href={ROUTES.IDEAS}
            className="mt-5 inline-flex h-9 items-center gap-2 rounded-full bg-primary px-5 text-[13px] font-medium text-primary-foreground shadow-sm transition-transform hover:scale-[1.02]"
          >
            Go to Ideas Hub
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="tabular-nums text-[11px] text-muted-foreground/40">
              {total} proposal{total !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="space-y-4">
            {ideas.map((idea) => (
              <IdeaRow
                key={idea.id}
                idea={idea}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          {pages > 1 && (
            <Pagination className="pt-6">
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    aria-disabled={page <= 1}
                    className={
                      page <= 1
                        ? "pointer-events-none opacity-40"
                        : "rounded-lg"
                    }
                  />
                </PaginationItem>
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(p);
                      }}
                      isActive={page === p}
                      className="rounded-lg"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < pages) setPage(page + 1);
                    }}
                    aria-disabled={page >= pages}
                    className={
                      page >= pages
                        ? "pointer-events-none opacity-40"
                        : "rounded-lg"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans text-lg font-semibold tracking-tight">
              Delete proposal
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] leading-relaxed text-muted-foreground">
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                &ldquo;{deleteTarget?.title}&rdquo;
              </span>{" "}
              along with all its comments, votes, and attachments. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteMutation.error && (
            <p className="text-[13px] text-destructive" role="alert">
              {getErrorMessage(
                deleteMutation.error,
                "Could not delete the proposal.",
              )}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-lg"
              disabled={deleteMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
