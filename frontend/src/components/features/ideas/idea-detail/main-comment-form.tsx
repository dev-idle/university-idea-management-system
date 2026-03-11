"use client";

import { useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useProfileQuery } from "@/hooks/use-profile";
import { getAvatarInitial } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  IDEA_DETAIL_COMMENT_FORM,
  IDEA_DETAIL_COMMENT_AS_ROW,
  IDEA_DETAIL_COMMENT_AVATAR,
  IDEA_DETAIL_COMMENT_FORM_BODY,
  IDEA_DETAIL_INPUT,
  IDEA_DETAIL_FORM_FOOTER,
  IDEA_DETAIL_ANONYMOUS_LABEL,
  IDEA_DETAIL_SEND_BTN,
} from "@/config/design";

interface MainCommentFormProps {
  commentContent: string;
  commentAnonymous: boolean;
  onContentChange: (v: string) => void;
  onAnonymousChange: (v: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export function MainCommentForm({
  commentContent,
  commentAnonymous,
  onContentChange,
  onAnonymousChange,
  onSubmit,
  isPending,
}: MainCommentFormProps) {
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
