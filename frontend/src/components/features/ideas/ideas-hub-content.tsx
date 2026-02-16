"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useIdeasQuery,
  useIdeasContextQuery,
  useVoteIdeaMutation,
  useLatestCommentsQuery,
} from "@/hooks/use-ideas";
import { useIdeaViewTracker } from "@/hooks/use-idea-view-tracker";
import type { Idea, LatestComment } from "@/lib/schemas/ideas.schema";
import { ROUTES } from "@/config/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getAvatarInitial, cn, timeAgo } from "@/lib/utils";
import { ALERT_WARNING_CLASS } from "@/config/design";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Eye,
  Plus,
  Lightbulb,
  FileText,
} from "lucide-react";

/* ─── Constants ───────────────────────────────────────────────────────────── */

const PAGE_SIZE = 5;
const PREVIEW_LEN = 200;

type ViewMode = "latest" | "mostPopular" | "mostViewed" | "latestComments";

const VIEW_TABS: Array<{ value: ViewMode; label: string }> = [
  { value: "latest", label: "Latest" },
  { value: "mostPopular", label: "Most Popular" },
  { value: "mostViewed", label: "Most Viewed" },
  { value: "latestComments", label: "Latest Comments" },
];

const LATEST_COMMENTS_LIMIT = 10;
const COMMENT_PREVIEW_LEN = 160;

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function fmtDate(d: Date | string): string {
  return (typeof d === "string" ? new Date(d) : d).toLocaleDateString(
    undefined,
    { dateStyle: "medium" },
  );
}

/* ─── IdeaCard ────────────────────────────────────────────────────────────── */

function IdeaCard({
  idea,
  isExpanded,
  onToggleExpand,
  onVote,
  votePending,
}: {
  idea: Idea;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onVote: (id: string, v: "up" | "down") => void;
  votePending: boolean;
}) {
  const votes = idea.voteCounts ?? { up: 0, down: 0 };
  const myVote = idea.myVote ?? null;
  const comments = idea.commentCount ?? 0;
  const views = idea.viewCount ?? 0;
  const author = idea.author
    ? idea.author.fullName?.trim() || idea.author.email
    : "Anonymous";
  const initial = idea.author
    ? getAvatarInitial(idea.author.fullName ?? null, idea.author.email)
    : "?";

  const castVote = (e: React.MouseEvent, v: "up" | "down") => {
    e.preventDefault();
    e.stopPropagation();
    onVote(idea.id, v);
  };

  const long = (idea.description?.length ?? 0) > PREVIEW_LEN;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-300 hover:border-border/60 hover:shadow-lg hover:shadow-black/[0.03]">
      {/* Subtle gradient wash on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* ── Byline ───────────────────────────────────────────────────── */}
      <div className="relative flex items-center gap-3 px-6 pt-6 sm:px-7">
        <Avatar className="size-9 shrink-0 rounded-full ring-1 ring-border/30">
          <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-[11px] font-semibold text-primary/60">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="truncate text-[13px] font-medium text-foreground/90">
              {author}
            </span>
            {idea.isAnonymous && (
              <Badge
                variant="outline"
                className="rounded-full border-border/40 px-2 py-0 text-[10px] font-normal italic text-muted-foreground/60"
              >
                Anonymous
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
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
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="relative px-6 pb-5 pt-4 sm:px-7">
        <Link
          href={`${ROUTES.IDEAS}/${idea.id}`}
          className="block rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <h2 className="font-sans text-xl font-bold leading-[1.3] tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary sm:text-[22px]">
            {idea.title}
          </h2>
        </Link>

        {idea.description && (
          <div className="mt-3">
            <p
              className={cn(
                "text-[14px] leading-[1.75] text-foreground/55",
                isExpanded ? "whitespace-pre-wrap" : "line-clamp-3",
              )}
            >
              {idea.description}
            </p>
            {!isExpanded && long && (
              <button
                type="button"
                className="mt-1 text-[11px] font-medium text-primary/50 transition-colors hover:text-primary/80"
                onClick={() => onToggleExpand(idea.id)}
              >
                Continue reading
              </button>
            )}
          </div>
        )}

        {isExpanded && idea.attachments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {idea.attachments.map((att) => (
              <span
                key={att.id}
                className="inline-flex items-center gap-1 rounded-lg border border-border/25 bg-muted/20 px-2 py-1 text-[11px] text-muted-foreground/60"
              >
                <FileText
                  className="size-3 shrink-0 opacity-50"
                  aria-hidden
                />
                <span className="max-w-[160px] truncate">{att.fileName}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Engagement ────────────────────────────────────────────────── */}
      <div className="relative flex items-center gap-1.5 border-t border-border/20 px-6 py-3 sm:px-7">
        <button
          type="button"
          disabled={votePending}
          onClick={(e) => castVote(e, "up")}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200",
            myVote === "up"
              ? "bg-success/10 text-success"
              : "text-muted-foreground/50 hover:bg-muted/[0.06] hover:text-foreground/70",
          )}
          aria-label="Support"
        >
          <ThumbsUp className="size-3.5" aria-hidden />
          <span className="tabular-nums">{votes.up}</span>
        </button>

        <button
          type="button"
          disabled={votePending}
          onClick={(e) => castVote(e, "down")}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200",
            myVote === "down"
              ? "bg-destructive/10 text-destructive"
              : "text-muted-foreground/50 hover:bg-muted/[0.06] hover:text-foreground/70",
          )}
          aria-label="Do not support"
        >
          <ThumbsDown className="size-3.5" aria-hidden />
          <span className="tabular-nums">{votes.down}</span>
        </button>

        <div className="flex-1" />

        <Link
          href={`${ROUTES.IDEAS}/${idea.id}`}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-muted-foreground/40 transition-colors hover:text-foreground/60"
        >
          <MessageSquare className="size-3.5" aria-hidden />
          <span className="tabular-nums">{comments}</span>
        </Link>

        <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground/30">
          <Eye className="size-3.5" aria-hidden />
          <span className="tabular-nums">{views}</span>
        </span>
      </div>
    </article>
  );
}

/* ─── LatestCommentRow ─────────────────────────────────────────────────────── */

function LatestCommentRow({ comment }: { comment: LatestComment }) {
  const name = comment.author
    ? comment.author.fullName?.trim() || comment.author.email
    : "Anonymous";
  const initial = comment.author
    ? getAvatarInitial(comment.author.fullName ?? null, comment.author.email)
    : "?";
  const preview =
    comment.content.length > COMMENT_PREVIEW_LEN
      ? comment.content.slice(0, COMMENT_PREVIEW_LEN) + "…"
      : comment.content;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-300 hover:border-border/60 hover:shadow-lg hover:shadow-black/[0.03]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative px-6 py-5 sm:px-7">
        {/* Author + time */}
        <div className="flex items-center gap-3">
          <Avatar className="size-8 shrink-0 rounded-full ring-1 ring-border/30">
            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-[10px] font-semibold text-primary/60">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <span className="truncate text-[13px] font-medium text-foreground/90">
              {name}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
              <time dateTime={new Date(comment.createdAt).toISOString()}>
                {timeAgo(comment.createdAt)}
              </time>
              <span aria-hidden>·</span>
              <span className="text-muted-foreground/40">commented on</span>
            </div>
          </div>
        </div>

        {/* Idea title */}
        <Link
          href={`${ROUTES.IDEAS}/${comment.idea.id}`}
          className="mt-3 block rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <h3 className="font-sans text-[16px] font-semibold leading-[1.35] tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary">
            {comment.idea.title}
          </h3>
        </Link>

        {/* Comment preview */}
        <p className="mt-2.5 whitespace-pre-wrap text-[13.5px] leading-[1.7] text-foreground/55">
          {preview}
        </p>
      </div>
    </article>
  );
}

/* ─── Hub ──────────────────────────────────────────────────────────────────── */

export function IdeasHubContent() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ViewMode>("latest");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isCommentsView = sort === "latestComments";
  const ideaSort = isCommentsView ? "latest" : sort;

  const {
    data: context,
    status: ctxStatus,
    error: ctxError,
  } = useIdeasContextQuery();
  const {
    data: listData,
    status: ideasStatus,
    error: ideasError,
  } = useIdeasQuery(
    { page, limit: PAGE_SIZE, sort: ideaSort },
    { enabled: !isCommentsView },
  );
  const {
    data: latestComments = [],
    status: commentsStatus,
    error: commentsError,
  } = useLatestCommentsQuery({
    enabled: isCommentsView,
    limit: LATEST_COMMENTS_LIMIT,
  });
  const voteMutation = useVoteIdeaMutation();
  const { markViewedByAction } = useIdeaViewTracker(
    isCommentsView ? null : expandedId,
  );

  if (ctxStatus === "error") throw ctxError;
  if (!isCommentsView && ideasStatus === "error") throw ideasError;
  if (isCommentsView && commentsStatus === "error") throw commentsError;

  const canSubmit = context?.canSubmit ?? false;
  const closesAt = context?.submissionClosesAt;
  const ideas = listData?.items ?? [];
  const total = listData?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-7">
      {/* ── Alert ────────────────────────────────────────────────────── */}
      {!canSubmit && (
        <Alert className={ALERT_WARNING_CLASS}>
          <AlertDescription>
            Submission is currently closed. You may still browse proposals.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Compose CTA ──────────────────────────────────────────────── */}
      {canSubmit && (
        <Link href={ROUTES.IDEAS_NEW} className="group/cta block">
          <div className="flex items-center gap-4 rounded-2xl border border-border/30 bg-card px-6 py-5 transition-all duration-300 hover:border-border/60 hover:shadow-md hover:shadow-black/[0.03] sm:px-7">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary/60 transition-colors duration-300 group-hover/cta:bg-primary/[0.10] group-hover/cta:text-primary/80">
              <Lightbulb className="size-[22px]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium text-foreground">
                Share a proposal
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground/50">
                {closesAt && <>Open until {fmtDate(closesAt)} · </>}
                New ideas welcome
              </p>
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform duration-300 group-hover/cta:scale-105">
              <Plus className="size-4" aria-hidden />
            </div>
          </div>
        </Link>
      )}

      {/* ── View tabs ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setSort(tab.value);
                setPage(1);
                setExpandedId(null);
              }}
              className={cn(
                "rounded-full px-3 py-1 text-[12px] font-medium transition-all duration-200",
                sort === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground/50 hover:text-foreground/70",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {!isCommentsView && total > 0 && (
          <p className="tabular-nums text-[11px] text-muted-foreground/40">
            {total} proposal{total !== 1 ? "s" : ""}
          </p>
        )}
        {isCommentsView && latestComments.length > 0 && (
          <p className="tabular-nums text-[11px] text-muted-foreground/40">
            {latestComments.length} comment{latestComments.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* ── Latest Comments view ─────────────────────────────────────── */}
      {isCommentsView ? (
        commentsStatus === "pending" ? (
          <div className="flex flex-col items-center py-28">
            <div className="size-7 animate-spin rounded-full border-[1.5px] border-muted-foreground/15 border-t-primary/70" />
            <p className="mt-5 text-[13px] text-muted-foreground/60">
              Loading comments…
            </p>
          </div>
        ) : latestComments.length === 0 ? (
          <div className="flex flex-col items-center py-28 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/30">
              <MessageSquare
                className="size-6 text-muted-foreground/30"
                aria-hidden
              />
            </div>
            <p className="mt-5 text-[14px] font-medium text-foreground/80">
              No comments yet
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground/50">
              Be the first to start a discussion
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {latestComments.map((c) => (
              <LatestCommentRow key={c.id} comment={c} />
            ))}
          </div>
        )
      ) : (
        /* ── Ideas feed ─────────────────────────────────────────────── */
        <>
          {(ctxStatus === "pending" || ideasStatus === "pending") &&
          !listData ? (
            <div className="flex flex-col items-center py-28">
              <div className="size-7 animate-spin rounded-full border-[1.5px] border-muted-foreground/15 border-t-primary/70" />
              <p className="mt-5 text-[13px] text-muted-foreground/60">
                Loading proposals…
              </p>
            </div>
          ) : !ideas.length ? (
            <div className="flex flex-col items-center py-28 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/30">
                <Lightbulb
                  className="size-6 text-muted-foreground/30"
                  aria-hidden
                />
              </div>
              <p className="mt-5 text-[14px] font-medium text-foreground/80">
                No proposals yet
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground/50">
                {canSubmit
                  ? "Be the first to share an idea"
                  : "Check back when a proposal cycle opens"}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-5">
                {ideas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    isExpanded={expandedId === idea.id}
                    onToggleExpand={(id) =>
                      setExpandedId((prev) => (prev === id ? null : id))
                    }
                    onVote={(id, v) => {
                      markViewedByAction(id);
                      voteMutation.mutate({ ideaId: id, value: v });
                    }}
                    votePending={voteMutation.isPending}
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
                    {Array.from({ length: pages }, (_, i) => i + 1).map(
                      (p) => (
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
                      ),
                    )}
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
        </>
      )}
    </div>
  );
}
