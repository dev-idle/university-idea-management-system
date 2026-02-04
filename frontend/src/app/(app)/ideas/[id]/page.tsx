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
import { ROUTES } from "@/config/constants";
import { fetchWithAuthResponse } from "@/lib/api/client";
import { getAvatarInitial } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  PAGE_WRAPPER_NARROW_CLASS,
  STAFF_PAGE_SPACING,
  LOADING_WRAPPER_CLASS,
  LOADING_TEXT_CLASS,
  PAGE_TITLE_CLASS,
  SECTION_CARD_TITLE_CLASS,
  SECTION_CARD_DESCRIPTION_CLASS,
  CARD_CLASS,
  BACK_LINK_CLASS,
} from "@/config/design";
import {
  IDEAS_CARD_ACCENT_CLASS,
  IDEAS_CARD_ACCENT_BAR_CLASS,
  IDEAS_SECTION_LABEL_CLASS,
  IDEAS_BUTTON_CLASS,
} from "@/components/features/ideas/ui-constants";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  User,
  Eye,
  Paperclip,
} from "lucide-react";

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Attachment = { id: string; fileName: string; secureUrl: string };

function AttachmentItem({ att }: { att: Attachment }) {
  const [loading, setLoading] = useState<"view" | "download" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const viewPath = `ideas/attachments/${att.id}/view`;
  const downloadPath = `ideas/attachments/${att.id}/download`;

  const openBlob = (blob: Blob, fileName: string, disposition: "view" | "download") => {
    const objectUrl = URL.createObjectURL(blob);
    if (disposition === "view") {
      window.open(objectUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } else {
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleView = async () => {
    setError(null);
    setLoading("view");
    try {
      const res = await fetchWithAuthResponse(viewPath);
      const blob = await res.blob();
      openBlob(blob, att.fileName, "view");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The file could not be opened.");
    } finally {
      setLoading(null);
    }
  };

  const handleDownload = async () => {
    setError(null);
    setLoading("download");
    try {
      const res = await fetchWithAuthResponse(downloadPath);
      const blob = await res.blob();
      openBlob(blob, att.fileName, "download");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The file could not be downloaded.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <li className="rounded-lg border border-border/80 bg-muted/20 px-4 py-3 transition-colors hover:border-border hover:bg-muted/30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background">
            <FileText className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <span className="min-w-0 truncate text-sm text-foreground" title={att.fileName}>
            {att.fileName}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={handleView}
            disabled={!!loading}
            aria-label={`Open ${att.fileName}`}
          >
            {loading === "view" ? "Opening…" : "Open"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={handleDownload}
            disabled={!!loading}
            aria-label={`Download ${att.fileName}`}
          >
            <Download className="size-4 shrink-0" aria-hidden />
            {loading === "download" ? "Downloading…" : "Download"}
          </Button>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : null;
  const { data: idea, status, error } = useIdeaQuery(id);
  const { data: comments = [], status: commentsStatus } = useIdeaCommentsQuery(id);
  const voteMutation = useVoteIdeaMutation();
  const createCommentMutation = useCreateCommentMutation();

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

  const voteCounts = idea.voteCounts ?? { up: 0, down: 0 };
  const myVote = idea.myVote ?? null;
  const feedbackEndsAt = idea.interactionClosesAt
    ? new Date(idea.interactionClosesAt)
    : null;
  const feedbackOpen = !!feedbackEndsAt && new Date() < feedbackEndsAt;
  const viewCount = idea.viewCount ?? 0;
  const authorLabel = idea.author
    ? idea.author.fullName?.trim() || idea.author.email
    : "Anonymous";

  const handleVote = (value: "up" | "down") => {
    if (!feedbackOpen || voteMutation.isPending) return;
    voteMutation.mutate({ ideaId: id, value });
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentContent.trim();
    if (!trimmed || createCommentMutation.isPending) return;
    createCommentMutation.mutate(
      { ideaId: id, body: { content: trimmed, isAnonymous: commentAnonymous } },
      {
        onSuccess: () => {
          setCommentContent("");
          setCommentAnonymous(false);
        },
      }
    );
  };

  return (
    <div className={`${STAFF_PAGE_SPACING} ${PAGE_WRAPPER_NARROW_CLASS}`}>
      <nav aria-label="Breadcrumb">
        <Link
          href={ROUTES.IDEAS}
          className={BACK_LINK_CLASS}
          aria-label="Return to Ideas Hub"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Return to Ideas Hub
        </Link>
      </nav>

      {/* Proposal card */}
      <article
        className={IDEAS_CARD_ACCENT_CLASS}
        aria-labelledby="proposal-title"
      >
        <div className="flex min-h-0 min-w-0">
          <div className={IDEAS_CARD_ACCENT_BAR_CLASS} aria-hidden />
          <div className="min-w-0 flex-1 p-6 sm:p-8">
          {/* Title */}
          <h1 id="proposal-title" className={PAGE_TITLE_CLASS}>
            {idea.title}
          </h1>

          {/* Meta: category, date, author, views */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {idea.category?.name && (
              <Badge variant="secondary" className="font-normal rounded-md">
                {idea.category.name}
              </Badge>
            )}
            {idea.isAnonymous && (
              <Badge variant="outline" className="font-normal italic rounded-md">
                Anonymous author
              </Badge>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4 shrink-0" aria-hidden />
              Submitted {formatDate(idea.createdAt)}
            </span>
            {idea.author && (
              <span className="inline-flex items-center gap-1.5">
                <User className="size-4 shrink-0" aria-hidden />
                {authorLabel}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-4 shrink-0" aria-hidden />
              {viewCount} view{viewCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Description */}
          {idea.description && (
            <>
              <Separator className="my-6 bg-border/60" />
              <section aria-labelledby="description-label">
                <h2 id="description-label" className={IDEAS_SECTION_LABEL_CLASS}>
                  Description
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {idea.description}
                </p>
              </section>
            </>
          )}

          {/* Attachments */}
          {idea.attachments.length > 0 && (
            <>
              <Separator className="my-6 bg-border/60" />
              <section aria-labelledby="attachments-label">
                <h2
                  id="attachments-label"
                  className={`flex items-center gap-2 ${IDEAS_SECTION_LABEL_CLASS}`}
                >
                  <Paperclip className="size-3.5 shrink-0" aria-hidden />
                  Attachments ({idea.attachments.length})
                </h2>
                <ul className="mt-3 space-y-2">
                  {idea.attachments.map((att) => (
                    <AttachmentItem key={att.id} att={att} />
                  ))}
                </ul>
              </section>
            </>
          )}
          </div>
        </div>
      </article>

      {/* Vote */}
      <section
        className={`${CARD_CLASS} p-6 sm:p-8`}
        aria-labelledby="vote-heading"
      >
        <h2 id="vote-heading" className={SECTION_CARD_TITLE_CLASS}>
          Vote
        </h2>
        <p className={`mt-2 ${SECTION_CARD_DESCRIPTION_CLASS}`}>
          One vote per proposal is permitted. Voting and discussion close at the end of the feedback period
          {feedbackEndsAt && (
            <> ({formatDate(feedbackEndsAt)})</>
          )}.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            variant={myVote === "up" ? "default" : "outline"}
            size="sm"
            className={IDEAS_BUTTON_CLASS}
            disabled={!feedbackOpen || voteMutation.isPending}
            onClick={() => handleVote("up")}
            aria-label="Vote in favor"
          >
            <ThumbsUp className="size-4 shrink-0" aria-hidden />
            In favor {voteCounts.up > 0 ? `(${voteCounts.up})` : ""}
          </Button>
          <Button
            variant={myVote === "down" ? "secondary" : "outline"}
            size="sm"
            className={IDEAS_BUTTON_CLASS}
            disabled={!feedbackOpen || voteMutation.isPending}
            onClick={() => handleVote("down")}
            aria-label="Vote against"
          >
            <ThumbsDown className="size-4 shrink-0" aria-hidden />
            Against {voteCounts.down > 0 ? `(${voteCounts.down})` : ""}
          </Button>
        </div>
      </section>

      {/* Discussion */}
      <section
        className={`${CARD_CLASS} p-6 sm:p-8`}
        aria-labelledby="discussion-heading"
      >
        <h2
          id="discussion-heading"
          className={`flex items-center gap-2 ${SECTION_CARD_TITLE_CLASS}`}
        >
          <MessageSquare className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          Discussion
        </h2>
        <p className={`mt-2 ${SECTION_CARD_DESCRIPTION_CLASS}`}>
          Comments may be submitted for clarification or constructive feedback. Anonymous submission is permitted. Discussion closes at the end of the feedback period.
        </p>

        {feedbackOpen && (
          <form onSubmit={handleSubmitComment} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="comment-content" className="sr-only">
                Your comment
              </Label>
              <Textarea
                id="comment-content"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Enter your comment for clarification or constructive feedback."
                rows={3}
                className="resize-none rounded-lg border-border"
                maxLength={2000}
              />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={commentAnonymous}
                  onCheckedChange={(v) => setCommentAnonymous(v === true)}
                  aria-label="Submit comment anonymously"
                  className="rounded border-border"
                />
                <span>Submit comment anonymously</span>
              </label>
              <Button
                type="submit"
                size="sm"
                className={IDEAS_BUTTON_CLASS}
                disabled={!commentContent.trim() || createCommentMutation.isPending}
              >
                {createCommentMutation.isPending ? "Submitting…" : "Submit comment"}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6">
          {commentsStatus === "pending" && (
            <p className="text-sm text-muted-foreground">Loading discussion…</p>
          )}
          {commentsStatus === "success" && comments.length === 0 && (
            <p className="text-sm text-muted-foreground">No comments have been submitted yet.</p>
          )}
          {comments.length > 0 && (
            <ul className="space-y-4" role="list">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="flex gap-4 rounded-lg border border-border/80 bg-muted/20 px-4 py-3"
                >
                  <Avatar className="size-9 shrink-0 rounded-full border border-border/60 bg-muted">
                    <AvatarFallback className="text-xs font-medium text-muted-foreground">
                      {c.author
                        ? getAvatarInitial(
                            c.author.fullName ?? null,
                            c.author.email
                          )
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {c.author ? (
                        <span className="font-medium text-foreground">
                          {c.author.fullName?.trim() || c.author.email}
                        </span>
                      ) : (
                        <span className="italic">Anonymous</span>
                      )}
                      <span>{formatDateTime(c.createdAt)}</span>
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {c.content}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
