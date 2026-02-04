"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useIdeasQuery,
  useIdeasContextQuery,
  useVoteIdeaMutation,
} from "@/hooks/use-ideas";
import type { Idea } from "@/lib/schemas/ideas.schema";
import { ROUTES } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Lightbulb,
  Plus,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Eye,
  FileText,
  ExternalLink,
  ChevronDown,
  CalendarDays,
  Tag,
  ArrowRight,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getAvatarInitial } from "@/lib/utils";
import { LOADING_TEXT_CLASS, SECTION_CARD_TITLE_CLASS, STAFF_PAGE_SPACING, CARD_CLASS, ALERT_WARNING_CLASS, ICON_BOX_PRIMARY_CLASS } from "@/config/design";
import {
  IDEAS_CARD_ACCENT_BAR_CLASS,
  IDEAS_SECTION_LABEL_CLASS,
} from "./ui-constants";

const PAGE_SIZE = 5;
const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "mostPopular", label: "Most supported" },
  { value: "mostViewed", label: "Most viewed" },
] as const;

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Single idea post card: blog-style, content-first. */
function IdeaCard({
  idea,
  isExpanded,
  onVote,
  onExpandInline,
  onOpenFullPage,
  votePending,
}: {
  idea: Idea;
  isExpanded: boolean;
  onVote: (ideaId: string, value: "up" | "down") => void;
  onExpandInline: (ideaId: string) => void;
  onOpenFullPage: (ideaId: string) => void;
  votePending: boolean;
}) {
  const voteCounts = idea.voteCounts ?? { up: 0, down: 0 };
  const myVote = idea.myVote ?? null;
  const commentCount = idea.commentCount ?? 0;
  const viewCount = idea.viewCount ?? 0;
  const displayName = idea.author
    ? idea.author.fullName?.trim() || idea.author.email
    : "Anonymous";
  const avatarInitial = idea.author
    ? getAvatarInitial(idea.author.fullName ?? null, idea.author.email)
    : "?";

  const handleVote = (e: React.MouseEvent, value: "up" | "down") => {
    e.preventDefault();
    e.stopPropagation();
    onVote(idea.id, value);
  };

  return (
    <article className={`group overflow-hidden ${CARD_CLASS} transition-all duration-200 hover:shadow-md hover:border-primary/20`}>
      <div className="flex min-h-0 flex-1">
        <div className={IDEAS_CARD_ACCENT_BAR_CLASS} aria-hidden />

        <div className="min-w-0 flex-1">
          {/* Meta row: category + date + menu */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              {idea.category?.name && (
                <span className={`inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2.5 py-1 ${IDEAS_SECTION_LABEL_CLASS}`}>
                  <Tag className="size-3 shrink-0 opacity-70" aria-hidden />
                  {idea.category.name}
                </span>
              )}
              <time
                className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground tabular-nums"
                dateTime={new Date(idea.createdAt).toISOString()}
              >
                <CalendarDays className="size-3 shrink-0 opacity-70" aria-hidden />
                {formatDate(idea.createdAt)}
              </time>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  aria-label="Open menu"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreVertical className="size-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                <DropdownMenuItem onSelect={() => onExpandInline(idea.id)}>
                  <ChevronDown className="size-4 shrink-0 mr-2" aria-hidden />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onOpenFullPage(idea.id)}>
                  <ExternalLink className="size-4 shrink-0 mr-2" aria-hidden />
                  Open full page
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Body: title + short preview (line-clamp-2); View details shows full text from same paragraph styling */}
          <div className="px-5 py-5">
            <Link
              href={`${ROUTES.IDEAS}/${idea.id}`}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md -m-1 p-1"
            >
              <h2 className="font-serif text-xl font-semibold tracking-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {idea.title}
              </h2>
            </Link>
            {idea.description && (
              <p
                className={
                  isExpanded
                    ? "mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap"
                    : "mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2"
                }
              >
                {idea.description}
              </p>
            )}
            {isExpanded && idea.attachments.length > 0 && (
              <div className={idea.description ? "mt-4 pt-4 border-t border-border" : "mt-3"}>
                <p className={`mb-2 ${IDEAS_SECTION_LABEL_CLASS}`}>
                  Attachments
                </p>
                <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
                  {idea.attachments.map((att) => (
                    <li
                      key={att.id}
                      className="flex items-center gap-2 rounded-md border border-border/50 bg-background/80 px-2.5 py-1.5 text-xs text-muted-foreground"
                    >
                      <FileText className="size-3.5 shrink-0" aria-hidden />
                      <span className="truncate max-w-[200px]" title={att.fileName}>
                        {att.fileName}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link
              href={`${ROUTES.IDEAS}/${idea.id}`}
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-primary focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              Open full page
              <ArrowRight className="size-3.5 shrink-0" aria-hidden />
            </Link>
          </div>

          {/* Footer: contributor + engagement */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/50 bg-muted/5 px-5 py-3.5 rounded-b-xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="size-8 shrink-0 rounded-full border border-border bg-muted/50 shadow-sm">
                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
                  {avatarInitial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Submitted by
                </p>
                <p className="text-sm font-medium text-foreground truncate">
                  {displayName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span
                className="inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-[11px] text-muted-foreground border border-border/50"
                aria-hidden
              >
                <Eye className="size-3" />
                {viewCount}
              </span>
              <span
                className="inline-flex items-center"
                onClick={(e) => handleVote(e, "up")}
                role="group"
                aria-label="Support"
              >
                <Button
                  type="button"
                  variant={myVote === "up" ? "default" : "ghost"}
                  size="sm"
                  className="h-7 gap-1 rounded-md px-2 text-xs min-w-0"
                  disabled={votePending}
                  aria-label="Support"
                >
                  <ThumbsUp className="size-3.5" aria-hidden />
                  {voteCounts.up}
                </Button>
              </span>
              <span
                className="inline-flex items-center"
                onClick={(e) => handleVote(e, "down")}
                role="group"
                aria-label="Do not support"
              >
                <Button
                  type="button"
                  variant={myVote === "down" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 gap-1 rounded-md px-2 text-xs min-w-0"
                  disabled={votePending}
                  aria-label="Do not support"
                >
                  <ThumbsDown className="size-3.5" aria-hidden />
                  {voteCounts.down}
                </Button>
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-[11px] text-muted-foreground border border-border/50"
                aria-hidden
              >
                <MessageSquare className="size-3" />
                {commentCount}
              </span>
            </div>
          </div>
        </div>
      </div>

    </article>
  );
}

export function IdeasHubContent() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"latest" | "mostPopular" | "mostViewed">("latest");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: context, status: contextStatus, error: contextError } = useIdeasContextQuery();
  const { data: listData, status: ideasStatus, error: ideasError } = useIdeasQuery(
    { page, limit: PAGE_SIZE, sort },
    { enabled: true }
  );
  const voteMutation = useVoteIdeaMutation();

  if (contextStatus === "error") throw contextError;
  if (ideasStatus === "error") throw ideasError;

  const canSubmit = context?.canSubmit ?? false;
  const submissionClosesAt = context?.submissionClosesAt;
  const ideas = listData?.items ?? [];
  const total = listData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleOpenFullPage = (ideaId: string) => {
    setExpandedId(null);
    router.push(`${ROUTES.IDEAS}/${ideaId}`);
  };

  const handleExpandInline = (ideaId: string) => {
    setExpandedId((prev) => (ideaId === "" ? null : prev === ideaId ? null : ideaId));
  };

  return (
    <div className={STAFF_PAGE_SPACING}>
      {!canSubmit && (
        <Alert className={ALERT_WARNING_CLASS}>
          <AlertDescription>
            Submission is currently closed. You may still view all proposals for the active academic year.
          </AlertDescription>
        </Alert>
      )}

      {context?.activeCycleId && (
        <div className={`flex flex-wrap items-center justify-between gap-6 sm:gap-8 ${CARD_CLASS} border-primary/5 bg-primary/[0.03] px-6 py-6 sm:px-8 sm:py-7`}>
          <p className="min-w-0 flex-1 text-sm leading-relaxed text-muted-foreground">
            Proposals in this list belong to the current submission cycle for the active academic year.
            {canSubmit && submissionClosesAt && (
              <span className="mt-2 block">
                Submissions accepted until{" "}
                {new Date(submissionClosesAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                .
              </span>
            )}
          </p>
          {canSubmit && (
            <Button asChild size="default" className="h-10 shrink-0 gap-2 rounded-lg px-5 font-medium bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href={ROUTES.IDEAS_NEW}>
                <Plus className="size-4 shrink-0" aria-hidden />
                New proposal
              </Link>
            </Button>
          )}
        </div>
      )}

      <section className="space-y-10" aria-labelledby="ideas-heading">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-8">
          <div className="flex items-center gap-3">
            <div className={ICON_BOX_PRIMARY_CLASS}>
              <Lightbulb className="size-5" aria-hidden />
            </div>
            <h2 id="ideas-heading" className={SECTION_CARD_TITLE_CLASS}>
              Proposals
            </h2>
          </div>
          <Select
            value={sort}
            onValueChange={(v) => {
              setSort(v as "latest" | "mostPopular" | "mostViewed");
              setPage(1);
            }}
          >
            <SelectTrigger className="h-10 w-[180px] rounded-lg border-border bg-background focus:ring-2 focus:ring-primary/20">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="rounded-md">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(contextStatus === "pending" || ideasStatus === "pending") && !listData ? (
          <div className={`${CARD_CLASS} py-24 text-center`}>
            <p className={LOADING_TEXT_CLASS} aria-live="polite">
              Loading proposals…
            </p>
          </div>
        ) : !ideas.length ? (
          <div className={`${CARD_CLASS} py-24 text-center`}>
            <p className={LOADING_TEXT_CLASS}>
              No proposals have been submitted yet for the active academic year.
            </p>
          </div>
        ) : (
          <>
            <ul className="grid gap-10 sm:grid-cols-1">
              {ideas.map((idea) => (
                <li key={idea.id}>
                  <IdeaCard
                    idea={idea}
                    isExpanded={expandedId === idea.id}
                    onVote={(ideaId, value) => voteMutation.mutate({ ideaId, value })}
                    onExpandInline={handleExpandInline}
                    onOpenFullPage={handleOpenFullPage}
                    votePending={voteMutation.isPending}
                  />
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <Pagination className="mt-12 pt-8 border-t border-border">
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
                          ? "pointer-events-none opacity-50"
                          : "rounded-lg border-border focus-visible:ring-2 focus-visible:ring-primary/20"
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(p);
                        }}
                        isActive={page === p}
                        className="rounded-lg focus-visible:ring-2 focus-visible:ring-primary/20"
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
                        if (page < totalPages) setPage(page + 1);
                      }}
                      aria-disabled={page >= totalPages}
                      className={
                        page >= totalPages
                          ? "pointer-events-none opacity-50"
                          : "rounded-lg border-border focus-visible:ring-2 focus-visible:ring-primary/20"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </section>
    </div>
  );
}
