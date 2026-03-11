"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import type { Idea } from "@/lib/schemas/ideas.schema";
import type { IdeaComment } from "@/lib/schemas/ideas.schema";
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
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import { hasRole } from "@/lib/rbac";
import { ROUTES, buildPageTitle } from "@/config/constants";
import { getErrorMessage, ERROR_FALLBACK_FORM } from "@/lib/errors";
import { LoadingState } from "@/components/ui/loading-state";
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
import { ALERT_DIALOG_ERROR_CLASS } from "@/components/features/admin/constants";
import {
  PAGE_CONTAINER_CLASS,
  IDEAS_HUB_SPACING,
  IDEAS_HUB_ARTICLE_CLASS,
} from "@/config/design";
import {
  BREADCRUMB_GHOST_CLASS,
  BREADCRUMB_LINK_CLASS,
  BREADCRUMB_CURRENT_CLASS,
  BREADCRUMB_SEP_CLASS,
} from "@/components/features/admin/constants";
import { IdeaDetailHeader } from "./idea-detail-header";
import { IdeaDetailBody } from "./idea-detail-body";
import { IdeaDetailEngagement } from "./idea-detail-engagement";
import { IdeaDetailComments } from "./idea-detail-comments";
import { findCommentById } from "./helpers";

interface IdeaDetailContentProps {
  /** Server-fetched data for instant display (no loading state). */
  initialIdea?: Idea | null;
  initialComments?: IdeaComment[] | null;
}

export function IdeaDetailContent({ initialIdea, initialComments }: IdeaDetailContentProps = {}) {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isQaCoordinator = hasRole(user?.roles, "QA_COORDINATOR");
  const isQaManager = hasRole(user?.roles, "QA_MANAGER");
  const isReadOnly = isQaCoordinator || isQaManager;
  const id = typeof params.id === "string" ? params.id : null;

  const { data: idea, status, error } = useIdeaQuery(id, {
    initialData: initialIdea ?? undefined,
  });
  const { data: comments = [], status: commentsStatus } = useIdeaCommentsQuery(id, {
    initialData: initialComments ?? undefined,
  });
  const voteMutation = useVoteIdeaMutation();
  const createCommentMutation = useCreateCommentMutation();
  const updateCommentMutation = useUpdateCommentMutation();
  const deleteCommentMutation = useDeleteCommentMutation();
  const likeCommentMutation = useLikeCommentMutation();
  const { markViewedByAction } = useIdeaViewTracker(id, idea?.cycleStatus ?? null, isReadOnly);

  const [commentContent, setCommentContent] = useState("");
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyAnonymous, setReplyAnonymous] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [targetedCommentId, setTargetedCommentId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      const hub = isQaCoordinator ? ROUTES.QA_COORDINATOR_IDEAS : isQaManager ? ROUTES.QA_MANAGER_IDEAS : ROUTES.IDEAS;
      router.replace(hub);
    }
  }, [id, router, isQaCoordinator, isQaManager]);

  useEffect(() => {
    if (idea?.title) {
      document.title = buildPageTitle("Proposal");
    }
  }, [idea?.title]);

  useEffect(() => {
    if (!idea || typeof window === "undefined" || window.location.hash !== "#comments") return;
    const el = document.getElementById("comments");
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
        }, 3000);
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

  useEffect(() => {
    if (!targetedCommentId || comments.length === 0 || typeof window === "undefined") return;
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 25;

    const tryScroll = () => {
      if (cancelled) return;
      const el = document.getElementById(`comment-${targetedCommentId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (++attempts < maxAttempts) {
        setTimeout(tryScroll, 80);
      }
    };

    const initialDelay = setTimeout(tryScroll, 150);
    return () => {
      cancelled = true;
      clearTimeout(initialDelay);
    };
  }, [comments, targetedCommentId]);

  if (!id) return null;
  if (status === "error") {
    const msg = error?.message ?? "";
    if (msg.includes("404") || msg.includes("Idea not found")) {
      notFound();
    }
    throw error;
  }
  if (status === "pending" || !idea) {
    return (
      <div className={PAGE_CONTAINER_CLASS}>
        <LoadingState compact />
      </div>
    );
  }

  const myVote = idea.myVote ?? null;
  const interactionEndsAt = idea.interactionClosesAt ? new Date(idea.interactionClosesAt) : null;
  const cycleActive = idea.cycleStatus === "ACTIVE";
  const open =
    cycleActive && !!interactionEndsAt && new Date() < interactionEndsAt;

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

  const handleEditClick = (commentId: string) => {
    const found = findCommentById(comments, commentId);
    setEditingId(commentId);
    setEditContent(found?.content ?? "");
  };

  return (
    <div className={`${IDEAS_HUB_SPACING} ${PAGE_CONTAINER_CLASS}`}>
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
      <article className={IDEAS_HUB_ARTICLE_CLASS} aria-labelledby="proposal-title">
        <IdeaDetailHeader idea={idea} isQaManager={isQaManager} />
        <IdeaDetailBody idea={idea} />
        <IdeaDetailEngagement
          idea={idea}
          comments={comments}
          open={open}
          isReadOnly={isReadOnly}
          voteMutationPending={voteMutation.isPending}
          myVote={myVote}
          onVote={handleVote}
        />
        <IdeaDetailComments
          ideaId={id}
          comments={comments}
          commentsStatus={commentsStatus}
          open={open}
          isReadOnly={isReadOnly}
          commentContent={commentContent}
          commentAnonymous={commentAnonymous}
          onCommentContentChange={setCommentContent}
          onCommentAnonymousChange={setCommentAnonymous}
          onSubmitComment={handleComment}
          createCommentMutationPending={createCommentMutation.isPending}
          replyingToId={replyingToId}
          replyContent={replyContent}
          replyAnonymous={replyAnonymous}
          onReplyContentChange={setReplyContent}
          onReplyAnonymousChange={setReplyAnonymous}
          onSubmitReply={handleReply}
          onCancelReply={() => {
            setReplyingToId(null);
            setReplyContent("");
            setReplyAnonymous(false);
          }}
          onReplyClick={setReplyingToId}
          editingId={editingId}
          editContent={editContent}
          onEditContentChange={setEditContent}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={() => {
            setEditingId(null);
            setEditContent("");
          }}
          onEditClick={handleEditClick}
          onDeleteClick={setDeleteDialogId}
          onLike={(commentId, value) => likeCommentMutation.mutate({ ideaId: id, commentId, value })}
          targetedCommentId={targetedCommentId}
          createMutation={createCommentMutation}
          updateMutation={updateCommentMutation}
          deleteMutation={deleteCommentMutation}
          likeMutation={likeCommentMutation}
        />
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
