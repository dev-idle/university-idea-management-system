"use client";

import { useState } from "react";
import Link from "next/link";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import {
  useIdeasQuery,
  useIdeasContextQuery,
  useVoteIdeaMutation,
} from "@/hooks/use-ideas";
import { useIdeaViewTracker } from "@/hooks/use-idea-view-tracker";
import type { Idea } from "@/lib/schemas/ideas.schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAvatarInitial, cn, timeAgo } from "@/lib/utils";
import {
  ALERT_WARNING_CLASS,
  IDEAS_HUB_CARD_PX,
  IDEAS_HUB_BYLINE_META,
  IDEAS_HUB_ENGAGEMENT_BORDER,
  IDEAS_HUB_ARTICLE_CLASS,
  IDEAS_HUB_AVATAR,
  IDEAS_HUB_AUTHOR,
  IDEAS_HUB_TITLE,
  IDEAS_HUB_DESC,
  IDEAS_HUB_ACTION_BASE,
  IDEAS_HUB_ACTION_INACTIVE,
  IDEAS_HUB_ACTION_UP,
  IDEAS_HUB_ACTION_DOWN,
  IDEAS_HUB_READ_MORE,
  IDEAS_HUB_ATTACHMENT_CHIP,
  IDEAS_HUB_TAB_BASE,
  IDEAS_HUB_TAB_ACTIVE,
  IDEAS_HUB_TAB_INACTIVE,
  IDEAS_HUB_EMPTY_ICON,
  IDEAS_HUB_CTA_CARD,
  IDEAS_HUB_CTA_ICON,
  IDEAS_HUB_FEED_GAP,
  IDEAS_HUB_SPACING,
  IDEAS_HUB_COUNT,
  IDEAS_HUB_TOOLBAR,
  IDEAS_HUB_SELECT_TRIGGER,
  IDEAS_HUB_TOOLBAR_DIVIDER,
  IDEAS_HUB_PAGINATION,
  BORDER_SUBTLE,
} from "@/config/design";
import { LoadingState } from "@/components/ui/loading-state";
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

const SORT_PARSER = parseAsStringLiteral(VIEW_TABS.map((t) => t.value)).withDefault("latest");


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
    <article className={IDEAS_HUB_ARTICLE_CLASS}>
      {/* Byline */}
      <div className={cn("flex items-center gap-3", IDEAS_HUB_CARD_PX, "pt-5 pb-3")}>
        <Avatar className={IDEAS_HUB_AVATAR}>
          <AvatarFallback className="bg-primary/[0.06] text-[11px] font-semibold text-primary/75">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className={IDEAS_HUB_AUTHOR}>{author}</span>
            {idea.isAnonymous && (
              <Badge
                variant="outline"
                className={cn("rounded-full px-2 py-0 font-normal italic", BORDER_SUBTLE, "text-[10px] text-muted-foreground/60")}
              >
                Anonymous
              </Badge>
            )}
          </div>
          <div className={cn("flex items-center gap-1.5 mt-0.5", IDEAS_HUB_BYLINE_META)}>
            <time dateTime={new Date(idea.createdAt).toISOString()}>
              {timeAgo(idea.createdAt)}
            </time>
            {idea.category?.name && (
              <>
                <span aria-hidden className="opacity-50">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-primary/40" aria-hidden />
                  {idea.category.name}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={cn(IDEAS_HUB_CARD_PX, "pb-5")}>
        <Link
          href={`${ROUTES.IDEAS}/${idea.id}`}
          className="block rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <h2 className={IDEAS_HUB_TITLE}>{idea.title}</h2>
        </Link>

        {idea.description && (
          <div className="mt-3">
            <p
              className={cn(
                IDEAS_HUB_DESC,
                isExpanded ? "whitespace-pre-wrap" : "line-clamp-3",
              )}
            >
              {idea.description}
            </p>
            {!isExpanded && long && (
              <button
                type="button"
                className={cn(IDEAS_HUB_READ_MORE, "cursor-pointer")}
                onClick={() => onToggleExpand(idea.id)}
              >
                Continue reading
              </button>
            )}
          </div>
        )}

        {isExpanded && idea.attachments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {idea.attachments.map((att) => (
              <span key={att.id} className={IDEAS_HUB_ATTACHMENT_CHIP}>
                <FileText className="size-3 shrink-0 opacity-55" aria-hidden />
                <span className="max-w-[160px] truncate">{att.fileName}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Engagement */}
      <div
        className={cn(
          "flex items-center gap-1",
          IDEAS_HUB_ENGAGEMENT_BORDER,
          IDEAS_HUB_CARD_PX,
          "py-2.5",
        )}
        role="toolbar"
      >
        <button
          type="button"
          disabled={votePending}
          onClick={(e) => castVote(e, "up")}
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
          onClick={(e) => castVote(e, "down")}
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
        <div className="mx-1.5 h-4 w-px shrink-0 self-center bg-border/40" aria-hidden />
        <Link
          href={`${ROUTES.IDEAS}/${idea.id}`}
          className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_ACTION_INACTIVE, "cursor-pointer")}
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

/* ─── Hub ──────────────────────────────────────────────────────────────────── */

export function IdeasHubContent() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sort, setSort] = useQueryState("sort", SORT_PARSER);
  const [categoryId, setCategoryId] = useQueryState("category", parseAsString.withDefault(""));
  const [cycleId, setCycleId] = useQueryState("cycle", parseAsString.withDefault(""));
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    data: context,
    status: ctxStatus,
    error: ctxError,
  } = useIdeasContextQuery();
  const hasActiveCycle = !!context?.activeCycleId;
  const closedCycles = context?.closedCyclesForYear ?? [];
  const categories =
    hasActiveCycle
      ? (context?.categories ?? [])
      : (cycleId
        ? (closedCycles.find((c) => c.id === cycleId)?.categories ?? [])
        : []);
  const effectiveCycleId = hasActiveCycle ? undefined : (cycleId || undefined);

  const {
    data: listData,
    status: ideasStatus,
    error: ideasError,
  } = useIdeasQuery(
    {
      page,
      limit: PAGE_SIZE,
      sort,
      categoryId: categoryId || undefined,
      cycleId: effectiveCycleId,
    },
    { enabled: true },
  );
  const voteMutation = useVoteIdeaMutation();
  const { markViewedByAction } = useIdeaViewTracker(expandedId);

  if (ctxStatus === "error") throw ctxError;
  if (ideasStatus === "error") throw ideasError;

  const canSubmit = context?.canSubmit ?? false;
  const closesAt = context?.submissionClosesAt;
  const ideas = listData?.items ?? [];
  const total = listData?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className={IDEAS_HUB_SPACING}>
      {/* ── Alert (compact) ───────────────────────────────────────────── */}
      {!canSubmit && (
        <Alert className={ALERT_WARNING_CLASS}>
          <AlertDescription>
            Submission is closed. Browsing remains available.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Compose CTA (prominent) ──────────────────────────────────── */}
      {canSubmit && (
        <Link href={ROUTES.IDEAS_NEW} className="group/cta block">
          <div className={IDEAS_HUB_CTA_CARD}>
            <div className={cn(IDEAS_HUB_CTA_ICON, "transition-colors duration-200 group-hover/cta:bg-primary/[0.12] group-hover/cta:text-primary")}>
              <Lightbulb className="size-[18px]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Share a proposal</p>
              <p className={cn("mt-0.5", IDEAS_HUB_BYLINE_META)}>
                {closesAt ? <>Until {fmtDate(closesAt)}</> : "New ideas welcome"}
              </p>
            </div>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/90 text-primary-foreground transition-colors duration-200 group-hover/cta:bg-primary">
              <Plus className="size-3.5" aria-hidden />
            </div>
          </div>
        </Link>
      )}

      {/* ── Toolbar: filters + sort + count ───────────────────────────── */}
      <div className={IDEAS_HUB_TOOLBAR}>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          {!hasActiveCycle && closedCycles.length > 0 && (
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
                {closedCycles.map((c) => (
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
          {(closedCycles.length > 0 || categories.length > 0) && (
            <div className={IDEAS_HUB_TOOLBAR_DIVIDER} aria-hidden />
          )}
          <nav className="flex items-center gap-1" aria-label="Sort by">
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
                  IDEAS_HUB_TAB_BASE,
                  sort === tab.value ? IDEAS_HUB_TAB_ACTIVE : IDEAS_HUB_TAB_INACTIVE,
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        {total > 0 && (
          <p className={cn("shrink-0 tabular-nums", IDEAS_HUB_COUNT)}>
            {total} proposal{total !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* ── Feed ──────────────────────────────────────────────────────── */}
      {(ctxStatus === "pending" || ideasStatus === "pending") && !listData ? (
            <div className="flex flex-col items-center py-20">
              <LoadingState compact />
            </div>
      ) : !ideas.length ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className={cn(IDEAS_HUB_EMPTY_ICON, "rounded-xl")}>
                <Lightbulb className="size-5 text-muted-foreground/50" aria-hidden />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground/80">No proposals yet</p>
              <p className={cn("mt-0.5", IDEAS_HUB_BYLINE_META)}>
                {canSubmit
                  ? "Be the first to share an idea"
                  : "Check back when a proposal cycle opens"}
              </p>
            </div>
      ) : (
        <>
          <div className={IDEAS_HUB_FEED_GAP}>
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
    </div>
  );
}
