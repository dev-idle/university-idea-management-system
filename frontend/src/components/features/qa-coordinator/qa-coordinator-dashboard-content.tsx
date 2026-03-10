"use client";

import { useState, useMemo } from "react";
import { MessageSquare, Eye, ThumbsUp, ThumbsDown, ChevronDown } from "lucide-react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  MANAGEMENT_STAT_GRID_CLASS,
  DASHBOARD_SECTION_HEADING_CLASS,
  CARD_STAT_LABEL_CLASS,
  TYPO_STAT_COORD,
  TYPO_STAT_BASE_COORD,
  TYPO_BODY_SM,
  CHART_COLOR_TEMPORAL,
  CHART_TOOLTIP_LABEL_CLASS,
  TR_CHART_ENTRANCE,
  FILTER_SELECT_CONTENT_CLASS,
} from "@/config/design";
import {
  UNIFIED_CARD_CLASS,
  TOOLBAR_FILTER_SELECT_TRIGGER_CLASS,
  TOOLBAR_FILTER_CHEVRON_CLASS,
  TOOLBAR_FILTER_ROLE_WIDTH,
} from "../admin/constants";
import { formatAcademicYearDisplay } from "../admin/academic-years.utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  useDepartmentStatsQuery,
  useDepartmentChartsQuery,
} from "@/hooks/use-profile";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { IdeasByCategoryChart } from "../shared/ideas-by-category-chart";
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/ui/loading-state";
import { useIdeasContextQuery } from "@/hooks/use-ideas";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fmtDateTime, formatPeriodLabel, type ClosedCycle } from "../shared/dashboard-utils";

function QaCoordinatorOverview({
  hasActiveCycle,
  cycleId,
  closedCycles,
  effectiveCycleId,
  onCycleChange,
}: {
  hasActiveCycle: boolean;
  cycleId?: string | null;
  closedCycles: ClosedCycle[];
  effectiveCycleId: string | null;
  onCycleChange: (id: string | null) => void;
}) {
  const { data: ideasContext } = useIdeasContextQuery({ enabled: true });
  const { data: stats } = useDepartmentStatsQuery({
    cycleId: hasActiveCycle ? undefined : cycleId,
  });

  const selectedCycle = effectiveCycleId
    ? closedCycles.find((c) => c.id === effectiveCycleId)
    : null;

  const displayName = hasActiveCycle
    ? (ideasContext?.activeCycleName ?? null)
    : (selectedCycle?.name ?? null);
  const submissionClosesAt = hasActiveCycle
    ? (ideasContext?.submissionClosesAt ?? null)
    : (selectedCycle?.ideaSubmissionClosesAt ?? null);
  const interactionClosesAt = hasActiveCycle
    ? (ideasContext?.interactionClosesAt ?? null)
    : (selectedCycle?.interactionClosesAt ?? null);

  const showProposalCycleSection = hasActiveCycle || closedCycles.length > 0;
  const hasStats = stats !== null && stats !== undefined;

  return (
    <div className="flex flex-col gap-10">
      {showProposalCycleSection && (
        <section aria-labelledby="qa-coord-cycle-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="qa-coord-cycle-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>
              Proposal Cycle
            </h2>
            {!hasActiveCycle && closedCycles.length > 0 && (
              <Select
                value={effectiveCycleId ?? ""}
                onValueChange={(v) => onCycleChange(v || null)}
              >
                <SelectTrigger
                  className={cn(
                    TOOLBAR_FILTER_SELECT_TRIGGER_CLASS,
                    TOOLBAR_FILTER_ROLE_WIDTH,
                    "[&>svg:first-of-type]:hidden",
                  )}
                  aria-label="Select proposal cycle"
                >
                  <SelectValue placeholder="Select a cycle" />
                  <ChevronDown className={TOOLBAR_FILTER_CHEVRON_CLASS} aria-hidden />
                </SelectTrigger>
                <SelectContent className={FILTER_SELECT_CONTENT_CLASS}>
                  {closedCycles.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className={`mt-4 ${UNIFIED_CARD_CLASS} px-6 py-6`}>
            <div
              className={cn(
                "grid gap-x-8 gap-y-6",
                hasActiveCycle ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2",
              )}
            >
              {hasActiveCycle && (
                <div className="min-w-0">
                  <p className={CARD_STAT_LABEL_CLASS}>Cycle name</p>
                  {displayName ? (
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <p className={`mt-1.5 min-w-0 truncate cursor-default ${TYPO_STAT_COORD}`}>
                          {displayName}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent side="top">{displayName}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>—</p>
                  )}
                </div>
              )}
              <div className="min-w-0">
                <p className={CARD_STAT_LABEL_CLASS}>Submission deadline</p>
                <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>
                  {submissionClosesAt ? fmtDateTime(submissionClosesAt) : "—"}
                </p>
              </div>
              <div className="min-w-0">
                <p className={CARD_STAT_LABEL_CLASS}>Comments & votes deadline</p>
                <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>
                  {interactionClosesAt ? fmtDateTime(interactionClosesAt) : "—"}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
      <section aria-labelledby="qa-coord-overview-heading">
        <h2 id="qa-coord-overview-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>
          Overview
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
            <p className={CARD_STAT_LABEL_CLASS}>Active academic year</p>
            <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>
              {hasStats ? formatAcademicYearDisplay(stats.activeYearName ?? ideasContext?.activeAcademicYear?.name ?? "") || "—" : "—"}
            </p>
          </div>
          <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
            <p className={CARD_STAT_LABEL_CLASS}>Total ideas</p>
            <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>
              <QaCoordinatorStatValue cycleId={hasActiveCycle ? undefined : cycleId} select="totalIdeas" />
            </p>
          </div>
          <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
            <p className={CARD_STAT_LABEL_CLASS}>Participation rate</p>
            <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>
              <QaCoordinatorParticipationValue cycleId={hasActiveCycle ? undefined : cycleId} />
            </p>
            <div className="mt-2.5">
              <QaCoordinatorParticipationProgress cycleId={hasActiveCycle ? undefined : cycleId} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function QaCoordinatorStatValue({ select, cycleId }: { select: "totalIdeas"; cycleId?: string | null }) {
  const { data: stats } = useDepartmentStatsQuery({ cycleId });
  const hasStats = stats !== null && stats !== undefined;
  if (select === "totalIdeas") return <>{hasStats ? stats.totalIdeas : "—"}</>;
  return null;
}

function QaCoordinatorParticipationValue({ cycleId }: { cycleId?: string | null }) {
  const { data: stats } = useDepartmentStatsQuery({ cycleId });
  const hasStats = stats !== null && stats !== undefined;
  const totalStaff = stats?.totalStaff ?? 0;
  const submittedCount = stats?.submittedCount ?? 0;
  if (!hasStats) return <>—</>;
  return <>{submittedCount} / {totalStaff} members</>;
}

function QaCoordinatorParticipationProgress({ cycleId }: { cycleId?: string | null }) {
  const { data: stats } = useDepartmentStatsQuery({ cycleId });
  const hasStats = stats !== null && stats !== undefined;
  const totalStaff = stats?.totalStaff ?? 0;
  const submittedCount = stats?.submittedCount ?? 0;
  const rate = totalStaff > 0 ? Math.round((submittedCount / totalStaff) * 1000) / 10 : 0;
  if (!hasStats || totalStaff === 0) return null;
  return <Progress value={rate} className="h-2" />;
}

function QaCoordinatorEngagement({ cycleId }: { cycleId?: string | null }) {
  const { data: stats } = useDepartmentStatsQuery({ cycleId });
  const hasStats = stats !== null && stats !== undefined;

  return (
    <div className={MANAGEMENT_STAT_GRID_CLASS}>
      <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
        <p className={CARD_STAT_LABEL_CLASS}>Comments</p>
        <p className={cn("mt-1.5 flex items-center gap-2", TYPO_STAT_COORD)}>
          <MessageSquare className="size-[18px] shrink-0" aria-hidden />
          <span className="min-w-[2.5rem] tabular-nums">{hasStats ? stats.totalComments : "—"}</span>
        </p>
      </div>
      <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
        <p className={CARD_STAT_LABEL_CLASS}>Views</p>
        <p className={cn("mt-1.5 flex items-center gap-2", TYPO_STAT_BASE_COORD, "text-info")}>
          <Eye className="size-[18px] shrink-0" aria-hidden />
          <span className="min-w-[2.5rem] tabular-nums">{hasStats ? stats.totalViews : "—"}</span>
        </p>
      </div>
      <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
        <p className={CARD_STAT_LABEL_CLASS}>Upvotes</p>
        <p className={cn("mt-1.5 flex items-center gap-2", TYPO_STAT_BASE_COORD, "text-success")}>
          <ThumbsUp className="size-[18px] shrink-0" aria-hidden />
          <span className="min-w-[2.5rem] tabular-nums">{hasStats ? stats.votesUp : "—"}</span>
        </p>
      </div>
      <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
        <p className={CARD_STAT_LABEL_CLASS}>Downvotes</p>
        <p className={cn("mt-1.5 flex items-center gap-2", TYPO_STAT_BASE_COORD, "text-destructive")}>
          <ThumbsDown className="size-[18px] shrink-0" aria-hidden />
          <span className="min-w-[2.5rem] tabular-nums">{hasStats ? stats.votesDown : "—"}</span>
        </p>
      </div>
    </div>
  );
}

const CHART_CONFIG_TIME = {
  count: { label: "Ideas", color: CHART_COLOR_TEMPORAL },
} as const;

function DepartmentCharts({ cycleId }: { cycleId?: string | null }) {
  const isMobile = useIsMobile();
  const { data: charts, isLoading } = useDepartmentChartsQuery({ cycleId });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${UNIFIED_CARD_CLASS} min-h-[280px] overflow-hidden p-6`}>
          <p className={CARD_STAT_LABEL_CLASS}>Ideas by Category</p>
          <div className="mt-4 flex aspect-video items-center justify-center">
            <LoadingState compact />
          </div>
        </div>
        <div className={`${UNIFIED_CARD_CLASS} min-h-[280px] overflow-hidden p-6`}>
          <p className={CARD_STAT_LABEL_CLASS}>Ideas Over Time</p>
          <div className="mt-4 flex aspect-video items-center justify-center">
            <LoadingState compact />
          </div>
        </div>
      </div>
    );
  }

  const ideasByCategory = charts?.ideasByCategory ?? [];
  const pieData = ideasByCategory.map((d) => ({ name: d.categoryName, value: d.count }));
  const ideasOverTime = (charts?.ideasOverTime ?? []).map((d) => ({
    ...d,
    label: formatPeriodLabel(d.date, d.dateEnd),
  }));
  const hasTimeData = ideasOverTime.some((d) => d.count > 0);

  const ideasOverTimeMax = Math.max(0, ...ideasOverTime.map((d) => d.count));
  const ideasOverTimeYDomain: [number, number] = (() => {
    if (ideasOverTimeMax <= 0) return [0, 2];
    const step = ideasOverTimeMax <= 10 ? 2 : ideasOverTimeMax <= 50 ? 5 : 10;
    const niceMax = Math.ceil((ideasOverTimeMax + 0.5) / step) * step;
    return [0, Math.max(niceMax, 2)];
  })();
  const ideasOverTimeYTicks = (() => {
    const [, max] = ideasOverTimeYDomain;
    const step = max <= 10 ? 2 : max <= 50 ? 5 : 10;
    const ticks: number[] = [];
    for (let i = 0; i <= max; i += step) ticks.push(i);
    return ticks;
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <IdeasByCategoryChart data={pieData} animationDelay="0ms" />
      <div
        className={`${UNIFIED_CARD_CLASS} overflow-hidden p-6 ${TR_CHART_ENTRANCE}`}
        style={{ animationDelay: "70ms" }}
      >
        <p className={CARD_STAT_LABEL_CLASS}>Ideas Over Time</p>
        <div className="mt-4 aspect-video min-h-[160px]">
          {hasTimeData ? (
            <ChartContainer config={CHART_CONFIG_TIME} className="h-full w-full min-h-[160px]">
              <LineChart
                data={ideasOverTime}
                margin={{ left: 0, right: 12, top: 8, bottom: isMobile ? 16 : 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis
                  dataKey="label"
                  hide={isMobile}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis tickLine={false} axisLine={false} width={isMobile ? 32 : 24} tick={{ fontSize: 11 }} allowDecimals={false} domain={ideasOverTimeYDomain} ticks={ideasOverTimeYTicks} interval={0} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="line"
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
              No ideas in this cycle
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function QaCoordinatorDashboardContent() {
  const { data: ideasContext } = useIdeasContextQuery({ enabled: true });
  const hasActiveCycle = Boolean(ideasContext?.activeCycleName);
  const closedCycles = useMemo(
    () => ideasContext?.closedCyclesForYear ?? [],
    [ideasContext?.closedCyclesForYear],
  );

  const defaultCycleId = closedCycles[0]?.id ?? null;
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);

  const effectiveCycleId =
    selectedCycleId && closedCycles.some((c) => c.id === selectedCycleId)
      ? selectedCycleId
      : defaultCycleId;

  const cycleIdForQueries = hasActiveCycle ? undefined : effectiveCycleId;
  const showInsights = hasActiveCycle || (effectiveCycleId && closedCycles.length > 0);

  return (
    <div className="space-y-10">
      <QaCoordinatorOverview
        hasActiveCycle={hasActiveCycle}
        cycleId={cycleIdForQueries}
        closedCycles={closedCycles}
        effectiveCycleId={effectiveCycleId}
        onCycleChange={setSelectedCycleId}
      />
      <section aria-labelledby="qa-coord-engagement-heading">
        <h2 id="qa-coord-engagement-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>
          Engagement
        </h2>
        <div className="mt-4">
          <QaCoordinatorEngagement cycleId={cycleIdForQueries} />
        </div>
      </section>
      {showInsights && (
        <section aria-labelledby="qa-coord-charts-heading">
          <h2 id="qa-coord-charts-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>
            Insights
          </h2>
          <div className="mt-4">
            <DepartmentCharts cycleId={cycleIdForQueries} />
          </div>
        </section>
      )}
    </div>
  );
}
