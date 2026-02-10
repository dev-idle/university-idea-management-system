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
import {
  PAGE_WRAPPER_NARROW_CLASS,
  LOADING_WRAPPER_CLASS,
  LOADING_TEXT_CLASS,
  BACK_LINK_CLASS,
} from "@/config/design";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ArrowLeft,
  Download,
  FileText,
  Paperclip,
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
    <li className="flex items-center justify-between gap-3 rounded-xl border border-border/25 bg-muted/10 px-4 py-2.5 transition-colors hover:bg-muted/20">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <FileText
          className="size-4 shrink-0 text-muted-foreground/40"
          aria-hidden
        />
        <span
          className="min-w-0 truncate text-[13px] text-foreground/80"
          title={att.fileName}
        >
          {att.fileName}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-[11px] text-muted-foreground/50 hover:text-foreground/70"
          onClick={() => handle("view")}
          disabled={!!loading}
        >
          {loading === "view" ? "Opening…" : "Open"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-[11px] text-muted-foreground/50 hover:text-foreground/70"
          onClick={() => handle("download")}
          disabled={!!loading}
        >
          <Download className="size-3.5 shrink-0" aria-hidden />
          {loading === "download" ? "…" : "Save"}
        </Button>
      </div>
      {error && (
        <p className="mt-1.5 basis-full text-[11px] text-destructive" role="alert">
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
        <div className={LOADING_WRAPPER_CLASS}>
          <p className={LOADING_TEXT_CLASS} aria-live="polite">
            Loading proposal…
          </p>
        </div>
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
      {/* Back */}
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

      {/* ── Article ──────────────────────────────────────────────────── */}
      <article
        className="overflow-hidden rounded-2xl border border-border/30 bg-card"
        aria-labelledby="proposal-title"
      >
        {/* Byline */}
        <div className="flex items-center gap-3 px-6 py-5 sm:px-8">
          <Avatar className="size-9 shrink-0 rounded-full ring-1 ring-border/30">
            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/[0.03] text-[11px] font-semibold text-primary/60">
              {avatarInitial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-foreground/90">
              {idea.isAnonymous ? "Anonymous" : authorLabel}
            </p>
            <div className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted-foreground/50">
              <span>{timeAgo(idea.createdAt)}</span>
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
              {views > 0 && (
                <>
                  <span aria-hidden>·</span>
                  <span>
                    {views} view{views !== 1 ? "s" : ""}
                  </span>
                </>
              )}
            </div>
          </div>
          {idea.isAnonymous && (
            <Badge
              variant="outline"
              className="rounded-full border-border/30 px-2 py-0 text-[10px] font-normal italic text-muted-foreground/50"
            >
              Anonymous
            </Badge>
          )}
        </div>

        <div className="border-t border-border/10" />

        {/* Body */}
        <div className="px-6 py-10 sm:px-8 sm:py-12">
          <h1
            id="proposal-title"
            className="font-serif text-[28px] font-bold leading-[1.2] tracking-tight text-foreground sm:text-[34px]"
          >
            {idea.title}
          </h1>

          {idea.description && (
            <div className="mt-8 whitespace-pre-wrap text-[16px] leading-[1.9] text-foreground/70">
              {idea.description}
            </div>
          )}

          {idea.attachments.length > 0 && (
            <div className="mt-10 border-t border-border/15 pt-7">
              <h2 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50">
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
        <div className="flex flex-wrap items-center gap-2 border-t border-border/15 px-6 py-3.5 sm:px-8">
          <button
            type="button"
            disabled={!open || voteMutation.isPending}
            onClick={() => handleVote("up")}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all duration-200",
              myVote === "up"
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                : "text-muted-foreground/50 hover:bg-muted/50 hover:text-foreground/70",
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
              "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all duration-200",
              myVote === "down"
                ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
                : "text-muted-foreground/50 hover:bg-muted/50 hover:text-foreground/70",
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
        className="overflow-hidden rounded-2xl border border-border/30 bg-card"
        aria-labelledby="discussion-heading"
      >
        {/* Header */}
        <div className="px-6 py-5 sm:px-8">
          <h2
            id="discussion-heading"
            className="font-serif text-lg font-semibold tracking-tight text-foreground"
          >
            Discussion
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground/50">
            {comments.length} comment{comments.length !== 1 ? "s" : ""}
            {!open && endsAt && " · Closed"}
          </p>
        </div>

        <div className="border-t border-border/10" />

        <div className="px-6 py-6 sm:px-8">
          {/* Comment form */}
          {open && (
            <form
              onSubmit={handleComment}
              className="mb-7 border-b border-border/10 pb-7"
            >
              <Textarea
                id="comment-content"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment…"
                rows={2}
                className="resize-none rounded-xl border-border/25 bg-transparent text-[14px] placeholder:text-muted-foreground/35 focus-visible:ring-1 focus-visible:ring-primary/20"
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
              <div className="size-6 animate-spin rounded-full border-[1.5px] border-muted-foreground/15 border-t-primary/70" />
              <p className="mt-4 text-[12px] text-muted-foreground/50">
                Loading comments…
              </p>
            </div>
          )}
          {commentsStatus === "success" && comments.length === 0 && (
            <p className="py-12 text-center text-[13px] text-muted-foreground/40">
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
                      i > 0 && "border-t border-border/10",
                    )}
                  >
                    <Avatar className="size-7 shrink-0 rounded-full ring-1 ring-border/20">
                      <AvatarFallback className="bg-gradient-to-br from-muted/60 to-muted/20 text-[9px] font-semibold text-muted-foreground/60">
                        {init}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-[13px] font-medium text-foreground/85">
                          {name ?? (
                            <span className="italic text-muted-foreground/50">
                              Anonymous
                            </span>
                          )}
                        </span>
                        <time className="text-[11px] text-muted-foreground/40">
                          {timeAgo(c.createdAt)}
                        </time>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-[13.5px] leading-[1.75] text-foreground/65">
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
