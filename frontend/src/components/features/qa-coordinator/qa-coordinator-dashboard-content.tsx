"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  SECTION_LABEL_CLASS,
  TYPO_STAT_SUBTLE,
  TYPO_STAT_BASE_SUBTLE,
  TYPO_BODY_SM,
  CHART_COLOR_CATEGORICAL,
  CHART_COLOR_TEMPORAL,
  CHART_TOOLTIP_CLASS,
  CHART_TOOLTIP_LABEL_CLASS,
  TR_CHART_ENTRANCE,
} from "@/config/design";
import { UNIFIED_CARD_CLASS } from "../admin/constants";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  useDepartmentMembersQuery,
  useDepartmentStatsQuery,
  useDepartmentChartsQuery,
} from "@/hooks/use-profile";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/ui/loading-state";
import { useIdeasContextQuery } from "@/hooks/use-ideas";

function fmtDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function QaCoordinatorOverview() {
  const { data: ideasContext } = useIdeasContextQuery({ enabled: true });

  const activeCycleName = ideasContext?.activeCycleName ?? null;
  const submissionClosesAt = ideasContext?.submissionClosesAt ?? null;
  const interactionClosesAt = ideasContext?.interactionClosesAt ?? null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Card 1: Cycle dates */}
      <div className={`${UNIFIED_CARD_CLASS} px-6 py-6`}>
        <p className={cn(SECTION_LABEL_CLASS, "mb-4")}>Proposal cycle</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
          <div className="min-w-0">
            <p className={SECTION_LABEL_CLASS}>Active proposal cycle</p>
            {activeCycleName ? (
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <p className={`mt-1.5 min-w-0 truncate cursor-default ${TYPO_STAT_SUBTLE}`}>
                    {activeCycleName}
                  </p>
                </TooltipTrigger>
                <TooltipContent side="top">{activeCycleName}</TooltipContent>
              </Tooltip>
            ) : (
              <p className={`mt-1.5 ${TYPO_STAT_SUBTLE}`}>—</p>
            )}
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
        </div>
      </div>
      {/* Card 2: Department stats — ideas, members, participation rate */}
      <div className={`${UNIFIED_CARD_CLASS} px-6 py-6`}>
        <p className={cn(SECTION_LABEL_CLASS, "mb-4")}>Department</p>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="min-w-0">
              <p className={SECTION_LABEL_CLASS}>Total ideas</p>
              <p className={`mt-1.5 ${TYPO_STAT_SUBTLE}`}>
                <QaCoordinatorStatValue select="totalIdeas" />
              </p>
            </div>
            <div className="min-w-0">
              <p className={SECTION_LABEL_CLASS}>Department members</p>
              <p className={`mt-1.5 ${TYPO_STAT_SUBTLE}`}>
                <QaCoordinatorMemberCount />
              </p>
            </div>
          </div>
          <div className="min-w-0">
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <p className={`${SECTION_LABEL_CLASS} cursor-default`}>Participation Rate</p>
              </TooltipTrigger>
              <TooltipContent side="top">
                Stats for your department only — Staff who submitted at least 1 idea in this cycle
              </TooltipContent>
            </Tooltip>
            <p className={`mt-1 ${TYPO_BODY_SM}`}>
              <QaCoordinatorParticipationValue />
            </p>
            <QaCoordinatorParticipationProgress />
          </div>
        </div>
      </div>
    </div>
  );
}

function QaCoordinatorStatValue({ select }: { select: "totalIdeas" }) {
  const { data: stats } = useDepartmentStatsQuery();
  const hasStats = stats !== null && stats !== undefined;
  if (select === "totalIdeas") return <>{hasStats ? stats.totalIdeas : "—"}</>;
  return null;
}

function QaCoordinatorMemberCount() {
  const { data: departmentData } = useDepartmentMembersQuery();
  const memberCount = departmentData?.members?.length ?? null;
  return <>{memberCount !== null ? memberCount : "—"}</>;
}

function QaCoordinatorParticipationValue() {
  const { data: stats } = useDepartmentStatsQuery();
  const hasStats = stats !== null && stats !== undefined;
  const totalStaff = stats?.totalStaff ?? 0;
  const submittedCount = stats?.submittedCount ?? 0;
  if (!hasStats) return <>—</>;
  return (
    <>
      <span className="font-medium tabular-nums text-foreground">{submittedCount}</span>
      {" / "}
      <span className="tabular-nums">{totalStaff}</span>
      {" staff"}
    </>
  );
}

function QaCoordinatorParticipationProgress() {
  const { data: stats } = useDepartmentStatsQuery();
  const hasStats = stats !== null && stats !== undefined;
  const totalStaff = stats?.totalStaff ?? 0;
  const submittedCount = stats?.submittedCount ?? 0;
  const rate = totalStaff > 0 ? Math.round((submittedCount / totalStaff) * 1000) / 10 : 0;
  if (!hasStats || totalStaff === 0) return null;
  return (
    <div className="mt-3">
      <Progress value={rate} className="h-2" />
    </div>
  );
}

function QaCoordinatorEngagement() {
  const { data: stats } = useDepartmentStatsQuery();
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

const CHART_CONFIG_CATEGORY = {
  count: { label: "Ideas", color: CHART_COLOR_CATEGORICAL },
} as const;
const CHART_CONFIG_TIME = {
  count: { label: "Ideas", color: CHART_COLOR_TEMPORAL },
} as const;

function formatPeriodLabel(dateStr: string, dateEndStr?: string): string {
  const parse = (s: string) => {
    const m = String(s ?? "").slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
  };
  const start = parse(dateStr);
  const end = dateEndStr ? parse(dateEndStr) : start ? (() => { const d = new Date(start); d.setDate(d.getDate() + 4); return d; })() : null;
  if (!start || Number.isNaN(start.getTime()) || !end || Number.isNaN(end.getTime())) return dateStr || "—";
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  return start.getTime() === end.getTime() ? fmt(start) : `${fmt(start)} – ${fmt(end)}`;
}

function DepartmentCharts() {
  const { data: charts, isLoading } = useDepartmentChartsQuery();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className={`${UNIFIED_CARD_CLASS} min-h-[280px] overflow-hidden p-6`}>
          <p className={SECTION_LABEL_CLASS}>Ideas by Category</p>
          <div className="mt-4 flex aspect-video items-center justify-center">
            <LoadingState compact />
          </div>
        </div>
        <div className={`${UNIFIED_CARD_CLASS} min-h-[280px] overflow-hidden p-6`}>
          <p className={SECTION_LABEL_CLASS}>Ideas Over Time</p>
          <div className="mt-4 flex aspect-video items-center justify-center">
            <LoadingState compact />
          </div>
        </div>
      </div>
    );
  }

  const ideasByCategory = charts?.ideasByCategory ?? [];
  const ideasOverTime = (charts?.ideasOverTime ?? []).map((d) => ({
    ...d,
    label: formatPeriodLabel(d.date, d.dateEnd),
  }));
  const hasCategoryData = ideasByCategory.length > 0;
  const hasTimeData = ideasOverTime.some((d) => d.count > 0);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div
        className={`${UNIFIED_CARD_CLASS} overflow-hidden p-6 ${TR_CHART_ENTRANCE}`}
        style={{ animationDelay: "0ms" }}
      >
        <p className={SECTION_LABEL_CLASS}>Ideas by Category</p>
        <div className="mt-4 aspect-video">
          {hasCategoryData ? (
            <ChartContainer config={CHART_CONFIG_CATEGORY} className="h-full w-full">
              <BarChart
                data={ideasByCategory}
                margin={{ left: 0, right: 12, top: 8, bottom: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis
                  dataKey="categoryName"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => {
                    const s = String(v ?? "");
                    return s.length > 12 ? `${s.slice(0, 10)}…` : s;
                  }}
                />
                <YAxis tickLine={false} axisLine={false} width={24} tick={{ fontSize: 11 }} allowDecimals={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      className={CHART_TOOLTIP_CLASS}
                      labelClassName={CHART_TOOLTIP_LABEL_CLASS}
                      labelFormatter={(val) =>
                        typeof val === "string" && val.length > 36
                          ? `${String(val).slice(0, 33)}…`
                          : val
                      }
                    />
                  }
                  cursor
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className={`flex h-full items-center justify-center ${TYPO_BODY_SM}`}>
              No ideas yet in this period
            </div>
          )}
        </div>
      </div>
      <div
        className={`${UNIFIED_CARD_CLASS} overflow-hidden p-6 ${TR_CHART_ENTRANCE}`}
        style={{ animationDelay: "70ms" }}
      >
        <p className={SECTION_LABEL_CLASS}>Ideas Over Time</p>
        <div className="mt-4 aspect-video">
          {hasTimeData ? (
            <ChartContainer config={CHART_CONFIG_TIME} className="h-full w-full">
              <LineChart
                data={ideasOverTime}
                margin={{ left: 0, right: 12, top: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis tickLine={false} axisLine={false} width={24} tick={{ fontSize: 11 }} allowDecimals={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      className={CHART_TOOLTIP_CLASS}
                      labelClassName={CHART_TOOLTIP_LABEL_CLASS}
                    />
                  }
                  cursor
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-count)", strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className={`flex h-full items-center justify-center ${TYPO_BODY_SM}`}>
              No ideas submitted yet in this period
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function QaCoordinatorDashboardContent() {
  return (
    <div className="space-y-7">
      <section aria-labelledby="qa-coord-overview-heading">
        <h2 id="qa-coord-overview-heading" className="sr-only">
          Overview
        </h2>
        <QaCoordinatorOverview />
      </section>
      <section aria-labelledby="qa-coord-engagement-heading">
        <h2 id="qa-coord-engagement-heading" className={SECTION_LABEL_CLASS}>
          Engagement
        </h2>
        <div className="mt-2.5">
          <QaCoordinatorEngagement />
        </div>
      </section>
      <section aria-labelledby="qa-coord-charts-heading">
        <h2 id="qa-coord-charts-heading" className={SECTION_LABEL_CLASS}>
          Insights
        </h2>
        <div className="mt-2.5">
          <DepartmentCharts />
        </div>
      </section>
    </div>
  );
}
