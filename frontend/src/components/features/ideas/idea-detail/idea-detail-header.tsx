"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Tag, Activity, Lock } from "lucide-react";
import { cn, timeAgo, getAvatarInitial } from "@/lib/utils";
import { hasIdeaActions } from "@/components/features/qa-manager/idea-actions-menu";
import { IdeaActionsMenu } from "@/components/features/qa-manager/idea-actions-menu";
import {
  IDEAS_HUB_CARD_PX,
  IDEAS_HUB_AVATAR,
  IDEAS_HUB_AUTHOR,
  IDEA_ARTICLE_BYLINE_META,
  BYLINE_META_SEP,
  IDEA_DETAIL_CATEGORY_PILL,
  IDEAS_MY_STATUS_VOTING,
  IDEAS_MY_STATUS_CLOSED,
} from "@/config/design";
import type { Idea } from "@/lib/schemas/ideas.schema";

interface IdeaDetailHeaderProps {
  idea: Idea;
  isQaManager: boolean;
}

export function IdeaDetailHeader({ idea, isQaManager }: IdeaDetailHeaderProps) {
  const submissionClosed =
    idea.submissionClosesAt != null && new Date() >= new Date(idea.submissionClosesAt);
  const interactionEndsAt = idea.interactionClosesAt ? new Date(idea.interactionClosesAt) : null;
  const open =
    idea.cycleStatus === "ACTIVE" &&
    !!interactionEndsAt &&
    new Date() < interactionEndsAt;
  const authorLabel = idea.author
    ? idea.author.fullName?.trim() || idea.author.email
    : "Anonymous";
  const avatarInitial = idea.author
    ? getAvatarInitial(idea.author.fullName ?? null, idea.author.email)
    : "?";

  return (
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
          <div className={IDEA_ARTICLE_BYLINE_META}>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3 shrink-0 opacity-50" aria-hidden />
              <time dateTime={new Date(idea.createdAt).toISOString()}>{timeAgo(idea.createdAt)}</time>
            </span>
            {idea.category?.name && (
              <>
                <span className={cn(BYLINE_META_SEP, "hidden sm:inline-flex")} aria-hidden />
                <span className={IDEA_DETAIL_CATEGORY_PILL}>
                  <Tag className="size-3 shrink-0 opacity-65" aria-hidden />
                  <span className="min-w-0 truncate" title={idea.category.name}>{idea.category.name}</span>
                </span>
              </>
            )}
          </div>
        </div>
        {submissionClosed && interactionEndsAt && !isQaManager && (
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
        {isQaManager && hasIdeaActions({ id: idea.id, isAnonymous: idea.isAnonymous ?? false, cycleStatus: idea.cycleStatus ?? null }) && (
          <div className="shrink-0">
            <IdeaActionsMenu idea={{ id: idea.id, isAnonymous: idea.isAnonymous ?? false, cycleStatus: idea.cycleStatus ?? null }} />
          </div>
        )}
      </div>
  );
}
