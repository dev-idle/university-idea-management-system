"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useIdeaQuery,
  useIdeaCommentsQuery,
  useVoteIdeaMutation,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
} from "@/hooks/use-ideas";
import { useIdeaViewTracker } from "@/hooks/use-idea-view-tracker";
import { useProfileQuery } from "@/hooks/use-profile";
import { useAuthStore } from "@/stores/auth.store";
import { hasRole } from "@/lib/rbac";
import { ROUTES, buildPageTitle } from "@/config/constants";
import { fetchWithAuthResponse } from "@/lib/api/client";
import type { IdeaComment } from "@/lib/schemas/ideas.schema";
import { getAvatarInitial, getCommentDisplayInfo, cn, timeAgo } from "@/lib/utils";
import { getErrorMessage, ERROR_FALLBACK_FORM } from "@/lib/errors";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingState } from "@/components/ui/loading-state";
import {
  PAGE_CONTAINER_CLASS,
  IDEAS_HUB_SPACING,
  IDEAS_HUB_ENGAGEMENT_BORDER,
  IDEAS_HUB_ACTION_BASE,
  IDEAS_HUB_ACTION_INACTIVE,
  IDEAS_HUB_ACTION_UP,
  IDEAS_HUB_ACTION_DOWN,
  IDEAS_HUB_ACTION_READONLY,
  IDEAS_HUB_COUNT,
  IDEAS_HUB_ARTICLE_CLASS,
  IDEAS_HUB_CARD_PX,
  IDEAS_HUB_AVATAR,
  IDEAS_HUB_AUTHOR,
  IDEA_ARTICLE_BODY_CLASS,
  IDEA_ARTICLE_TITLE_CLASS,
  IDEA_ARTICLE_DESC_CLASS,
  IDEA_ARTICLE_DIVIDER,
  IDEA_DISCUSSION_DIVIDER,
  IDEA_ARTICLE_SECTION_LABEL,
  IDEA_ATTACHMENT_ITEM,
  IDEA_ATTACHMENT_NAME,
  IDEA_DETAIL_COMMENTS_WRAP,
  IDEA_DETAIL_INPUT,
  IDEA_DETAIL_SEND_BTN,
  IDEA_DETAIL_ANONYMOUS_LABEL,
  IDEA_DETAIL_COMMENT_FORM,
  IDEA_DETAIL_COMMENT_AS_ROW,
  IDEA_DETAIL_COMMENT_FORM_BODY,
  IDEA_DETAIL_FORM_FOOTER,
  IDEA_DETAIL_CATEGORY_PILL,
  BYLINE_META_SEP,
  IDEA_DETAIL_REPLY_FORM,
  IDEA_DETAIL_COMMENT_ROW_ROOT,
  IDEA_DETAIL_COMMENT_ROW_ROOT_NOT_FIRST,
  IDEA_DETAIL_COMMENT_ROW_REPLY,
  IDEA_DETAIL_COMMENT_ROW_REPLY_NOT_FIRST,
  IDEA_DETAIL_COMMENT_AVATAR,
  IDEA_DETAIL_COMMENT_BUBBLE,
  IDEA_DETAIL_COMMENT_HEADER_ROW,
  IDEA_DETAIL_COMMENT_AUTHOR,
  IDEA_DETAIL_COMMENT_META,
  IDEA_DETAIL_COMMENT_META_SEP,
  IDEA_DETAIL_EDITED_LABEL,
  IDEA_DETAIL_COMMENT_BODY,
  IDEA_DETAIL_COMMENT_ACTIONS_ROW,
  IDEA_DETAIL_COMMENT_ACTION_BASE,
  IDEA_DETAIL_COMMENT_LIKE_INACTIVE,
  IDEA_DETAIL_COMMENT_LIKE_ACTIVE,
  IDEA_DETAIL_COMMENT_DISLIKE_INACTIVE,
  IDEA_DETAIL_COMMENT_DISLIKE_ACTIVE,
  IDEA_DETAIL_COMMENT_REPLY,
  IDEA_DETAIL_REPLIES_SPACING,
  IDEA_DETAIL_REPLIES_SPACING_FLAT,
  IDEA_DETAIL_COMMENT_HIGHLIGHT,
  IDEA_DETAIL_THREAD_LINE,
  IDEA_DETAIL_VIEW_REPLIES,
  IDEAS_ACTIONS_TRIGGER,
  IDEAS_ACTIONS_MENU,
  IDEAS_ACTIONS_ITEM,
  IDEAS_ACTIONS_ITEM_DESTRUCTIVE,
  IDEAS_MY_STATUS_VOTING,
  IDEAS_MY_STATUS_CLOSED,
} from "@/config/design";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BREADCRUMB_GHOST_CLASS,
  BREADCRUMB_LINK_CLASS,
  BREADCRUMB_CURRENT_CLASS,
  BREADCRUMB_SEP_CLASS,
  ALERT_DIALOG_ERROR_CLASS,
} from "@/components/features/admin/constants";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Reply,
  FileText,
  Paperclip,
  ExternalLink,
  Eye,
  Clock,
  Tag,
  MoreVertical,
  Pencil,
  Trash2,
  Activity,
  Lock,
} from "lucide-react";
import { IdeaActionsMenu } from "@/components/features/qa-manager/idea-actions-menu";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function countAllComments(comments: IdeaComment[]): number {
  return comments.reduce(
    (acc, c) => acc + 1 + countAllComments(c.replies ?? []),
    0,
  );
}

function findCommentById(comments: IdeaComment[], id: string): IdeaComment | undefined {
  for (const c of comments) {
    if (c.id === id) return c;
    const found = findCommentById(c.replies ?? [], id);
    if (found) return found;
  }
  return undefined;
}

/* ─── Main comment form ("Commenting as" + input + Anonymous) ───────────────── */

function MainCommentForm({
  commentContent,
  commentAnonymous,
  onContentChange,
  onAnonymousChange,
  onSubmit,
  isPending,
}: {
  commentContent: string;
  commentAnonymous: boolean;
  onContentChange: (v: string) => void;
  onAnonymousChange: (v: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const { data: profile } = useProfileQuery();
  const displayName = commentAnonymous ? "Anonymous" : (profile?.fullName?.trim() || profile?.email || "You");
  const avatarInitial = commentAnonymous ? "?" : getAvatarInitial(profile?.fullName ?? null, profile?.email ?? "");

  return (
    <form ref={formRef} onSubmit={onSubmit} className={IDEA_DETAIL_COMMENT_FORM}>
      <div className={IDEA_DETAIL_COMMENT_AS_ROW}>
        <span className="text-muted-foreground/60">Commenting as</span>
        <div className="flex items-center gap-2">
          <Avatar className={IDEA_DETAIL_COMMENT_AVATAR}>
            <AvatarFallback className="bg-muted/40 text-[11px] font-medium text-muted-foreground/70">
              {avatarInitial}
            </AvatarFallback>
          </Avatar>
          <span className={cn("truncate font-medium text-foreground/80", commentAnonymous && "italic text-muted-foreground")}>
            {displayName}
          </span>
        </div>
      </div>
      <div className={IDEA_DETAIL_COMMENT_FORM_BODY}>
        <Textarea
          id="comment-content"
          value={commentContent}
          onChange={(e) => onContentChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (commentContent.trim()) formRef.current?.requestSubmit();
            }
          }}
          placeholder="Add a comment…"
          rows={3}
          className={IDEA_DETAIL_INPUT}
          maxLength={2000}
        />
        <div className={IDEA_DETAIL_FORM_FOOTER}>
          <label className={IDEA_DETAIL_ANONYMOUS_LABEL}>
            <Checkbox
              checked={commentAnonymous}
              onCheckedChange={(v) => onAnonymousChange(v === true)}
              aria-label="Post anonymously"
              className="size-3.5 rounded border-border/40"
            />
            Anonymous
          </label>
          <button
            type="submit"
            disabled={!commentContent.trim() || isPending}
            className={IDEA_DETAIL_SEND_BTN}
            aria-label="Post"
          >
            {isPending ? (
              <span className="size-3 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" aria-hidden />
            ) : (
              "Post"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ─── Attachment ──────────────────────────────────────────────────────────── */

type Attachment = { id: string; fileName: string; secureUrl: string };

function AttachmentItem({ att }: { att: Attachment }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleView = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetchWithAuthResponse(
        `ideas/attachments/${att.id}/view`,
      );
      const url = URL.createObjectURL(await res.blob());
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not open the file.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <li className={IDEA_ATTACHMENT_ITEM}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/[0.06] text-muted-foreground/50">
          <FileText className="size-4 shrink-0" aria-hidden />
        </div>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <span className={cn(IDEA_ATTACHMENT_NAME, "cursor-default")}>{att.fileName}</span>
          </TooltipTrigger>
          <TooltipContent side="top">{att.fileName}</TooltipContent>
        </Tooltip>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 shrink-0 gap-1.5 rounded-md px-2.5 text-[11px] font-medium text-muted-foreground/55 hover:bg-muted/[0.05] hover:text-foreground/80"
        onClick={handleView}
        disabled={loading}
        aria-label={loading ? "Opening…" : `Read ${att.fileName}`}
      >
        <ExternalLink className="size-3.5 shrink-0" aria-hidden />
        {loading ? "Opening…" : "Read"}
      </Button>
      {error && (
        <p className="mt-1.5 basis-full text-xs leading-relaxed text-destructive/90" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}

/* ─── Comment Item (YouTube-style: like, reply, Edit/Delete for own) ───────── */

function CommentItem({
  comment,
  ideaId,
  open,
  isReply,
  depth,
  isFirstReply = true,
  parentDisplayName,
  parentCommentId,
  targetedCommentId,
  replyingToId,
  replyContent,
  replyAnonymous,
  onReplyContentChange,
  onReplyAnonymousChange,
  onSubmitReply,
  onCancelReply,
  onReplyClick,
  editingId,
  editContent,
  onEditContentChange,
  onSaveEdit,
  onCancelEdit,
  onEditClick,
  onDeleteClick,
  onLike,
  createMutation,
  updateMutation,
  deleteMutation,
  likeMutation,
}: {
  comment: IdeaComment;
  ideaId: string;
  open: boolean;
  isReply: boolean;
  depth: number;
  isFirstReply?: boolean;
  parentDisplayName?: string;
  parentCommentId?: string;
  targetedCommentId: string | null;
  replyingToId: string | null;
  replyContent: string;
  replyAnonymous: boolean;
  onReplyContentChange: (v: string) => void;
  onReplyAnonymousChange: (v: boolean) => void;
  onSubmitReply: (parentId: string, content: string, isAnonymous: boolean) => void;
  onCancelReply: () => void;
  onReplyClick: (parentId: string) => void;
  editingId: string | null;
  editContent: string;
  onEditContentChange: (v: string) => void;
  onSaveEdit: (commentId: string, content: string) => void;
  onCancelEdit: () => void;
  onEditClick: (commentId: string) => void;
  onDeleteClick: (commentId: string) => void;
  onLike: (commentId: string, value: "up" | "down") => void;
  createMutation: ReturnType<typeof useCreateCommentMutation>;
  updateMutation: ReturnType<typeof useUpdateCommentMutation>;
  deleteMutation: ReturnType<typeof useDeleteCommentMutation>;
  likeMutation: ReturnType<typeof useLikeCommentMutation>;
}) {
  const { displayName, avatarInitial } = getCommentDisplayInfo(comment);
  const isReplying = replyingToId === comment.id;
  const isEditing = editingId === comment.id;
  const replyCount = countAllComments(comment.replies ?? []);
  const shouldCollapseReplies = replyCount > 0;
  const [repliesExpanded, setRepliesExpanded] = useState(false);
  const replyFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isReplying || !open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const el = replyFormRef.current;
      if (el && !el.contains(e.target as Node)) onCancelReply();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isReplying, open, onCancelReply]);

  const rowClass =
    depth === 1
      ? (isFirstReply !== false ? IDEA_DETAIL_COMMENT_ROW_ROOT : IDEA_DETAIL_COMMENT_ROW_ROOT_NOT_FIRST)
      : isFirstReply
        ? IDEA_DETAIL_COMMENT_ROW_REPLY
        : IDEA_DETAIL_COMMENT_ROW_REPLY_NOT_FIRST;
  void isReply; // kept for API

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-3 overflow-visible",
        replyCount > 0 && depth === 1 && "relative",
      )}
    >
      {replyCount > 0 && depth === 1 && <div className={IDEA_DETAIL_THREAD_LINE} aria-hidden />}
      <div className={rowClass}>
        <div className="flex shrink-0 flex-col items-center">
          <Avatar className={IDEA_DETAIL_COMMENT_AVATAR}>
            <AvatarFallback className="bg-muted/50 text-[11px] text-muted-foreground/80">
              {avatarInitial}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          {isEditing ? (
            <div className="w-full min-w-0 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => onEditContentChange(e.target.value)}
                rows={3}
                className={IDEA_DETAIL_INPUT}
                maxLength={2000}
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button size="sm" variant="ghost" className="h-8 rounded-lg px-3 text-[13px] text-muted-foreground/70" onClick={onCancelEdit}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-8 rounded-lg px-4 text-[13px]"
                  onClick={() => onSaveEdit(comment.id, editContent)}
                  disabled={!editContent.trim() || updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div
                id={`comment-${comment.id}`}
                className={cn(
                  IDEA_DETAIL_COMMENT_BUBBLE,
                  targetedCommentId === comment.id && IDEA_DETAIL_COMMENT_HIGHLIGHT,
                  "scroll-mt-20",
                )}
              >
                <div className="flex flex-nowrap items-center justify-between gap-2">
                  <div className={cn(IDEA_DETAIL_COMMENT_HEADER_ROW, "min-w-0 flex-1")}>
                    <span className={cn(IDEA_DETAIL_COMMENT_AUTHOR, displayName === "Anonymous" && "italic text-muted-foreground/80")}>
                      {displayName}
                    </span>
                    <span className={IDEA_DETAIL_COMMENT_META_SEP} aria-hidden>·</span>
                    <time className={IDEA_DETAIL_COMMENT_META}>{timeAgo(comment.createdAt)}</time>
                    {comment.updatedAt &&
                      new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 2000 && (
                      <>
                        <span className={IDEA_DETAIL_COMMENT_META_SEP} aria-hidden>·</span>
                        <span className={cn(IDEA_DETAIL_EDITED_LABEL, "shrink-0")}>edited</span>
                      </>
                    )}
                  </div>
                  {comment.isOwn && !isEditing && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={cn(IDEAS_ACTIONS_TRIGGER, "shrink-0")}
                          aria-label="Comment options"
                        >
                          <MoreVertical className="size-3.5" aria-hidden />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={4} className={IDEAS_ACTIONS_MENU}>
                        <DropdownMenuItem
                          onClick={() => onEditClick(comment.id)}
                          className={IDEAS_ACTIONS_ITEM}
                        >
                          <Pencil aria-hidden />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteClick(comment.id)}
                          className={IDEAS_ACTIONS_ITEM_DESTRUCTIVE}
                        >
                          <Trash2 aria-hidden />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className={IDEA_DETAIL_COMMENT_BODY}>
                  {parentDisplayName != null && depth !== 2 && (
                    <>
                      {parentCommentId ? (
                        <a href={`#comment-${parentCommentId}`} className="font-medium text-primary/85 hover:text-primary hover:underline">
                          @{parentDisplayName}
                        </a>
                      ) : (
                        <span className="font-medium text-muted-foreground/80">@{parentDisplayName}</span>
                      )}
                      {" "}
                    </>
                  )}
                  <span className="whitespace-pre-wrap">{comment.content}</span>
                </div>
              </div>
              {open && (
                <div className={IDEA_DETAIL_COMMENT_ACTIONS_ROW}>
                  <button
                    type="button"
                    onClick={() => onLike(comment.id, "up")}
                    disabled={likeMutation.isPending}
                    aria-label={comment.likeCount > 0 ? `${comment.likeCount} like` : "Like"}
                    className={cn(
                      IDEA_DETAIL_COMMENT_ACTION_BASE,
                      "cursor-pointer",
                      comment.myReaction === "up" ? IDEA_DETAIL_COMMENT_LIKE_ACTIVE : IDEA_DETAIL_COMMENT_LIKE_INACTIVE,
                      "disabled:cursor-default disabled:opacity-70",
                    )}
                  >
                    <ThumbsUp className="size-3.5 shrink-0" aria-hidden />
                    {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => onLike(comment.id, "down")}
                    disabled={likeMutation.isPending}
                    aria-label={comment.dislikeCount > 0 ? `${comment.dislikeCount} dislike` : "Dislike"}
                    className={cn(
                      IDEA_DETAIL_COMMENT_ACTION_BASE,
                      "cursor-pointer",
                      comment.myReaction === "down" ? IDEA_DETAIL_COMMENT_DISLIKE_ACTIVE : IDEA_DETAIL_COMMENT_DISLIKE_INACTIVE,
                      "disabled:cursor-default disabled:opacity-70",
                    )}
                  >
                    <ThumbsDown className="size-3.5 shrink-0" aria-hidden />
                    {comment.dislikeCount > 0 && <span>{comment.dislikeCount}</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => onReplyClick(comment.id)}
                    className={cn(IDEA_DETAIL_COMMENT_ACTION_BASE, IDEA_DETAIL_COMMENT_REPLY)}
                  >
                    <Reply className="size-3.5" aria-hidden />
                    Reply
                  </button>
                </div>
              )}
            </>
          )}
          {isReplying && open && (
            <div ref={replyFormRef} className="mt-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const t = replyContent.trim();
                  if (t) onSubmitReply(comment.id, t, replyAnonymous);
                }}
                className={IDEA_DETAIL_REPLY_FORM}
              >
                <Textarea
                  value={replyContent}
                  onChange={(e) => onReplyContentChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      const t = replyContent.trim();
                      if (t) onSubmitReply(comment.id, t, replyAnonymous);
                    }
                  }}
                  placeholder="Add a reply…"
                  rows={2}
                  className={IDEA_DETAIL_INPUT}
                  maxLength={2000}
                />
                <div className={IDEA_DETAIL_FORM_FOOTER}>
                  <label className={IDEA_DETAIL_ANONYMOUS_LABEL}>
                    <Checkbox
                      checked={replyAnonymous}
                      onCheckedChange={(v) => onReplyAnonymousChange(v === true)}
                      className="size-3.5 rounded border-border/40"
                    />
                    Anonymous
                  </label>
                  <button
                    type="submit"
                    disabled={!replyContent.trim() || createMutation.isPending}
                    className={IDEA_DETAIL_SEND_BTN}
                    aria-label="Post"
                  >
                    {createMutation.isPending ? (
                      <span className="size-3 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" aria-hidden />
                    ) : (
                      "Post"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      {replyCount > 0 && (
        <div className={depth === 1 ? IDEA_DETAIL_REPLIES_SPACING : IDEA_DETAIL_REPLIES_SPACING_FLAT}>
          {depth < 2 && shouldCollapseReplies && !repliesExpanded ? (
            <button
              type="button"
              onClick={() => setRepliesExpanded(true)}
              className={IDEA_DETAIL_VIEW_REPLIES}
              aria-expanded={false}
            >
              View {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </button>
          ) : (
            comment.replies!.map((r: IdeaComment, idx: number) => (
              <CommentItem
                key={r.id}
                comment={r}
                ideaId={ideaId}
                open={open}
                isReply
                depth={depth + 1}
                isFirstReply={idx === 0}
                parentDisplayName={getCommentDisplayInfo(comment).displayName}
                parentCommentId={comment.id}
                targetedCommentId={targetedCommentId}
                replyingToId={replyingToId}
                replyContent={replyContent}
                replyAnonymous={replyAnonymous}
                onReplyContentChange={onReplyContentChange}
                onReplyAnonymousChange={onReplyAnonymousChange}
                onSubmitReply={onSubmitReply}
                onCancelReply={onCancelReply}
                onReplyClick={onReplyClick}
                editingId={editingId}
                editContent={editContent}
                onEditContentChange={onEditContentChange}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
                onLike={onLike}
                createMutation={createMutation}
                updateMutation={updateMutation}
                deleteMutation={deleteMutation}
                likeMutation={likeMutation}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}


/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isQaCoordinator = hasRole(user?.roles, "QA_COORDINATOR");
  const isQaManager = hasRole(user?.roles, "QA_MANAGER");
  const isReadOnly = isQaCoordinator || isQaManager;
  const id = typeof params.id === "string" ? params.id : null;
  const { data: idea, status, error } = useIdeaQuery(id);
  const { data: comments = [], status: commentsStatus } =
    useIdeaCommentsQuery(id);
  const voteMutation = useVoteIdeaMutation();
  const createCommentMutation = useCreateCommentMutation();
  const updateCommentMutation = useUpdateCommentMutation();
  const deleteCommentMutation = useDeleteCommentMutation();
  const likeCommentMutation = useLikeCommentMutation();
  const { markViewedByAction } = useIdeaViewTracker(
    id,
    idea?.cycleStatus ?? null,
    isReadOnly,
  );

  const [commentContent, setCommentContent] = useState("");
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyAnonymous, setReplyAnonymous] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [targetedCommentId, setTargetedCommentId] = useState<string | null>(null);
  const commentsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!id) {
      const hub = isQaCoordinator ? ROUTES.QA_COORDINATOR_IDEAS : isQaManager ? ROUTES.QA_MANAGER_IDEAS : ROUTES.IDEAS;
      router.replace(hub);
    }
  }, [id, router, isQaCoordinator, isQaManager]);

  useEffect(() => {
    if (idea?.title) {
      document.title = buildPageTitle("Proposal");
      // No cleanup: next page sets its own title
    }
  }, [idea?.title]);

  useEffect(() => {
    if (!idea || typeof window === "undefined" || window.location.hash !== "#comments") return;
    const el = commentsRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(t);
  }, [idea]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const syncFromHash = () => {
      const hash = window.location.hash;
      const match = hash?.match(/^#comment-(.+)$/);
      if (match) {
        setTargetedCommentId(match[1] ?? null);
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
          setTargetedCommentId(null);
          timeoutId = null;
        }, 2000);
      } else {
        setTargetedCommentId(null);
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  if (!id) return null;
  if (status === "error") throw error;
  if (status === "pending" || !idea) {
    return (
      <div className={PAGE_CONTAINER_CLASS}>
        <LoadingState compact />
      </div>
    );
  }

  const votes = idea.voteCounts ?? { up: 0, down: 0 };
  const myVote = idea.myVote ?? null;
  const interactionEndsAt = idea.interactionClosesAt
    ? new Date(idea.interactionClosesAt)
    : null;
  const cycleActive = idea.cycleStatus === "ACTIVE";
  const open =
    cycleActive && !!interactionEndsAt && new Date() < interactionEndsAt;
  const submissionClosed =
    idea.submissionClosesAt != null && new Date() >= new Date(idea.submissionClosesAt);
  const views = idea.viewCount ?? 0;
  const authorLabel = idea.author
    ? idea.author.fullName?.trim() || idea.author.email
    : "Anonymous";
  const avatarInitial = idea.author
    ? getAvatarInitial(idea.author.fullName ?? null, idea.author.email)
    : "?";

  const handleVote = (v: "up" | "down") => {
    if (!open || voteMutation.isPending || isReadOnly) return;
    markViewedByAction(id, idea.cycleStatus);
    voteMutation.mutate({ ideaId: id, value: v });
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentContent.trim();
    if (!trimmed || !open || createCommentMutation.isPending || isReadOnly) return;
    markViewedByAction(id, idea.cycleStatus);
    createCommentMutation.mutate(
      { ideaId: id, body: { content: trimmed, isAnonymous: commentAnonymous } },
      {
        onSuccess: () => {
          setCommentContent("");
          setCommentAnonymous(false);
          setTargetedCommentId(null);
          if (typeof window !== "undefined" && window.location.hash) {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
          }
        },
      },
    );
  };

  const handleReply = (parentId: string, content: string, isAnonymous: boolean) => {
    if (!content.trim() || createCommentMutation.isPending) return;
    createCommentMutation.mutate(
      { ideaId: id, body: { content: content.trim(), isAnonymous, parentCommentId: parentId } },
      {
        onSuccess: () => {
          setReplyingToId(null);
          setReplyContent("");
          setReplyAnonymous(false);
          setTargetedCommentId(null);
          if (typeof window !== "undefined" && window.location.hash) {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
          }
        },
      },
    );
  };

  const handleSaveEdit = (commentId: string, content: string) => {
    if (!content.trim() || updateCommentMutation.isPending) return;
    updateCommentMutation.mutate(
      { ideaId: id, commentId, content: content.trim() },
      { onSuccess: () => { setEditingId(null); setEditContent(""); } },
    );
  };

  const handleDeleteConfirm = (commentId: string) => {
    deleteCommentMutation.mutate(
      { ideaId: id, commentId },
      { onSuccess: () => setDeleteDialogId(null) },
    );
  };

  return (
    <div className={cn(IDEAS_HUB_SPACING, PAGE_CONTAINER_CLASS)}>
      {/* Breadcrumb — Staff only; QA Coordinator/Manager have it in Nav */}
      {!isQaCoordinator && !isQaManager && (
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className={cn("flex flex-wrap items-center", BREADCRUMB_GHOST_CLASS)}>
            <li>
              <Link href={ROUTES.IDEAS} className={BREADCRUMB_LINK_CLASS}>
                Ideas Hub
              </Link>
            </li>
            <li className="flex items-center" aria-current="page">
              <span className={BREADCRUMB_SEP_CLASS} aria-hidden>/</span>
              <span className={BREADCRUMB_CURRENT_CLASS}>Proposal</span>
            </li>
          </ol>
        </nav>
      )}

      {/* ── Article + Discussion (single card, aligned with hub) ───────── */}
      <article
        className={IDEAS_HUB_ARTICLE_CLASS}
        aria-labelledby="proposal-title"
      >
        {/* Byline — avatar, author, meta (time + category pill) */}
        <div className={cn(IDEAS_HUB_CARD_PX, "flex items-start gap-3 pt-5 pb-4 sm:pt-6 sm:pb-5")}>
          <Avatar className={IDEAS_HUB_AVATAR}>
            <AvatarFallback className="bg-muted/50 text-[11px] font-semibold text-muted-foreground/70">
              {avatarInitial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <span className={cn("block truncate", IDEAS_HUB_AUTHOR, idea.isAnonymous && "italic")}>
              {idea.isAnonymous ? "Anonymous" : authorLabel}
            </span>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-0 gap-y-1 text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground/55">
                <Clock className="size-3 shrink-0 opacity-50" aria-hidden />
                <time dateTime={new Date(idea.createdAt).toISOString()}>{timeAgo(idea.createdAt)}</time>
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
            </div>
          </div>
          {submissionClosed && interactionEndsAt && (
            <span className={cn("shrink-0", open ? IDEAS_MY_STATUS_VOTING : IDEAS_MY_STATUS_CLOSED)}>
              {open ? (
                <>
                  <Activity className="size-3 shrink-0 opacity-70" aria-hidden />
                  Comment & Vote
                </>
              ) : (
                <>
                  <Lock className="size-3 shrink-0" aria-hidden />
                  Closed
                </>
              )}
            </span>
          )}
          {isQaManager && (
            <div className="shrink-0">
              <IdeaActionsMenu idea={{ id, isAnonymous: idea.isAnonymous ?? false }} />
            </div>
          )}
        </div>

        {/* Body — title, description, attachments */}
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
            <div className={cn("mt-6 pt-6", IDEA_ARTICLE_DIVIDER)}>
              <h2 className={cn(IDEA_ARTICLE_SECTION_LABEL, "flex items-center gap-2")}>
                <Paperclip className="size-3.5 shrink-0 opacity-60" aria-hidden />
                Attachments ({idea.attachments.length})
              </h2>
              <ul className="mt-3 space-y-2">
                {idea.attachments.map((att) => (
                  <AttachmentItem key={att.id} att={att} />
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Engagement bar — Like · Dislike · Comments · Views (4 icons, equal spacing) */}
        <div
          className={cn(
            IDEAS_HUB_ENGAGEMENT_BORDER,
            "flex flex-wrap items-center gap-x-1 gap-y-1",
            IDEAS_HUB_CARD_PX,
            "py-3 sm:py-3.5",
          )}
          role="toolbar"
          aria-label="Engagement"
        >
          {isReadOnly ? (
            <>
              <span
                className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_ACTION_READONLY, "inline-flex")}
                aria-label={`Support (${votes.up})`}
              >
                <ThumbsUp className="size-3.5 shrink-0" aria-hidden />
                <span>{votes.up}</span>
              </span>
              <span className="h-4 w-px shrink-0 bg-border/35" aria-hidden />
              <span
                className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_ACTION_READONLY, "inline-flex")}
                aria-label={`Do not support (${votes.down})`}
              >
                <ThumbsDown className="size-3.5 shrink-0" aria-hidden />
                <span>{votes.down}</span>
              </span>
            </>
          ) : (
            <>
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
                aria-label={`Support (${votes.up})`}
              >
                <ThumbsUp className="size-3.5 shrink-0" aria-hidden />
                <span>{votes.up}</span>
              </button>
              <span className="h-4 w-px shrink-0 bg-border/35" aria-hidden />
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
                aria-label={`Do not support (${votes.down})`}
              >
                <ThumbsDown className="size-3.5 shrink-0" aria-hidden />
                <span>{votes.down}</span>
              </button>
            </>
          )}
          <span className="h-4 w-px shrink-0 bg-border/35" aria-hidden />
          {isReadOnly ? (
            <span
              className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_ACTION_READONLY, "inline-flex")}
              aria-label={`Comments (${countAllComments(comments)})`}
            >
              <MessageSquare className="size-3.5 shrink-0" aria-hidden />
              <span>{countAllComments(comments)}</span>
            </span>
          ) : (
            <a
              href="#comments"
              className={cn(
                IDEAS_HUB_ACTION_BASE,
                "no-underline",
                open
                  ? cn(IDEAS_HUB_ACTION_INACTIVE, "cursor-pointer")
                  : "cursor-default text-muted-foreground/55 hover:bg-transparent hover:text-muted-foreground/55",
              )}
              aria-label={`Comments (${countAllComments(comments)})`}
            >
              <MessageSquare className="size-3.5 shrink-0" aria-hidden />
              <span>{countAllComments(comments)}</span>
            </a>
          )}
          <div className="min-w-0 flex-1" aria-hidden />
          <span
            className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_COUNT, "cursor-default")}
            aria-label={`Views (${views})`}
          >
            <Eye className="size-3.5 shrink-0" aria-hidden />
            <span>{views}</span>
          </span>
        </div>

        {/* Comments — id for anchor + smooth scroll. overflow-visible prevents nested bubbles from clipping. */}
        <section
          id="comments"
          ref={commentsRef}
          className={cn(IDEA_DISCUSSION_DIVIDER, "scroll-mt-6 overflow-visible")}
          aria-label="Comments"
        >
          <div className={cn(IDEAS_HUB_CARD_PX, "pt-5 pb-4 sm:pt-6 sm:pb-4")}>
            {open && !isReadOnly ? (
              <MainCommentForm
                commentContent={commentContent}
                commentAnonymous={commentAnonymous}
                onContentChange={setCommentContent}
                onAnonymousChange={setCommentAnonymous}
                onSubmit={handleComment}
                isPending={createCommentMutation.isPending}
              />
            ) : null}
          </div>

          {/* Comments list — Facebook-style */}
          <div className={cn(IDEAS_HUB_CARD_PX, IDEA_DETAIL_COMMENTS_WRAP)}>
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
              <div className="flex flex-col gap-3 overflow-visible min-w-0">
                <h3 className={cn(IDEA_ARTICLE_SECTION_LABEL, "pb-1")}>
                  Comments ({countAllComments(comments)})
                </h3>
                {comments.map((c, idx) => (
                  <CommentItem
                    key={c.id}
                      comment={c}
                      ideaId={id}
                      open={open && !isReadOnly}
                      isReply={false}
                      depth={1}
                      isFirstReply={idx === 0}
                      targetedCommentId={targetedCommentId}
                      replyingToId={replyingToId}
                      replyContent={replyContent}
                      replyAnonymous={replyAnonymous}
                      onReplyContentChange={setReplyContent}
                      onReplyAnonymousChange={setReplyAnonymous}
                      onSubmitReply={handleReply}
                      onCancelReply={() => { setReplyingToId(null); setReplyContent(""); setReplyAnonymous(false); }}
                      onReplyClick={setReplyingToId}
                      editingId={editingId}
                      editContent={editContent}
                      onEditContentChange={setEditContent}
                      onSaveEdit={handleSaveEdit}
                      onCancelEdit={() => { setEditingId(null); setEditContent(""); }}
                      onEditClick={(commentId) => {
                        const found = findCommentById(comments, commentId);
                        setEditingId(commentId);
                        setEditContent(found?.content ?? "");
                      }}
                      onDeleteClick={setDeleteDialogId}
                      onLike={(commentId, value) => likeCommentMutation.mutate({ ideaId: id, commentId, value })}
                      createMutation={createCommentMutation}
                      updateMutation={updateCommentMutation}
                      deleteMutation={deleteCommentMutation}
                      likeMutation={likeCommentMutation}
                    />
                ))}
              </div>
            )}
          </div>
        </section>
      </article>

      <AlertDialog
        open={!!deleteDialogId}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogId(null);
            deleteCommentMutation.reset();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This comment
              {" — "}
              Permanently removes the comment. This action cannot be undone.
              {deleteCommentMutation.isError && (
                <span className={ALERT_DIALOG_ERROR_CLASS}>
                  {getErrorMessage(deleteCommentMutation.error, ERROR_FALLBACK_FORM.delete)}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteDialogId && handleDeleteConfirm(deleteDialogId)}
              disabled={deleteCommentMutation.isPending}
            >
              {deleteCommentMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
