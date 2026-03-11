"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchWithAuthResponse } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IDEA_ATTACHMENT_ITEM, IDEA_ATTACHMENT_NAME } from "@/config/design";

type Attachment = { id: string; fileName: string; secureUrl: string; mimeType?: string | null };

export function AttachmentItem({ att }: { att: Attachment }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleView = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetchWithAuthResponse(
        `ideas/attachments/${att.id}/view`,
      );
      const buffer = await res.arrayBuffer();
      const mimeType = res.headers.get("Content-Type")?.split(";")[0]?.trim()
        || att.mimeType
        || "application/octet-stream";
      const blob = new Blob([buffer], { type: mimeType });
      const url = URL.createObjectURL(blob);
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
        aria-label={loading ? "Opening…" : `View ${att.fileName}`}
      >
        <ExternalLink className="size-3.5 shrink-0" aria-hidden />
        {loading ? "Opening…" : "View"}
      </Button>
      {error && (
        <p className="mt-1.5 basis-full text-xs leading-relaxed text-destructive/90" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}
