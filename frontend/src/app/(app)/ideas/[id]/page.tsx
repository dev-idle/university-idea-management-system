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
import { getAvatarInitial, getCommentDisplayInfo, cn, timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingState } from "@/components/ui/loading-state";
import {
  PAGE_WRAPPER_NARROW_CLASS,
  IDEAS_HUB_SPACING,
  IDEAS_HUB_ENGAGEMENT_BORDER,
  IDEAS_HUB_ACTION_BASE,
  IDEAS_HUB_ACTION_INACTIVE,
  IDEAS_HUB_ACTION_UP,
  IDEAS_HUB_ACTION_DOWN,
  IDEAS_HUB_COUNT,
  IDEA_ARTICLE_CLASS,
  IDEA_ARTICLE_BODY_CLASS,
  IDEA_ARTICLE_TITLE_CLASS,
  IDEA_ARTICLE_DESC_CLASS,
  IDEA_ARTICLE_DIVIDER,
  IDEA_DISCUSSION_DIVIDER,
  IDEA_ARTICLE_PX,
  IDEA_ARTICLE_SECTION_LABEL,
  IDEA_ATTACHMENT_ITEM,
  IDEA_ATTACHMENT_NAME,
} from "@/config/design";
import {
  BREADCRUMB_GHOST_CLASS,
  BREADCRUMB_SEP_CLASS,
} from "@/components/features/admin/constants";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Download,
  FileText,
  Paperclip,
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
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <FileText
          className="size-3.5 shrink-0 text-muted-foreground/50"
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
          className="h-7 gap-1 px-2 text-[11px] text-muted-foreground/55 hover:text-foreground/80"
          onClick={() => handle("view")}
          disabled={!!loading}
        >
          {loading === "view" ? "Opening…" : "Open"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-[11px] text-muted-foreground/55 hover:text-foreground/80"
          onClick={() => handle("download")}
          disabled={!!loading}
        >
          <Download className="size-3 shrink-0" aria-hidden />
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
    <div className={cn(IDEAS_HUB_SPACING, PAGE_WRAPPER_NARROW_CLASS)}>
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

      {/* ── Article + Discussion (single card) ───────────────────────── */}
      <article
        className={IDEA_ARTICLE_CLASS}
        aria-labelledby="proposal-title"
      >
        {/* Byline — compact, Facebook-style (avatar + name + meta inline) */}
        <div className={cn(IDEA_ARTICLE_PX, "flex items-center gap-3 pt-4 pb-3 sm:pt-5 sm:pb-4")}>
          <Avatar className="size-9 shrink-0 rounded-full ring-1 ring-border/30">
            <AvatarFallback className="bg-muted/50 text-[11px] font-semibold text-muted-foreground/65">
              {avatarInitial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className={cn("truncate text-[13px] font-semibold text-foreground/95", idea.isAnonymous && "italic")}>
              {idea.isAnonymous ? "Anonymous" : authorLabel}
            </p>
            <p className={cn("mt-0.5 text-[11px] text-muted-foreground/55 truncate")}>
              <time dateTime={new Date(idea.createdAt).toISOString()}>{timeAgo(idea.createdAt)}</time>
              {idea.category?.name && (
                <>
                  <span className="mx-1.5" aria-hidden>·</span>
                  <span className="font-medium text-primary/75">{idea.category.name}</span>
                </>
              )}
              {views > 0 && (
                <>
                  <span className="mx-1.5" aria-hidden>·</span>
                  <span>{views} view{views !== 1 ? "s" : ""}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className={IDEA_ARTICLE_DIVIDER} />

        {/* Body */}
        <div className={IDEA_ARTICLE_BODY_CLASS}>
          <h1 id="proposal-title" className={IDEA_ARTICLE_TITLE_CLASS}>
            {idea.title}
          </h1>

          {idea.description && (
            <div className={cn("whitespace-pre-wrap", IDEA_ARTICLE_DESC_CLASS)}>
              {idea.description}
            </div>
          )}

          {idea.attachments.length > 0 && (
            <div className={cn("mt-6 pt-5", IDEA_ARTICLE_DIVIDER)}>
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

        {/* Action bar — Facebook-style: Support | Don't support | Comment | Views */}
        <div className={cn(IDEAS_HUB_ENGAGEMENT_BORDER, "flex items-center gap-1 px-5 py-2.5 sm:px-6 sm:py-3")}>
          <button
            type="button"
            disabled={!open || voteMutation.isPending}
            onClick={() => handleVote("up")}
            className={cn(
              IDEAS_HUB_ACTION_BASE,
              "cursor-pointer",
              myVote === "up" ? IDEAS_HUB_ACTION_UP : IDEAS_HUB_ACTION_INACTIVE,
              (!open || voteMutation.isPending) && "pointer-events-none opacity-50",
            )}
            aria-label="Support"
          >
            <ThumbsUp className="size-3.5 shrink-0" aria-hidden />
            {votes.up}
          </button>
          <div className="h-4 w-px shrink-0 self-center bg-border/30" aria-hidden />
          <button
            type="button"
            disabled={!open || voteMutation.isPending}
            onClick={() => handleVote("down")}
            className={cn(
              IDEAS_HUB_ACTION_BASE,
              "cursor-pointer",
              myVote === "down" ? IDEAS_HUB_ACTION_DOWN : IDEAS_HUB_ACTION_INACTIVE,
              (!open || voteMutation.isPending) && "pointer-events-none opacity-50",
            )}
            aria-label="Do not support"
          >
            <ThumbsDown className="size-3.5 shrink-0" aria-hidden />
            {votes.down}
          </button>
          <div className="mx-1.5 h-4 w-px shrink-0 self-center bg-border/30" aria-hidden />
          <span className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_ACTION_INACTIVE, "cursor-default")}>
            <MessageSquare className="size-3.5 shrink-0" aria-hidden />
            {comments.length}
          </span>
          <div className="min-w-0 flex-1" aria-hidden />
          <span className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_COUNT, "cursor-default")}>
            <Eye className="size-3.5 shrink-0" aria-hidden />
            {views}
          </span>
          {endsAt && (
            <span className={cn("ml-1 shrink-0 text-[11px]", IDEAS_HUB_COUNT)}>
              {open ? <>· Open {formatDate(endsAt)}</> : <>· Closed</>}
            </span>
          )}
        </div>

        {/* Comment input — Facebook-style, right after actions */}
        <div className={IDEA_DISCUSSION_DIVIDER}>
          <div className={cn(IDEA_ARTICLE_PX, "pt-4 pb-3 sm:pt-5 sm:pb-4")}>
            {open ? (
              <form onSubmit={handleComment} className="flex gap-3">
                <Avatar className="size-8 shrink-0 rounded-full ring-1 ring-border/25">
                  <AvatarFallback className="bg-muted/50 text-[10px] font-semibold text-muted-foreground/60">
                    ?
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-2">
                  <Textarea
                    id="comment-content"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Write a comment…"
                    rows={2}
                    className="min-h-[72px] resize-none rounded-2xl border border-border/40 bg-muted/[0.04] px-3.5 py-2.5 text-[13px] placeholder:text-muted-foreground/50 focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/[0.08]"
                    maxLength={2000}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground/60 hover:text-muted-foreground/80">
                      <Checkbox
                        checked={commentAnonymous}
                        onCheckedChange={(v) => setCommentAnonymous(v === true)}
                        aria-label="Submit anonymously"
                        className="h-3.5 w-3.5 rounded border-border/40"
                      />
                      Submit anonymously
                    </label>
                    <Button
                      type="submit"
                      size="sm"
                      className="h-7 rounded-full px-3 text-[11px] font-medium"
                      disabled={!commentContent.trim() || createCommentMutation.isPending}
                    >
                      {createCommentMutation.isPending ? "Posting…" : "Post"}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <p className="text-[12px] text-muted-foreground/50">
                {comments.length} comment{comments.length !== 1 ? "s" : ""}
                {endsAt && " · Closed"}
              </p>
            )}
          </div>

          {/* Comments list — compact, Facebook-style */}
          <div className={cn(IDEA_ARTICLE_PX, "pb-5 sm:pb-6")}>
            {commentsStatus === "pending" && (
              <div className="flex flex-col items-center py-8">
                <div className={cn("loading-spinner size-5 shrink-0 rounded-full border border-primary/[0.08] border-t-primary")} aria-hidden />
                <p className="mt-3 text-[11px] text-muted-foreground/50">Loading comments…</p>
              </div>
            )}
            {commentsStatus === "success" && comments.length === 0 && (
              <p className="py-6 text-center text-[12px] text-muted-foreground/45">
                No comments yet.{open && " Be the first to share your thoughts."}
              </p>
            )}
            {comments.length > 0 && (
              <ul className="space-y-0" role="list">
                {comments.map((c, i) => {
                  const { displayName, avatarInitial } = getCommentDisplayInfo(c);
                  return (
                    <li
                      key={c.id}
                      className={cn("flex gap-2.5 py-3", i > 0 && "border-t border-border/15")}
                    >
                      <Avatar className="size-7 shrink-0 rounded-full ring-1 ring-border/20">
                        <AvatarFallback className="bg-muted/50 text-[9px] font-semibold text-muted-foreground/60">
                          {avatarInitial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] leading-snug">
                          <span
                            className={cn(
                              "font-semibold text-foreground/95",
                              displayName === "Anonymous" && "italic text-muted-foreground/55",
                            )}
                          >
                            {displayName}
                          </span>
                          <span className="text-muted-foreground/45"> · </span>
                          <time className="text-muted-foreground/50">{timeAgo(c.createdAt)}</time>
                        </p>
                        <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-[1.5] text-foreground/85">
                          {c.content}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
