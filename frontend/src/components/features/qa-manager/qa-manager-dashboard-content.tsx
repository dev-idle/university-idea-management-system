"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SECTION_LABEL_CLASS,
  TYPO_STAT_SUBTLE,
  TYPO_STAT_BASE_SUBTLE,
} from "@/config/design";
import { UNIFIED_CARD_CLASS } from "../admin/constants";
import { useQaManagerStatsQuery } from "@/hooks/use-profile";
import { useIdeasContextQuery } from "@/hooks/use-ideas";
function fmtDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function QaManagerOverview() {
  const { data: stats } = useQaManagerStatsQuery();
  const { data: ideasContext } = useIdeasContextQuery({ enabled: true });

  const activeCycleName = ideasContext?.activeCycleName ?? null;
  const submissionClosesAt = ideasContext?.submissionClosesAt ?? null;
  const interactionClosesAt = ideasContext?.interactionClosesAt ?? null;
  const hasStats = stats !== null && stats !== undefined;

  return (
    <div className={`${UNIFIED_CARD_CLASS} px-6 py-6`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-6">
        <div className="min-w-0">
          <p className={SECTION_LABEL_CLASS}>Active proposal cycle</p>
          <p className={`mt-1.5 min-w-0 truncate ${TYPO_STAT_SUBTLE}`} title={activeCycleName ?? undefined}>
            {activeCycleName ?? "—"}
          </p>
        </div>
        <div className="min-w-0">
          <p className={SECTION_LABEL_CLASS}>Submission closes</p>
          <p className={`mt-1.5 ${TYPO_STAT_SUBTLE}`}>
            {submissionClosesAt ? fmtDate(submissionClosesAt) : "—"}
          </p>
        </div>
        <div className="min-w-0">
          <p className={SECTION_LABEL_CLASS}>Comments & votes close</p>
          <p className={`mt-1.5 ${TYPO_STAT_SUBTLE}`}>
            {interactionClosesAt ? fmtDate(interactionClosesAt) : "—"}
          </p>
        </div>
        <div className="min-w-0">
          <p className={SECTION_LABEL_CLASS}>Total ideas</p>
          <p className={`mt-1.5 ${TYPO_STAT_SUBTLE}`}>{hasStats ? stats.totalIdeas : "—"}</p>
        </div>
        <div className="min-w-0">
          <p className={SECTION_LABEL_CLASS}>Total departments</p>
          <p className={`mt-1.5 ${TYPO_STAT_SUBTLE}`}>
            {hasStats ? stats.participatingDepartments : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function QaManagerEngagement() {
  const { data: stats } = useQaManagerStatsQuery();
  const hasStats = stats !== null && stats !== undefined;

  const statCardClass =
    "rounded-xl border border-border/45 bg-muted/[0.02] px-6 py-4";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className={statCardClass}>
        <p className={SECTION_LABEL_CLASS}>Comments</p>
        <p className={`mt-1 ${TYPO_STAT_SUBTLE}`}>{hasStats ? stats.totalComments : "—"}</p>
      </div>
      <div className={statCardClass}>
        <p className={SECTION_LABEL_CLASS}>Views</p>
        <p className={cn("mt-1", TYPO_STAT_BASE_SUBTLE, "text-info")}>
          {hasStats ? stats.totalViews : "—"}
        </p>
      </div>
      <div className={statCardClass}>
        <p className={SECTION_LABEL_CLASS}>Upvotes</p>
        <p className={cn("mt-1 flex items-center gap-2", TYPO_STAT_BASE_SUBTLE, "text-success")}>
          <ThumbsUp className="size-[18px] shrink-0" aria-hidden />
          {hasStats ? stats.votesUp : "—"}
        </p>
      </div>
      <div className={statCardClass}>
        <p className={SECTION_LABEL_CLASS}>Downvotes</p>
        <p className={cn("mt-1 flex items-center gap-2", TYPO_STAT_BASE_SUBTLE, "text-destructive")}>
          <ThumbsDown className="size-[18px] shrink-0" aria-hidden />
          {hasStats ? stats.votesDown : "—"}
        </p>
      </div>
    </div>
  );
}

export function QaManagerDashboardContent() {
  return (
    <div className="space-y-7">
      <section aria-labelledby="qa-manager-overview-heading">
        <h2 id="qa-manager-overview-heading" className="sr-only">
          Overview
        </h2>
        <QaManagerOverview />
      </section>
      <section aria-labelledby="qa-manager-engagement-heading">
        <h2 id="qa-manager-engagement-heading" className={SECTION_LABEL_CLASS}>
          Engagement
        </h2>
        <div className="mt-2.5">
          <QaManagerEngagement />
        </div>
      </section>
    </div>
  );
}
