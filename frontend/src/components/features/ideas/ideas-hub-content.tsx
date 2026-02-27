"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  useIdeasQuery,
  useIdeasContextQuery,
  useVoteIdeaMutation,
} from "@/hooks/use-ideas";
import { useIdeaViewTracker } from "@/hooks/use-idea-view-tracker";
import { useAuthStore } from "@/stores/auth.store";
import { hasRole } from "@/lib/rbac";
import { useDwellInView } from "@/hooks/use-dwell-in-view";
import type { Idea } from "@/lib/schemas/ideas.schema";
import { ROUTES } from "@/config/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UnifiedPagination } from "@/components/ui/unified-pagination";
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
  BYLINE_META_SEP,
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
  IDEAS_HUB_ATTACHMENTS_LABEL,
  IDEAS_HUB_ATTACHMENTS_LIST,
  IDEAS_HUB_ATTACHMENT_ROW,
  IDEAS_HUB_TAB_BASE,
  IDEAS_HUB_TAB_ACTIVE,
  IDEAS_HUB_TAB_INACTIVE,
  IDEAS_HUB_EMPTY_ICON,
  IDEAS_HUB_CTA_CARD,
  IDEAS_HUB_CTA_ICON,
  IDEAS_HUB_CTA_TITLE,
  IDEAS_HUB_CTA_SUBTITLE,
  IDEAS_HUB_FEED_GAP,
  IDEAS_HUB_SPACING,
  IDEAS_HUB_COUNT,
  IDEAS_HUB_TOOLBAR,
  IDEAS_HUB_SELECT_TRIGGER,
  IDEAS_HUB_SELECT_TRIGGER_COORDINATOR,
  IDEAS_HUB_TOOLBAR_DIVIDER,
  IDEA_DETAIL_CATEGORY_PILL,
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
  Clock,
  Tag,
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

function fmtDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const COUNTDOWN_THRESHOLD_DAYS = 3;

/** Returns days remaining (0 = same day, 1 = tomorrow). */
function getDaysLeft(end: Date, now: Date): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.max(0, Math.ceil((endDay.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)));
}

/** Format ms to "Xd Xh Xm" or "Xh Xm Xs" (realtime). */
function formatCountdown(ms: number): string {
  if (ms <= 0) return "0s";
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / (60 * 1000)) % 60;
  const h = Math.floor(ms / (60 * 60 * 1000)) % 24;
  const d = Math.floor(ms / (24 * 60 * 60 * 1000));
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  if (d === 0 && h < 1) parts.push(`${s}s`);
  return parts.join(" ");
}

/** CTA deadline: always show deadline date/time; when ≤3 days add realtime countdown. */
function useCtaDeadline(closesAt: string | Date | null) {
  const [now, setNow] = useState(() => new Date());
  const end = closesAt ? new Date(closesAt) : null;

  useEffect(() => {
    if (!end) return;
    const days = getDaysLeft(end, now);
    if (days > COUNTDOWN_THRESHOLD_DAYS || end <= now) return;
    const id = setInterval(() => {
      const t = new Date();
      if (end <= t) {
        clearInterval(id);
        setNow(t);
        return;
      }
      setNow(t);
    }, 1000);
    return () => clearInterval(id);
  }, [closesAt]);

  if (!end) return { deadline: "New ideas welcome", countdown: null };
  if (end <= now) return { deadline: "Submission closed", countdown: null };

  const days = getDaysLeft(end, now);
  const deadlineText = days <= COUNTDOWN_THRESHOLD_DAYS
    ? fmtDateTime(end)
    : `Until ${fmtDate(end)}`;
  let countdownText: string | null = null;

  if (days <= COUNTDOWN_THRESHOLD_DAYS) {
    const ms = end.getTime() - now.getTime();
    countdownText = formatCountdown(ms);
  }

  return { deadline: deadlineText, countdown: countdownText };
}

function CtaCompose({ closesAt }: { closesAt: string | Date | null }) {
  const { deadline, countdown } = useCtaDeadline(closesAt);
  return (
    <Link href={ROUTES.IDEAS_NEW} className="group/cta block">
      <div className={IDEAS_HUB_CTA_CARD}>
        <div className={cn(IDEAS_HUB_CTA_ICON, "group-hover/cta:bg-primary/[0.08] group-hover/cta:text-primary")}>
          <Lightbulb className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn(IDEAS_HUB_CTA_TITLE, "transition-colors duration-200 group-hover/cta:text-primary")}>Share a proposal</p>
          <p className={cn(IDEAS_HUB_CTA_SUBTITLE, "flex flex-wrap items-center gap-x-0 gap-y-0 sm:gap-x-0")}>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3 shrink-0 opacity-55" aria-hidden />
              <span>{deadline}</span>
            </span>
            {countdown && (
              <>
                <span className={BYLINE_META_SEP} aria-hidden />
                <span className="tabular-nums">{countdown} left</span>
              </>
            )}
          </p>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors duration-200 hover:bg-primary/90">
          <Plus className="size-4" aria-hidden />
        </div>
      </div>
    </Link>
  );
}

/* ─── IdeaCard ────────────────────────────────────────────────────────────── */

function IdeaCard({
  idea,
  isExpanded,
  onToggleExpand,
  onVote,
  onDwellComplete,
  votePending,
  voteDisabled,
}: {
  idea: Idea;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onVote: (id: string, v: "up" | "down") => void;
  onDwellComplete: (id: string) => void;
  votePending: boolean;
  voteDisabled?: boolean;
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
    if (voteDisabled || votePending) return;
    onVote(idea.id, v);
  };

  const long = (idea.description?.length ?? 0) > PREVIEW_LEN;
  const fullContentVisible = isExpanded || !long;
  const headerRef = useRef<HTMLDivElement>(null);
  const dwellRef = useDwellInView(
    fullContentVisible,
    useCallback(() => onDwellComplete(idea.id), [idea.id, onDwellComplete]),
    { headerRef },
  );

  return (
    <article ref={dwellRef} className={IDEAS_HUB_ARTICLE_CLASS}>
      {/* Header (byline + title): when card overflows viewport, dwell observes this section */}
      <div ref={headerRef}>
        {/* Byline */}
        <div className={cn("flex items-start gap-3", IDEAS_HUB_CARD_PX, "pt-4 pb-3 sm:pt-5")}>
        <Avatar className={IDEAS_HUB_AVATAR}>
          <AvatarFallback className="bg-muted/50 text-[11px] font-semibold text-muted-foreground/70">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <span className={cn("block truncate", IDEAS_HUB_AUTHOR)}>
            {author}
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

        {/* Title */}
        <div className={cn(IDEAS_HUB_CARD_PX, "pt-0")}>
          <Link
            href={`${ROUTES.IDEAS}/${idea.id}`}
            className="block rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <h2 className={IDEAS_HUB_TITLE}>{idea.title}</h2>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className={cn(IDEAS_HUB_CARD_PX, "pb-4 sm:pb-5")}>
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
        <button
          type="button"
          disabled={votePending || voteDisabled}
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
          disabled={votePending || voteDisabled}
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
          href={`${ROUTES.IDEAS}/${idea.id}#comments`}
          className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_ACTION_INACTIVE, "cursor-pointer")}
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

/* ─── Hub ──────────────────────────────────────────────────────────────────── */

export function IdeasHubContent() {
  const user = useAuthStore((s) => s.user);
  const isQaCoordinator = hasRole(user?.roles, "QA_COORDINATOR");
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sort, setSort] = useQueryState("sort", SORT_PARSER);
  const [departmentId, setDepartmentId] = useQueryState("department", parseAsString.withDefault(""));
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
  const departments =
    isQaCoordinator
      ? (hasActiveCycle
          ? (context?.departmentsForFilter ?? [])
          : cycleId
            ? (closedCycles.find((c) => c.id === cycleId)?.departments ?? [])
            : (() => {
                const seen = new Map<string, { id: string; name: string }>();
                for (const c of closedCycles) {
                  for (const d of c.departments ?? []) {
                    if (!seen.has(d.id)) seen.set(d.id, d);
                  }
                }
                return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
              })())
      : [];
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
      departmentId: isQaCoordinator ? (departmentId || undefined) : undefined,
    },
    { enabled: true },
  );
  const voteMutation = useVoteIdeaMutation();
  const expandedIdea = expandedId ? (listData?.items ?? []).find((i) => i.id === expandedId) : null;
  const expandedCycleStatus = expandedIdea?.cycleStatus ?? (hasActiveCycle && !effectiveCycleId ? "ACTIVE" : null);
  const { markViewedByAction } = useIdeaViewTracker(
    expandedId,
    expandedCycleStatus,
    isQaCoordinator,
  );

  if (ctxStatus === "error") throw ctxError;
  if (ideasStatus === "error") throw ideasError;

  const canSubmit = isQaCoordinator ? false : (context?.canSubmit ?? false);
  const closesAt = context?.submissionClosesAt;
  const interactionClosesAt = context?.interactionClosesAt;
  const interactionOpen =
    hasActiveCycle &&
    !!interactionClosesAt &&
    new Date() < new Date(interactionClosesAt);
  const ideas = listData?.items ?? [];
  const total = listData?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className={IDEAS_HUB_SPACING}>
      {/* ── Alert (compact) ───────────────────────────────────────────── */}
      {!canSubmit && (
        <Alert className={ALERT_WARNING_CLASS}>
          <AlertDescription>
            {isQaCoordinator
              ? "View only. You cannot submit, vote, or comment on ideas."
              : interactionOpen && interactionClosesAt
                ? `Submissions are closed. You can still view, vote, and comment on ideas until ${fmtDateTime(interactionClosesAt)}.`
                : "Submissions are closed. Browse ideas (read-only)."}
          </AlertDescription>
        </Alert>
      )}

      {/* ── Compose CTA (subtle) ─────────────────────────────────────── */}
      {canSubmit && (
        <CtaCompose closesAt={closesAt ?? null} />
      )}

      {/* ── Toolbar: filters + sort + count ───────────────────────────── */}
      <div className={IDEAS_HUB_TOOLBAR}>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          {isQaCoordinator && departments.length > 0 && (
            <Select
              value={departmentId || "all"}
              onValueChange={(v) => {
                setDepartmentId(v === "all" ? "" : v);
                setPage(1);
                setExpandedId(null);
              }}
            >
              <SelectTrigger className={IDEAS_HUB_SELECT_TRIGGER_COORDINATOR}>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {!hasActiveCycle && (
            <Select
              value={cycleId || "all"}
              onValueChange={(v) => {
                setCycleId(v === "all" ? "" : v);
                setDepartmentId("");
                setCategoryId("");
                setPage(1);
                setExpandedId(null);
              }}
            >
              <SelectTrigger className={isQaCoordinator ? IDEAS_HUB_SELECT_TRIGGER_COORDINATOR : IDEAS_HUB_SELECT_TRIGGER}>
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
              <SelectTrigger className={isQaCoordinator ? IDEAS_HUB_SELECT_TRIGGER_COORDINATOR : IDEAS_HUB_SELECT_TRIGGER}>
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
          {!isQaCoordinator && (closedCycles.length > 0 || departments.length > 0 || categories.length > 0) && (
            <div className={IDEAS_HUB_TOOLBAR_DIVIDER} aria-hidden />
          )}
          {isQaCoordinator ? (
            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v as ViewMode);
                setPage(1);
                setExpandedId(null);
              }}
            >
              <SelectTrigger className={IDEAS_HUB_SELECT_TRIGGER_COORDINATOR} aria-label="Sort by">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {VIEW_TABS.map((tab) => (
                  <SelectItem key={tab.value} value={tab.value}>
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
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
          )}
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
                  : hasActiveCycle
                    ? "No proposals were submitted in this cycle"
                    : closedCycles.length > 0
                      ? "Select a cycle above to browse past proposals"
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
                      markViewedByAction(id, idea.cycleStatus ?? (hasActiveCycle && !effectiveCycleId ? "ACTIVE" : null));
                      voteMutation.mutate({ ideaId: id, value: v });
                    }}
                    onDwellComplete={(id) => markViewedByAction(id, idea.cycleStatus ?? (hasActiveCycle && !effectiveCycleId ? "ACTIVE" : null))}
                    votePending={voteMutation.isPending}
                    voteDisabled={!interactionOpen || isQaCoordinator}
                  />
                ))}
              </div>

          {pages > 1 && (
                <UnifiedPagination
                  page={page}
                  totalPages={pages}
                  setPage={setPage}
                  ariaLabel="Ideas feed pagination"
                  className="pt-8"
                  align="center"
                />
          )}
        </>
      )}
    </div>
  );
}
