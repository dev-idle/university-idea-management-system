"use client";

import { useEffect, useState, useRef } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Reply,
  Pencil,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { getCommentDisplayInfo, cn, timeAgo, timeAgoShort } from "@/lib/utils";
import {
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
} from "@/hooks/use-ideas";
import type { IdeaComment } from "@/lib/schemas/ideas.schema";
import { countAllComments, commentRepliesContainId } from "./helpers";
import {
  IDEA_DETAIL_COMMENT_AVATAR,
  IDEA_DETAIL_INPUT,
  IDEA_DETAIL_FORM_FOOTER,
  IDEA_DETAIL_ANONYMOUS_LABEL,
  IDEA_DETAIL_SEND_BTN,
  IDEA_DETAIL_THREAD_LINE,
  IDEA_DETAIL_COMMENT_ROW_ROOT,
  IDEA_DETAIL_COMMENT_ROW_ROOT_NOT_FIRST,
  IDEA_DETAIL_COMMENT_ROW_REPLY,
  IDEA_DETAIL_COMMENT_ROW_REPLY_NOT_FIRST,
  IDEA_DETAIL_COMMENT_BUBBLE,
  IDEA_DETAIL_COMMENT_HEADER_ROW,
  IDEA_DETAIL_COMMENT_AUTHOR,
  IDEA_DETAIL_COMMENT_META_SEP,
  IDEA_DETAIL_COMMENT_META,
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
  IDEA_DETAIL_VIEW_REPLIES,
  IDEA_DETAIL_REPLY_FORM,
  IDEAS_ACTIONS_TRIGGER,
  IDEAS_ACTIONS_MENU,
  IDEAS_ACTIONS_ITEM,
  IDEAS_ACTIONS_ITEM_DESTRUCTIVE,
} from "@/config/design";

export interface CommentItemProps {
  comment: IdeaComment;
  ideaId: string;
  open: boolean;
  isReply: boolean;
  depth: number;
  isFirstReply?: boolean;
  parentDisplayName?: string;
  parentCommentId?: string;
  targetedCommentId: string | null;
  initialRepliesExpanded?: boolean;
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
}

export function CommentItem({
  comment,
  ideaId,
  open,
  isReply,
  depth,
  isFirstReply = true,
  parentDisplayName,
  parentCommentId,
  targetedCommentId,
  initialRepliesExpanded = false,
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
}: CommentItemProps) {
  const isMobile = useIsMobile();
  const { displayName, avatarInitial } = getCommentDisplayInfo(comment);
  const isReplying = replyingToId === comment.id;
  const isEditing = editingId === comment.id;
  const replyCount = countAllComments(comment.replies ?? []);
  const shouldCollapseReplies = replyCount > 0;
  const [repliesExpanded, setRepliesExpanded] = useState(initialRepliesExpanded);
  const replyFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialRepliesExpanded) {
      queueMicrotask(() => setRepliesExpanded(true));
    }
  }, [initialRepliesExpanded]);

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
            <AvatarFallback className="bg-muted/50 text-[13px] font-medium text-muted-foreground/80">
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
                    {isMobile ? (
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <span className={cn(IDEA_DETAIL_COMMENT_AUTHOR, displayName === "Anonymous" && "italic text-muted-foreground/80")}>
                            {displayName}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top">{displayName}</TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className={cn(IDEA_DETAIL_COMMENT_AUTHOR, displayName === "Anonymous" && "italic text-muted-foreground/80")}>
                        {displayName}
                      </span>
                    )}
                    <span className={cn(IDEA_DETAIL_COMMENT_META_SEP, "hidden sm:inline")} aria-hidden>·</span>
                    <time className={IDEA_DETAIL_COMMENT_META} dateTime={new Date(comment.createdAt).toISOString()}>
                      <span className="sm:hidden">{timeAgoShort(comment.createdAt)}</span>
                      <span className="hidden sm:inline">{timeAgo(comment.createdAt)}</span>
                    </time>
                    {comment.updatedAt &&
                      new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 2000 && (
                      <>
                        <span className={cn(IDEA_DETAIL_COMMENT_META_SEP, "hidden sm:inline")} aria-hidden>·</span>
                        <span className={cn(IDEA_DETAIL_EDITED_LABEL, "shrink-0")}>
                          <span className="sm:hidden">(ed)</span>
                          <span className="hidden sm:inline">edited</span>
                        </span>
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
                    aria-label={(comment.likeCount ?? 0) > 0 ? `${comment.likeCount} like` : "Like"}
                    className={cn(
                      IDEA_DETAIL_COMMENT_ACTION_BASE,
                      "cursor-pointer",
                      comment.myReaction === "up" ? IDEA_DETAIL_COMMENT_LIKE_ACTIVE : IDEA_DETAIL_COMMENT_LIKE_INACTIVE,
                      "disabled:cursor-default disabled:opacity-70",
                    )}
                  >
                    <ThumbsUp className="size-3.5 shrink-0" aria-hidden />
                    {(comment.likeCount ?? 0) > 0 && <span>{comment.likeCount}</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => onLike(comment.id, "down")}
                    disabled={likeMutation.isPending}
                    aria-label={(comment.dislikeCount ?? 0) > 0 ? `${comment.dislikeCount} dislike` : "Dislike"}
                    className={cn(
                      IDEA_DETAIL_COMMENT_ACTION_BASE,
                      "cursor-pointer",
                      comment.myReaction === "down" ? IDEA_DETAIL_COMMENT_DISLIKE_ACTIVE : IDEA_DETAIL_COMMENT_DISLIKE_INACTIVE,
                      "disabled:cursor-default disabled:opacity-70",
                    )}
                  >
                    <ThumbsDown className="size-3.5 shrink-0" aria-hidden />
                    {(comment.dislikeCount ?? 0) > 0 && <span>{comment.dislikeCount}</span>}
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
                initialRepliesExpanded={targetedCommentId != null && commentRepliesContainId(r, targetedCommentId)}
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
