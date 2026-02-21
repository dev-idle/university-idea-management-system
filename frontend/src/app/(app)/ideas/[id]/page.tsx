"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useIdeaQuery,
  useIdeaCommentsQuery,
  useVoteIdeaMutation,
  useCreateCommentMutation,
} from "@/hooks/use-ideas";
import { useIdeaViewTracker } from "@/hooks/use-idea-view-tracker";
import { ROUTES } from "@/config/constants";
import { fetchWithAuthResponse } from "@/lib/api/client";
import { getAvatarInitial, cn, timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingState } from "@/components/ui/loading-state";
import {
  PAGE_WRAPPER_NARROW_CLASS,
  IDEA_ARTICLE_CLASS,
  IDEA_ARTICLE_BYLINE_CLASS,
  IDEA_ARTICLE_BYLINE_AUTHOR,
  IDEA_ARTICLE_BYLINE_META,
  BYLINE_META_SEP,
  IDEA_ARTICLE_BODY_CLASS,
  IDEA_ARTICLE_TITLE_CLASS,
  IDEA_ARTICLE_DESC_CLASS,
  IDEA_ARTICLE_DIVIDER,
  IDEA_ARTICLE_FOOTER_CLASS,
  IDEA_DISCUSSION_CLASS,
  IDEA_ARTICLE_PX,
  IDEA_ARTICLE_SECTION_LABEL,
  IDEA_DISCUSSION_HEADING,
  IDEA_DISCUSSION_SUBTITLE,
  IDEA_ATTACHMENT_ITEM,
  IDEA_COMMENT_AVATAR,
  IDEA_COMMENT_AVATAR_FALLBACK,
  IDEA_COMMENT_HEADER,
  IDEA_COMMENT_AUTHOR,
  IDEA_COMMENT_TIME,
  IDEA_COMMENT_BODY,
  IDEA_ATTACHMENT_NAME,
  STAFF_HEADER_ACCENT_CLASS,
} from "@/config/design";
import {
  BREADCRUMB_GHOST_CLASS,
  BREADCRUMB_SEP_CLASS,
} from "@/components/features/admin/constants";
import {
  ThumbsUp,
  ThumbsDown,
  Download,
  FileText,
  Paperclip,
  Clock,
  Tag,
  Eye,
} from "lucide-react";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ─── Attachment ──────────────────────────────────────────────────────────── */

type Attachment = { id: string; fileName: string; secureUrl: string };

function AttachmentItem({ att }: { att: Attachment }) {
  const [loading, setLoading] = useState<"view" | "download" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openBlob = (
    blob: Blob,
    name: string,
    mode: "view" | "download",
  ) => {
    const url = URL.createObjectURL(blob);
    if (mode === "view") {
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handle = async (action: "view" | "download") => {
    setError(null);
    setLoading(action);
    try {
      const res = await fetchWithAuthResponse(
        `ideas/attachments/${att.id}/${action}`,
      );
      openBlob(await res.blob(), att.fileName, action);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : `Could not ${action === "view" ? "open" : "download"} the file.`,
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <li className={IDEA_ATTACHMENT_ITEM}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <FileText
          className="size-4 shrink-0 text-muted-foreground/40"
          aria-hidden
        />
        <span className={IDEA_ATTACHMENT_NAME} title={att.fileName}>
          {att.fileName}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 text-xs text-muted-foreground/50 hover:text-foreground/70"
          onClick={() => handle("view")}
          disabled={!!loading}
        >
          {loading === "view" ? "Opening…" : "Open"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground/50 hover:text-foreground/70"
          onClick={() => handle("download")}
          disabled={!!loading}
        >
          <Download className="size-4 shrink-0" aria-hidden />
          {loading === "download" ? "…" : "Save"}
        </Button>
      </div>
      {error && (
        <p className="mt-1.5 basis-full text-xs leading-relaxed text-destructive/90" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : null;
  const { data: idea, status, error } = useIdeaQuery(id);
  const { data: comments = [], status: commentsStatus } =
    useIdeaCommentsQuery(id);
  const voteMutation = useVoteIdeaMutation();
  const createCommentMutation = useCreateCommentMutation();
  const { markViewedByAction } = useIdeaViewTracker(id);

  const [commentContent, setCommentContent] = useState("");
  const [commentAnonymous, setCommentAnonymous] = useState(false);

  useEffect(() => {
    if (!id) router.replace(ROUTES.IDEAS);
  }, [id, router]);

  if (!id) return null;
  if (status === "error") throw error;
  if (status === "pending" || !idea) {
    return (
      <div className={PAGE_WRAPPER_NARROW_CLASS}>
        <LoadingState />
      </div>
    );
  }

  const votes = idea.voteCounts ?? { up: 0, down: 0 };
  const myVote = idea.myVote ?? null;
  const totalVotes = votes.up + votes.down;
  const endsAt = idea.interactionClosesAt
    ? new Date(idea.interactionClosesAt)
    : null;
  const open = !!endsAt && new Date() < endsAt;
  const views = idea.viewCount ?? 0;
  const authorLabel = idea.author
    ? idea.author.fullName?.trim() || idea.author.email
    : "Anonymous";
  const avatarInitial = idea.author
    ? getAvatarInitial(idea.author.fullName ?? null, idea.author.email)
    : "?";

  const handleVote = (v: "up" | "down") => {
    if (!open || voteMutation.isPending) return;
    markViewedByAction(id);
    voteMutation.mutate({ ideaId: id, value: v });
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentContent.trim();
    if (!trimmed || createCommentMutation.isPending) return;
    markViewedByAction(id);
    createCommentMutation.mutate(
      { ideaId: id, body: { content: trimmed, isAnonymous: commentAnonymous } },
      {
        onSuccess: () => {
          setCommentContent("");
          setCommentAnonymous(false);
        },
      },
    );
  };

  return (
    <div className={`space-y-10 ${PAGE_WRAPPER_NARROW_CLASS}`}>
      {/* Breadcrumb */}
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
            Proposal
          </li>
        </ol>
      </nav>

      {/* ── Article ──────────────────────────────────────────────────── */}
      <article
        className={IDEA_ARTICLE_CLASS}
        aria-labelledby="proposal-title"
      >
        {/* Byline */}
        <div className={IDEA_ARTICLE_BYLINE_CLASS}>
          <Avatar className="size-10 shrink-0 rounded-full ring-1 ring-border/20">
            <AvatarFallback className="bg-muted/50 text-xs font-semibold text-muted-foreground/70">
              {avatarInitial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className={cn("truncate", IDEA_ARTICLE_BYLINE_AUTHOR)}>
              {idea.isAnonymous ? "Anonymous" : authorLabel}
            </p>
            <div className={IDEA_ARTICLE_BYLINE_META}>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3 shrink-0 opacity-50" aria-hidden />
                <time dateTime={new Date(idea.createdAt).toISOString()}>
                  {timeAgo(idea.createdAt)}
                </time>
              </span>
              {idea.category?.name && (
                <>
                  <span className={cn(BYLINE_META_SEP)} aria-hidden />
                  <span className="inline-flex items-center gap-1.5 font-medium text-primary/80">
                    <Tag className="size-3 shrink-0 opacity-75" aria-hidden />
                    {idea.category.name}
                  </span>
                </>
              )}
              {views > 0 && (
                <>
                  <span className={cn(BYLINE_META_SEP)} aria-hidden />
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="size-3 shrink-0 opacity-50" aria-hidden />
                    <span>{views} view{views !== 1 ? "s" : ""}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={IDEA_ARTICLE_DIVIDER} />

        {/* Body */}
        <div className={IDEA_ARTICLE_BODY_CLASS}>
          <h1 id="proposal-title" className={IDEA_ARTICLE_TITLE_CLASS}>
            {idea.title}
          </h1>
          <div className={`mt-5 ${STAFF_HEADER_ACCENT_CLASS}`} aria-hidden />

          {idea.description && (
            <div className={cn("mt-7 whitespace-pre-wrap", IDEA_ARTICLE_DESC_CLASS)}>
              {idea.description}
            </div>
          )}

          {idea.attachments.length > 0 && (
            <div className={cn("mt-9 pt-6", IDEA_ARTICLE_DIVIDER)}>
              <h2 className={IDEA_ARTICLE_SECTION_LABEL}>
                <Paperclip className="size-3.5 shrink-0" aria-hidden />
                Attachments ({idea.attachments.length})
              </h2>
              <ul className="mt-3 space-y-1.5">
                {idea.attachments.map((att) => (
                  <AttachmentItem key={att.id} att={att} />
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Reactions */}
        <div className={cn(IDEA_ARTICLE_DIVIDER, IDEA_ARTICLE_FOOTER_CLASS)}>
          <button
            type="button"
            disabled={!open || voteMutation.isPending}
            onClick={() => handleVote("up")}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors duration-100 disabled:cursor-not-allowed",
              myVote === "up"
                ? "text-success"
                : "text-muted-foreground/50 hover:bg-muted/[0.06] hover:text-foreground/70",
              (!open || voteMutation.isPending) &&
                "pointer-events-none opacity-40",
            )}
            aria-label="Support"
          >
            <ThumbsUp className="size-3.5" aria-hidden />
            <span className="tabular-nums">{votes.up}</span>
          </button>

          <button
            type="button"
            disabled={!open || voteMutation.isPending}
            onClick={() => handleVote("down")}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors duration-100 disabled:cursor-not-allowed",
              myVote === "down"
                ? "text-destructive"
                : "text-muted-foreground/50 hover:bg-muted/[0.06] hover:text-foreground/70",
              (!open || voteMutation.isPending) &&
                "pointer-events-none opacity-40",
            )}
            aria-label="Do not support"
          >
            <ThumbsDown className="size-3.5" aria-hidden />
            <span className="tabular-nums">{votes.down}</span>
          </button>

          <span className="text-[11px] tabular-nums text-muted-foreground/30">
            {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
          </span>

          <div className="flex-1" />

          {endsAt && (
            <p className="text-[11px] text-muted-foreground/40">
              {open ? (
                <>Open until {formatDate(endsAt)}</>
              ) : (
                <>Closed {formatDate(endsAt)}</>
              )}
            </p>
          )}
        </div>
      </article>

      {/* ── Discussion ───────────────────────────────────────────────── */}
      <section
        className={IDEA_DISCUSSION_CLASS}
        aria-labelledby="discussion-heading"
      >
        {/* Header */}
        <div className={cn(IDEA_ARTICLE_PX, "py-4 sm:py-5")}>
          <h2 id="discussion-heading" className={IDEA_DISCUSSION_HEADING}>
            Discussion
          </h2>
          <p className={IDEA_DISCUSSION_SUBTITLE}>
            {comments.length} comment{comments.length !== 1 ? "s" : ""}
            {!open && endsAt && " · Closed"}
          </p>
        </div>

        <div className={IDEA_ARTICLE_DIVIDER} />

        <div className={cn(IDEA_ARTICLE_PX, "py-5 sm:py-6")}>
          {/* Comment form */}
          {open && (
            <form
              onSubmit={handleComment}
              className="mb-6 border-b border-border/20 pb-6"
            >
              <Textarea
                id="comment-content"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment…"
                rows={2}
                className="resize-none rounded-xl border-border/25 bg-transparent text-[14px] placeholder:text-muted-foreground/35 focus-visible:ring-1 focus-visible:ring-primary/[0.08]"
                maxLength={2000}
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-[12px] text-muted-foreground/50">
                  <Checkbox
                    checked={commentAnonymous}
                    onCheckedChange={(v) => setCommentAnonymous(v === true)}
                    aria-label="Submit anonymously"
                    className="rounded border-border/40"
                  />
                  Anonymous
                </label>
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 rounded-full px-4 text-[11px] font-medium"
                  disabled={
                    !commentContent.trim() ||
                    createCommentMutation.isPending
                  }
                >
                  {createCommentMutation.isPending ? "Posting…" : "Post"}
                </Button>
              </div>
            </form>
          )}

          {/* Comments */}
          {commentsStatus === "pending" && (
            <div className="flex flex-col items-center py-12">
              <div className={cn("loading-spinner size-6 shrink-0 rounded-full border border-primary/[0.08] border-t-primary")} aria-hidden />
              <p className="mt-4 text-xs text-muted-foreground/50">
                Loading comments…
              </p>
            </div>
          )}
          {commentsStatus === "success" && comments.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground/45">
              No comments yet.{" "}
              {open && "Be the first to share your thoughts."}
            </p>
          )}
          {comments.length > 0 && (
            <ul className="space-y-0" role="list">
              {comments.map((c, i) => {
                const name = c.author
                  ? c.author.fullName?.trim() || c.author.email
                  : null;
                const init = c.author
                  ? getAvatarInitial(c.author.fullName ?? null, c.author.email)
                  : "?";
                return (
                  <li
                    key={c.id}
                    className={cn(
                      "flex gap-3 py-5",
                      i > 0 && IDEA_ARTICLE_DIVIDER,
                    )}
                  >
                    <Avatar className={IDEA_COMMENT_AVATAR}>
                      <AvatarFallback className={IDEA_COMMENT_AVATAR_FALLBACK}>
                        {init}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className={IDEA_COMMENT_HEADER}>
                        <span className={IDEA_COMMENT_AUTHOR}>
                          {name ?? (
                            <span className="italic text-muted-foreground/50">
                              Anonymous
                            </span>
                          )}
                        </span>
                        <time className={IDEA_COMMENT_TIME}>
                          {timeAgo(c.createdAt)}
                        </time>
                      </div>
                      <p className={IDEA_COMMENT_BODY}>
                        {c.content}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
