"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { MainCommentForm } from "./main-comment-form";
import { CommentItem } from "./comment-item";
import { countAllComments, commentRepliesContainId } from "./helpers";
import {
  IDEA_DISCUSSION_DIVIDER,
  IDEAS_HUB_CARD_PX,
  IDEA_DETAIL_COMMENTS_WRAP,
  IDEA_ARTICLE_SECTION_LABEL,
} from "@/config/design";
import type { IdeaComment } from "@/lib/schemas/ideas.schema";

interface IdeaDetailCommentsProps {
  ideaId: string;
  comments: IdeaComment[];
  commentsStatus: "pending" | "error" | "success";
  open: boolean;
  isReadOnly: boolean;
  commentContent: string;
  commentAnonymous: boolean;
  onCommentContentChange: (v: string) => void;
  onCommentAnonymousChange: (v: boolean) => void;
  onSubmitComment: (e: React.FormEvent) => void;
  createCommentMutationPending: boolean;
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
  targetedCommentId: string | null;
  createMutation: ReturnType<typeof import("@/hooks/use-ideas").useCreateCommentMutation>;
  updateMutation: ReturnType<typeof import("@/hooks/use-ideas").useUpdateCommentMutation>;
  deleteMutation: ReturnType<typeof import("@/hooks/use-ideas").useDeleteCommentMutation>;
  likeMutation: ReturnType<typeof import("@/hooks/use-ideas").useLikeCommentMutation>;
}

export function IdeaDetailComments({
  ideaId,
  comments,
  commentsStatus,
  open,
  isReadOnly,
  commentContent,
  commentAnonymous,
  onCommentContentChange,
  onCommentAnonymousChange,
  onSubmitComment,
  createCommentMutationPending,
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
  targetedCommentId,
  createMutation,
  updateMutation,
  deleteMutation,
  likeMutation,
}: IdeaDetailCommentsProps) {
  const commentsRef = useRef<HTMLElement>(null);

  return (
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
            onContentChange={onCommentContentChange}
            onAnonymousChange={onCommentAnonymousChange}
            onSubmit={onSubmitComment}
            isPending={createCommentMutationPending}
          />
        ) : null}
      </div>

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
                ideaId={ideaId}
                open={open && !isReadOnly}
                isReply={false}
                depth={1}
                isFirstReply={idx === 0}
                targetedCommentId={targetedCommentId}
                initialRepliesExpanded={targetedCommentId != null && commentRepliesContainId(c, targetedCommentId)}
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
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
