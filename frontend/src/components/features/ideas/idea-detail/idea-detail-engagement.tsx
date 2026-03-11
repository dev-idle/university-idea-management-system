"use client";

import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, MessageSquare, Eye } from "lucide-react";
import { countAllComments } from "./helpers";
import {
  IDEAS_HUB_ENGAGEMENT_BORDER,
  IDEAS_HUB_CARD_PX,
  IDEAS_HUB_ACTION_BASE,
  IDEAS_HUB_ACTION_INACTIVE,
  IDEAS_HUB_ACTION_UP,
  IDEAS_HUB_ACTION_DOWN,
  IDEAS_HUB_ACTION_READONLY,
  IDEAS_HUB_COUNT,
} from "@/config/design";
import type { Idea } from "@/lib/schemas/ideas.schema";
import type { IdeaComment } from "@/lib/schemas/ideas.schema";

interface IdeaDetailEngagementProps {
  idea: Idea;
  comments: IdeaComment[];
  open: boolean;
  isReadOnly: boolean;
  voteMutationPending: boolean;
  myVote: "up" | "down" | null;
  onVote: (v: "up" | "down") => void;
}

export function IdeaDetailEngagement({
  idea,
  comments,
  open,
  isReadOnly,
  voteMutationPending,
  myVote,
  onVote,
}: IdeaDetailEngagementProps) {
  const votes = idea.voteCounts ?? { up: 0, down: 0 };
  const views = idea.viewCount ?? 0;
  const commentCount = countAllComments(comments);

  return (
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
            className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_ACTION_READONLY, "inline-flex items-center")}
            aria-label={`Support (${votes.up})`}
          >
            <ThumbsUp className="size-3.5 shrink-0" aria-hidden />
            <span className="leading-none">{votes.up}</span>
          </span>
          <span className="h-4 w-px shrink-0 bg-border/35" aria-hidden />
          <span
            className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_ACTION_READONLY, "inline-flex items-center")}
            aria-label={`Do not support (${votes.down})`}
          >
            <ThumbsDown className="size-3.5 shrink-0" aria-hidden />
            <span className="leading-none">{votes.down}</span>
          </span>
        </>
      ) : (
        <>
          <button
            type="button"
            disabled={!open || voteMutationPending}
            onClick={() => onVote("up")}
            className={cn(
              IDEAS_HUB_ACTION_BASE,
              "cursor-pointer",
              myVote === "up" ? IDEAS_HUB_ACTION_UP : IDEAS_HUB_ACTION_INACTIVE,
              (!open || voteMutationPending) && "pointer-events-none opacity-50",
            )}
            aria-label={`Support (${votes.up})`}
          >
            <ThumbsUp className="size-3.5 shrink-0" aria-hidden />
            <span className="leading-none">{votes.up}</span>
          </button>
          <span className="h-4 w-px shrink-0 bg-border/35" aria-hidden />
          <button
            type="button"
            disabled={!open || voteMutationPending}
            onClick={() => onVote("down")}
            className={cn(
              IDEAS_HUB_ACTION_BASE,
              "cursor-pointer",
              myVote === "down" ? IDEAS_HUB_ACTION_DOWN : IDEAS_HUB_ACTION_INACTIVE,
              (!open || voteMutationPending) && "pointer-events-none opacity-50",
            )}
            aria-label={`Do not support (${votes.down})`}
          >
            <ThumbsDown className="size-3.5 shrink-0" aria-hidden />
            <span className="leading-none">{votes.down}</span>
          </button>
        </>
      )}
      <span className="h-4 w-px shrink-0 bg-border/35" aria-hidden />
      {isReadOnly || !open ? (
        <span
          className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_ACTION_READONLY, "inline-flex items-center")}
          aria-label={`Comments (${commentCount})`}
        >
          <MessageSquare className="size-3.5 shrink-0" aria-hidden />
          <span className="leading-none">{commentCount}</span>
        </span>
      ) : (
        <a
          href="#comments"
          className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_ACTION_INACTIVE, "cursor-pointer no-underline")}
          aria-label={`Comments (${commentCount})`}
        >
          <MessageSquare className="size-3.5 shrink-0" aria-hidden />
          <span className="leading-none">{commentCount}</span>
        </a>
      )}
      <div className="min-w-0 flex-1" aria-hidden />
      <span
        className={cn(IDEAS_HUB_ACTION_BASE, IDEAS_HUB_COUNT, "cursor-default inline-flex items-center")}
        aria-label={`Views (${views})`}
      >
        <Eye className="size-3.5 shrink-0" aria-hidden />
        <span className="leading-none">{views}</span>
      </span>
    </div>
  );
}
