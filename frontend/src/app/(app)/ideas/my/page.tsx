"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import {
  useMyIdeasQuery,
  useDeleteMyIdeaMutation,
  useVoteIdeaMutation,
  useMyIdeasFiltersQuery,
} from "@/hooks/use-ideas";
import { useAuth } from "@/hooks/use-auth";
import { hasRole } from "@/lib/rbac";
import type { OwnIdeaListItem } from "@/lib/schemas/ideas.schema";
import { ROUTES, buildPageTitle } from "@/config/constants";
import { getErrorMessage, ERROR_FALLBACK_FORM } from "@/lib/errors";
import { cn, timeAgo, getAvatarInitial } from "@/lib/utils";
import { LoadingState } from "@/components/ui/loading-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { ALERT_DIALOG_ERROR_CLASS } from "@/components/features/admin/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UnifiedPagination } from "@/components/ui/unified-pagination";
import {
  PAGE_CONTAINER_CLASS,
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
  IDEAS_HUB_ACTION_UP,
  IDEAS_HUB_ACTION_DOWN,
  IDEAS_HUB_ACTION_READONLY,
  IDEAS_HUB_READ_MORE,
  IDEAS_HUB_ATTACHMENTS_LABEL,
  IDEAS_HUB_ATTACHMENTS_LIST,
  IDEAS_HUB_ATTACHMENT_ROW,
  IDEAS_ACTIONS_TRIGGER,
  IDEAS_ACTIONS_MENU,
  IDEAS_ACTIONS_ITEM,
  IDEAS_ACTIONS_ITEM_DESTRUCTIVE,
  IDEAS_MY_STATUS_VOTING,
  IDEAS_MY_STATUS_CLOSED,
  IDEAS_HUB_FEED_GAP,
  IDEAS_HUB_COUNT,
  IDEAS_HUB_EMPTY_ICON,
  IDEAS_HUB_TOOLBAR,
  IDEAS_HUB_SELECT_TRIGGER,
  IDEAS_HUB_TOOLBAR_DIVIDER,
  IDEA_DETAIL_CATEGORY_PILL,
} from "@/config/design";
import {
  BREADCRUMB_GHOST_CLASS,
  BREADCRUMB_LINK_CLASS,
  BREADCRUMB_CURRENT_CLASS,
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
  FileText,
  Pencil,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Lightbulb,
  Lock,
  ChevronDown,
  ChevronUp,
  Clock,
  Tag,
  Eye,
  Activity,
  MoreVertical,
} from "lucide-react";

/* ─── Constants ───────────────────────────────────────────────────────────── */

const PAGE_SIZE = 5;
const PREVIEW_LEN = 200;

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

/** Top-right status: "editable" | "voting" | "closed".
 * editable: cycle ACTIVE + before submission deadline → 3-dot menu (Edit/Delete)
 * voting: cycle ACTIVE + past deadline, comment/vote still open → descriptive text
 * closed: cycle not ACTIVE or interaction ended → lock + red Closed */
function getTopRightStatus(idea: OwnIdeaListItem): "editable" | "voting" | "closed" {
  const now = new Date();

  if (idea.cycleStatus !== "ACTIVE") return "closed";

  const subClosed = idea.submissionClosesAt ? now >= new Date(idea.submissionClosesAt) : true;
  if (!subClosed) return "editable";

  const interactionOpen = idea.interactionClosesAt
    ? now < new Date(idea.interactionClosesAt)
    : false;
  return interactionOpen ? "voting" : "closed";
}

/* ─── IdeaRow — same structure as IdeaCard for consistency ────────────────── */

function IdeaRow({
  idea,
  isExpanded,
  onToggleExpand,
  onDelete,
  onVote,
  votePending,
}: {
  idea: OwnIdeaListItem;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onDelete: (idea: OwnIdeaListItem) => void;
  onVote: (id: string, value: "up" | "down") => void;
  votePending: boolean;
}) {
  const topRightStatus = getTopRightStatus(idea);
  const votes = idea.voteCounts ?? { up: 0, down: 0 };
  const myVote = idea.myVote ?? null;
  const canVote = topRightStatus !== "closed";
  const comments = idea.commentCount ?? 0;
  const views = idea.viewCount ?? 0;
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
      {/* Byline + actions (top right) */}
      <div className={cn("flex items-start justify-between gap-3", IDEAS_HUB_CARD_PX, "pt-4 pb-3 sm:pt-5")}>
        <div className="flex min-w-0 flex-1 items-start gap-3">
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
                  <span className={IDEA_DETAIL_CATEGORY_PILL}>
                    <Tag className="size-3 shrink-0 opacity-65" aria-hidden />
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
        {topRightStatus === "editable" ? (
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
              <DropdownMenuItem asChild>
                <Link
                  href={`${ROUTES.MY_IDEAS}/${idea.id}/edit`}
                  className={IDEAS_ACTIONS_ITEM}
                >
                  <Pencil aria-hidden />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(idea)}
                className={IDEAS_ACTIONS_ITEM_DESTRUCTIVE}
              >
                <Trash2 aria-hidden />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : topRightStatus === "voting" ? (
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <span className={cn(IDEAS_MY_STATUS_VOTING, "cursor-default")}>
                <Activity className="size-3 shrink-0 opacity-70" aria-hidden />
                Comment & Vote
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              Cannot edit or delete, can still comment and vote
            </TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <span className={cn(IDEAS_MY_STATUS_CLOSED, "cursor-default")}>
                <Lock className="size-3 shrink-0" aria-hidden />
                Closed
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">Cycle closed</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Title + status */}
      <div className={cn(IDEAS_HUB_CARD_PX, "pt-0")}>
        <Link
          href={`${ROUTES.IDEAS}/${idea.id}`}
          className="block rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <h2 className={IDEAS_HUB_TITLE}>{idea.title}</h2>
        </Link>
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
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <span className="min-w-0 truncate cursor-default">{att.fileName}</span>
                    </TooltipTrigger>
                    <TooltipContent side="top">{att.fileName}</TooltipContent>
                  </Tooltip>
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
        {canVote ? (
          <>
            <button
              type="button"
              disabled={votePending}
              onClick={(e) => {
                e.preventDefault();
                onVote(idea.id, "up");
              }}
              className={cn(
                IDEAS_HUB_ACTION_BASE,
                "cursor-pointer",
                myVote === "up" ? IDEAS_HUB_ACTION_UP : IDEAS_HUB_ACTION_INACTIVE,
              )}
              aria-label="Support"
            >
              <ThumbsUp className="size-3.5 shrink-0" aria-hidden />
              {votes.up}
            </button>
            <div className="h-4 w-px shrink-0 self-center bg-border/30" aria-hidden />
            <button
              type="button"
              disabled={votePending}
              onClick={(e) => {
                e.preventDefault();
                onVote(idea.id, "down");
              }}
              className={cn(
                IDEAS_HUB_ACTION_BASE,
                "cursor-pointer",
                myVote === "down" ? IDEAS_HUB_ACTION_DOWN : IDEAS_HUB_ACTION_INACTIVE,
              )}
              aria-label="Do not support"
            >
              <ThumbsDown className="size-3.5 shrink-0" aria-hidden />
              {votes.down}
            </button>
          </>
        ) : (
          <>
            <span
              className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_ACTION_READONLY, "inline-flex")}
              aria-label="Support"
            >
              <ThumbsUp className="size-3.5 shrink-0" aria-hidden />
              {votes.up}
            </span>
            <div className="h-4 w-px shrink-0 self-center bg-border/30" aria-hidden />
            <span
              className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_ACTION_READONLY, "inline-flex")}
              aria-label="Do not support"
            >
              <ThumbsDown className="size-3.5 shrink-0" aria-hidden />
              {votes.down}
            </span>
          </>
        )}
        <div className="mx-1.5 h-4 w-px shrink-0 self-center bg-border/40" aria-hidden />
        <Link
          href={`${ROUTES.IDEAS}/${idea.id}#comments`}
          className={cn(
            IDEAS_HUB_ACTION_BASE,
            canVote
              ? cn(IDEAS_HUB_ACTION_INACTIVE, "cursor-pointer")
              : "cursor-default text-muted-foreground/55 hover:bg-transparent hover:text-muted-foreground/55",
          )}
          aria-label="View proposal and comments"
        >
          <MessageSquare className="size-3.5 shrink-0" aria-hidden />
          {comments}
        </Link>
        <div className="min-w-0 flex-1" aria-hidden />
        <span className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_COUNT, "cursor-default")}>
          <Eye className="size-3.5 shrink-0" aria-hidden />
          {views}
        </span>
      </div>
    </article>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function MyIdeasPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [categoryId, setCategoryId] = useQueryState("category", parseAsString.withDefault(""));
  const [cycleId, setCycleId] = useQueryState("cycle", parseAsString.withDefault(""));
  const [academicYearId, setAcademicYearId] = useQueryState("year", parseAsString.withDefault(""));
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OwnIdeaListItem | null>(
    null,
  );

  const { data: filters } = useMyIdeasFiltersQuery({ enabled: true });
  const allAcademicYears = filters?.allAcademicYearsForFilter ?? [];
  const allCycles = filters?.allCyclesForFilter ?? [];
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
  const voteMutation = useVoteIdeaMutation();

  useEffect(() => {
    document.title = buildPageTitle("My Ideas");
    // No cleanup: next page sets its own title
  }, []);

  useEffect(() => {
    if (hasRole(user?.roles, "QA_COORDINATOR")) {
      router.replace(ROUTES.IDEAS);
    }
  }, [user?.roles, router]);

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
    <div className={cn(IDEAS_HUB_SPACING, PAGE_CONTAINER_CLASS)}>
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className={cn("flex flex-wrap items-center", BREADCRUMB_GHOST_CLASS)}>
          <li>
            <Link
              href={ROUTES.IDEAS}
              className={BREADCRUMB_LINK_CLASS}
            >
              Ideas Hub
            </Link>
          </li>
          <li className="flex items-center" aria-current="page">
            <span className={BREADCRUMB_SEP_CLASS} aria-hidden>/</span>
            <span className={BREADCRUMB_CURRENT_CLASS}>My proposals</span>
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
                onVote={(id, value) => voteMutation.mutate({ ideaId: id, value })}
                votePending={voteMutation.isPending}
              />
            ))}
          </div>

          {pages > 1 && (
            <UnifiedPagination
              page={page}
              totalPages={pages}
              setPage={setPage}
              ariaLabel="My ideas pagination"
              className="pt-8"
              align="center"
            />
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            deleteMutation.reset();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete proposal?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.title}
              {" — "}
              Permanently removes the proposal and all its comments, votes, and
              attachments. This action cannot be undone.
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
