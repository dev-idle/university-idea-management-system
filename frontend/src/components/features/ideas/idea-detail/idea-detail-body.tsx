"use client";

import { Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  IDEA_ARTICLE_BODY_CLASS,
  IDEA_ARTICLE_TITLE_CLASS,
  IDEA_ARTICLE_DESC_CLASS,
  IDEA_ARTICLE_DIVIDER,
  IDEA_ARTICLE_SECTION_LABEL,
} from "@/config/design";
import { AttachmentItem } from "./attachment-item";
import type { Idea } from "@/lib/schemas/ideas.schema";

interface IdeaDetailBodyProps {
  idea: Idea;
}

export function IdeaDetailBody({ idea }: IdeaDetailBodyProps) {
  return (
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
  );
}
