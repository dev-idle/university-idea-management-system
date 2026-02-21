"use client";

import { useState } from "react";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useMyIdeasQuery, useDeleteMyIdeaMutation, useIdeasContextQuery } from "@/hooks/use-ideas";
import type { OwnIdeaListItem } from "@/lib/schemas/ideas.schema";
import { ROUTES } from "@/config/constants";
import { getErrorMessage } from "@/lib/errors";
import { cn, timeAgo, getAvatarInitial } from "@/lib/utils";
import { LoadingState } from "@/components/ui/loading-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  IDEAS_HUB_SPACING,
  IDEAS_HUB_ARTICLE_CLASS,
  IDEAS_HUB_CARD_PX,
  IDEAS_HUB_AVATAR,
  IDEAS_HUB_AUTHOR,
  IDEAS_HUB_TITLE,
  IDEAS_HUB_BYLINE_META,
  BYLINE_META_SEP,
  IDEAS_HUB_DESC,
  IDEAS_HUB_ENGAGEMENT_BORDER,
  IDEAS_HUB_ACTION_BASE,
  IDEAS_HUB_ACTION_INACTIVE,
  IDEAS_HUB_READ_MORE,
  IDEAS_HUB_ATTACHMENTS_LABEL,
  IDEAS_HUB_ATTACHMENTS_LIST,
  IDEAS_HUB_ATTACHMENT_ROW,
  IDEAS_HUB_FEED_GAP,
  IDEAS_HUB_PAGINATION,
  IDEAS_HUB_COUNT,
  IDEAS_HUB_EMPTY_ICON,
  IDEAS_HUB_TOOLBAR,
  IDEAS_HUB_SELECT_TRIGGER,
  IDEAS_HUB_TOOLBAR_DIVIDER,
} from "@/config/design";
import {
  BREADCRUMB_GHOST_CLASS,
  BREADCRUMB_SEP_CLASS,
} from "@/components/features/admin/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pencil,
  Trash2,
  FileText,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Lightbulb,
  Lock,
  ChevronDown,
  ChevronUp,
  Clock,
  Tag,
} from "lucide-react";

/* ─── Constants ───────────────────────────────────────────────────────────── */

const PAGE_SIZE = 5;
const PREVIEW_LEN = 200;

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function isEditable(idea: OwnIdeaListItem): boolean {
  if (!idea.submissionClosesAt) return false;
  return new Date() < new Date(idea.submissionClosesAt);
}

/* ─── IdeaRow — same structure as IdeaCard for consistency ────────────────── */

function IdeaRow({
  idea,
  isExpanded,
  onToggleExpand,
  onDelete,
}: {
  idea: OwnIdeaListItem;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onDelete: (idea: OwnIdeaListItem) => void;
}) {
  const editable = isEditable(idea);
  const votes = idea.voteCounts ?? { up: 0, down: 0 };
  const comments = idea.commentCount ?? 0;
  const desc = idea.description ?? "";
  const long = desc.length > PREVIEW_LEN;
  const authorLabel = idea.isAnonymous
    ? "Anonymous"
    : idea.author
      ? idea.author.fullName?.trim() || idea.author.email
      : "You";
  const avatarInitial = idea.isAnonymous
    ? "?"
    : idea.author
      ? getAvatarInitial(idea.author.fullName ?? null, idea.author.email)
      : "Y";

  return (
    <article className={IDEAS_HUB_ARTICLE_CLASS}>
      {/* Byline */}
      <div className={cn("flex items-start gap-3", IDEAS_HUB_CARD_PX, "pt-4 pb-3 sm:pt-5")}>
        <Avatar className={IDEAS_HUB_AVATAR}>
          <AvatarFallback className="bg-muted/50 text-[11px] font-semibold text-muted-foreground/70">
            {avatarInitial}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <span className={cn("block truncate", IDEAS_HUB_AUTHOR)}>
            {authorLabel}
          </span>
          <div className={IDEAS_HUB_BYLINE_META}>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3 shrink-0 opacity-50" aria-hidden />
              <time dateTime={new Date(idea.createdAt).toISOString()}>
                {timeAgo(idea.createdAt)}
              </time>
            </span>
            {idea.category?.name && (
              <>
                <span className={BYLINE_META_SEP} aria-hidden />
                <span className="inline-flex items-center gap-1.5 font-medium text-primary/80">
                  <Tag className="size-3 shrink-0 opacity-75" aria-hidden />
                  {idea.category.name}
                </span>
              </>
            )}
            {idea.attachments.length > 0 && (
              <>
                <span className={BYLINE_META_SEP} aria-hidden />
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="size-3 shrink-0 opacity-50" aria-hidden />
                  {idea.attachments.length} file{idea.attachments.length !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <div className={cn(IDEAS_HUB_CARD_PX, "pt-0")}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            href={`${ROUTES.IDEAS}/${idea.id}`}
            className="block rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <h2 className={IDEAS_HUB_TITLE}>{idea.title}</h2>
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
      </div>

      {/* Content */}
      <div className={cn(IDEAS_HUB_CARD_PX, "pb-4 sm:pb-5")}>
        {desc && (
          <div className="mt-3">
            <p
              className={cn(
                IDEAS_HUB_DESC,
                isExpanded ? "whitespace-pre-wrap" : "line-clamp-3",
              )}
            >
              {desc}
            </p>
            {long && !isExpanded && (
              <button
                type="button"
                className={cn(IDEAS_HUB_READ_MORE, "cursor-pointer")}
                onClick={() => onToggleExpand(idea.id)}
                aria-expanded={false}
                aria-label="Expand to read full description"
              >
                <ChevronDown className="size-3 shrink-0" aria-hidden />
                Read more
              </button>
            )}
          </div>
        )}

        {/* Attachments: below description when expanded */}
        {isExpanded && idea.attachments.length > 0 && (
          <div className="mt-4">
            <p className={IDEAS_HUB_ATTACHMENTS_LABEL}>Attached files</p>
            <div className={IDEAS_HUB_ATTACHMENTS_LIST}>
              {idea.attachments.map((att, i) => (
                <div
                  key={att.id}
                  className={cn(
                    IDEAS_HUB_ATTACHMENT_ROW,
                    i > 0 && "border-t border-border/20",
                  )}
                >
                  <FileText className="size-3 shrink-0 text-muted-foreground/45" aria-hidden />
                  <span className="min-w-0 truncate" title={att.fileName}>
                    {att.fileName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show less: at bottom when expanded */}
        {long && isExpanded && (
          <button
            type="button"
            className={cn(IDEAS_HUB_READ_MORE, "cursor-pointer mt-3")}
            onClick={() => onToggleExpand(idea.id)}
            aria-expanded={true}
            aria-label="Collapse description"
          >
            <ChevronUp className="size-3 shrink-0" aria-hidden />
            Show less
          </button>
        )}
      </div>

      {/* Engagement */}
      <div
        className={cn(
          "flex items-center gap-1",
          IDEAS_HUB_ENGAGEMENT_BORDER,
          IDEAS_HUB_CARD_PX,
          "py-2.5 sm:py-3",
        )}
        role="toolbar"
      >
        <span className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_ACTION_INACTIVE, "cursor-default")}>
          <ThumbsUp className="size-3.5 shrink-0" aria-hidden />
          {votes.up}
        </span>
        <div className="h-4 w-px shrink-0 self-center bg-border/30" aria-hidden />
        <span className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_ACTION_INACTIVE, "cursor-default")}>
          <ThumbsDown className="size-3.5 shrink-0" aria-hidden />
          {votes.down}
        </span>
        <div className="mx-1.5 h-4 w-px shrink-0 self-center bg-border/40" aria-hidden />
        <Link
          href={`${ROUTES.IDEAS}/${idea.id}`}
          className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_ACTION_INACTIVE, "cursor-pointer")}
        >
          <MessageSquare className="size-3.5 shrink-0" aria-hidden />
          {comments}
        </Link>
        <div className="min-w-0 flex-1" aria-hidden />
        {editable && (
          <Link
            href={`${ROUTES.MY_IDEAS}/${idea.id}/edit`}
            className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_ACTION_INACTIVE, "cursor-pointer")}
            aria-label="Edit proposal"
          >
            <Pencil className="size-3.5 shrink-0" aria-hidden />
          </Link>
        )}
        <button
          type="button"
          onClick={() => onDelete(idea)}
          className={cn(IDEAS_HUB_ACTION_BASE, "cursor-pointer text-muted-foreground/50 hover:text-destructive")}
          aria-label="Delete proposal"
        >
          <Trash2 className="size-3.5 shrink-0" aria-hidden />
        </button>
      </div>
    </article>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function MyIdeasPage() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [categoryId, setCategoryId] = useQueryState("category", parseAsString.withDefault(""));
  const [cycleId, setCycleId] = useQueryState("cycle", parseAsString.withDefault(""));
  const [academicYearId, setAcademicYearId] = useQueryState("year", parseAsString.withDefault(""));
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OwnIdeaListItem | null>(
    null,
  );

  const { data: context } = useIdeasContextQuery({ enabled: true });
  const allAcademicYears = context?.allAcademicYearsForFilter ?? [];
  const allCycles = context?.allCyclesForFilter ?? [];
  const cyclesForYear = academicYearId
    ? allCycles.filter((c) => c.academicYearId === academicYearId)
    : allCycles;
  const selectedCycle = cycleId ? allCycles.find((c) => c.id === cycleId) : null;
  const categories = selectedCycle?.categories ?? [];

  const { data, status, error } = useMyIdeasQuery(
    {
      page,
      limit: PAGE_SIZE,
      categoryId: categoryId || undefined,
      cycleId: cycleId || undefined,
      academicYearId: academicYearId || undefined,
    },
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
    <div className={cn(IDEAS_HUB_SPACING, PAGE_WRAPPER_NARROW_CLASS)}>
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className={cn("flex flex-wrap items-center", BREADCRUMB_GHOST_CLASS)}>
          <li>
            <Link
              href={ROUTES.IDEAS}
              className="transition-colors duration-200 hover:text-foreground"
            >
              Ideas Hub
            </Link>
          </li>
          <li className="flex items-center" aria-current="page">
            <span className={BREADCRUMB_SEP_CLASS} aria-hidden>/</span>
            My proposals
          </li>
        </ol>
      </nav>

      {status === "pending" ? (
        <div className="flex flex-col items-center py-20">
          <LoadingState compact />
        </div>
      ) : !ideas.length ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div className={cn(IDEAS_HUB_EMPTY_ICON, "rounded-xl")}>
            <Lightbulb className="size-5 text-muted-foreground/50" aria-hidden />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground/80">
            You haven&apos;t submitted any proposals yet
          </p>
          <p className={cn("mt-0.5", IDEAS_HUB_BYLINE_META)}>
            Head to the Ideas Hub to share your first idea
          </p>
          <Link
            href={ROUTES.IDEAS}
            className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-card-subtle)] transition-colors duration-200 hover:bg-primary/95"
          >
            Go to Ideas Hub
          </Link>
        </div>
      ) : (
        <>
          <div className={IDEAS_HUB_TOOLBAR}>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              {allAcademicYears.length > 0 && (
                <Select
                  value={academicYearId || "all"}
                  onValueChange={(v) => {
                    setAcademicYearId(v === "all" ? "" : v);
                    setCycleId("");
                    setCategoryId("");
                    setPage(1);
                    setExpandedId(null);
                  }}
                >
                  <SelectTrigger className={IDEAS_HUB_SELECT_TRIGGER}>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All years</SelectItem>
                    {allAcademicYears.map((y) => (
                      <SelectItem key={y.id} value={y.id}>
                        {y.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {cyclesForYear.length > 0 && (
                <Select
                  value={cycleId || "all"}
                  onValueChange={(v) => {
                    setCycleId(v === "all" ? "" : v);
                    setCategoryId("");
                    setPage(1);
                    setExpandedId(null);
                  }}
                >
                  <SelectTrigger className={IDEAS_HUB_SELECT_TRIGGER}>
                    <SelectValue placeholder="Cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All cycles</SelectItem>
                    {cyclesForYear.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {categories.length > 0 && (
                <Select
                  value={categoryId || "all"}
                  onValueChange={(v) => {
                    setCategoryId(v === "all" ? "" : v);
                    setPage(1);
                    setExpandedId(null);
                  }}
                >
                  <SelectTrigger className={IDEAS_HUB_SELECT_TRIGGER}>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {(allAcademicYears.length > 0 || cyclesForYear.length > 0 || categories.length > 0) && (
                <div className={IDEAS_HUB_TOOLBAR_DIVIDER} aria-hidden />
              )}
            </div>
            <p className={cn("shrink-0 tabular-nums", IDEAS_HUB_COUNT)}>
              {total} proposal{total !== 1 ? "s" : ""}
            </p>
          </div>

          <div className={IDEAS_HUB_FEED_GAP}>
            {ideas.map((idea) => (
              <IdeaRow
                key={idea.id}
                idea={idea}
                isExpanded={expandedId === idea.id}
                onToggleExpand={(id) =>
                  setExpandedId((prev) => (prev === id ? null : id))
                }
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          {pages > 1 && (
            <Pagination className={IDEAS_HUB_PAGINATION}>
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
