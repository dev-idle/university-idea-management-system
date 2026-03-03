"use client";

import { MessageSquare, Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_SECTION_HEADING_CLASS,
  CARD_STAT_LABEL_CLASS,
  TYPO_STAT_COORD,
  TYPO_STAT_BASE_COORD,
  TYPO_BODY_SM,
  INSIGHTS_DONUT_COLORS,
  CHART_COLOR_CATEGORICAL,
  CHART_COLOR_TEMPORAL,
  CHART_TOOLTIP_CLASS,
  CHART_TOOLTIP_LABEL_CLASS,
  TR_CHART_ENTRANCE,
} from "@/config/design";
import { UNIFIED_CARD_CLASS } from "../admin/constants";
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
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/ui/loading-state";
import { useIdeasContextQuery } from "@/hooks/use-ideas";

function fmtDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function QaCoordinatorOverview() {
  const { data: ideasContext } = useIdeasContextQuery({ enabled: true });

  const activeCycleName = ideasContext?.activeCycleName ?? null;
  const submissionClosesAt = ideasContext?.submissionClosesAt ?? null;
  const interactionClosesAt = ideasContext?.interactionClosesAt ?? null;

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="qa-coord-cycle-heading">
        <h2 id="qa-coord-cycle-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>Proposal Cycle</h2>
        <div className={`mt-4 ${UNIFIED_CARD_CLASS} px-6 py-6`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
            <div className="min-w-0">
              <p className={CARD_STAT_LABEL_CLASS}>Cycle name</p>
              {activeCycleName ? (
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <p className={`mt-1.5 min-w-0 truncate cursor-default ${TYPO_STAT_COORD}`}>
                      {activeCycleName}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="top">{activeCycleName}</TooltipContent>
                </Tooltip>
              ) : (
                <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>—</p>
              )}
            </div>
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
      <section aria-labelledby="qa-coord-participation-heading">
        <h2 id="qa-coord-participation-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>Participation</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
            <p className={CARD_STAT_LABEL_CLASS}>Ideas submitted</p>
            <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>
              <QaCoordinatorStatValue select="totalIdeas" />
            </p>
          </div>
          <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
            <p className={CARD_STAT_LABEL_CLASS}>Participation rate</p>
            <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>
              <QaCoordinatorParticipationValue />
            </p>
            <div className="mt-2.5">
              <QaCoordinatorParticipationProgress />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function QaCoordinatorStatValue({ select }: { select: "totalIdeas" }) {
  const { data: stats } = useDepartmentStatsQuery();
  const hasStats = stats !== null && stats !== undefined;
  if (select === "totalIdeas") return <>{hasStats ? stats.totalIdeas : "—"}</>;
  return null;
}

function QaCoordinatorParticipationValue() {
  const { data: stats } = useDepartmentStatsQuery();
  const hasStats = stats !== null && stats !== undefined;
  const totalStaff = stats?.totalStaff ?? 0;
  const submittedCount = stats?.submittedCount ?? 0;
  if (!hasStats) return <>—</>;
  return <>{submittedCount} / {totalStaff} members</>;
}

function QaCoordinatorParticipationProgress() {
  const { data: stats } = useDepartmentStatsQuery();
  const hasStats = stats !== null && stats !== undefined;
  const totalStaff = stats?.totalStaff ?? 0;
  const submittedCount = stats?.submittedCount ?? 0;
  const rate = totalStaff > 0 ? Math.round((submittedCount / totalStaff) * 1000) / 10 : 0;
  if (!hasStats || totalStaff === 0) return null;
  return <Progress value={rate} className="h-2" />;
}

function QaCoordinatorEngagement() {
  const { data: stats } = useDepartmentStatsQuery();
  const hasStats = stats !== null && stats !== undefined;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
  const hasCategoryData = ideasByCategory.length > 0;
  const pieData = ideasByCategory.map((d) => ({ name: d.categoryName, value: d.count }));
  const ideasOverTime = (charts?.ideasOverTime ?? []).map((d) => ({
    ...d,
    label: formatPeriodLabel(d.date, d.dateEnd),
  }));
  const hasTimeData = ideasOverTime.some((d) => d.count > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        className={`${UNIFIED_CARD_CLASS} overflow-hidden p-6 ${TR_CHART_ENTRANCE}`}
        style={{ animationDelay: "0ms" }}
      >
        <p className={CARD_STAT_LABEL_CLASS}>Ideas by Category</p>
        <div className="mt-4 aspect-video">
          {hasCategoryData ? (
            <div className="flex h-full w-full items-stretch gap-4">
              <ChartContainer config={CHART_CONFIG_CATEGORY} className="min-w-0 flex-1 !aspect-auto">
                <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        indicator="line"
                        className={CHART_TOOLTIP_CLASS}
                        labelClassName={CHART_TOOLTIP_LABEL_CLASS}
                        nameKey="value"
                        labelFormatter={(_val, payload) => {
                          const categoryName = payload?.[0]?.payload?.name ?? payload?.[0]?.name;
                          const str = typeof categoryName === "string" ? categoryName : String(categoryName ?? "");
                          return str.length > 36 ? `${str.slice(0, 33)}…` : str;
                        }}
                      />
                    }
                    cursor
                  />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="85%"
                    paddingAngle={0}
                    isAnimationActive={true}
                    animationDuration={500}
                    animationEasing="ease-out"
                  >
                    {pieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={INSIGHTS_DONUT_COLORS[i % INSIGHTS_DONUT_COLORS.length]}
                        stroke="var(--background)"
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="flex shrink-0 flex-col justify-center gap-1.5 border-l border-border/40 pl-4">
                {pieData.map((d, i) => (
                  <div
                    key={d.name}
                    className="flex items-center gap-2 text-[11px]"
                  >
                    <span
                      className="size-2 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: INSIGHTS_DONUT_COLORS[i % INSIGHTS_DONUT_COLORS.length] }}
                      aria-hidden
                    />
                    <span className="min-w-0 truncate text-muted-foreground" title={d.name}>
                      {d.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`flex h-full items-center justify-center ${TYPO_BODY_SM}`}>
              No ideas in this cycle
            </div>
          )}
        </div>
      </div>
      <div
        className={`${UNIFIED_CARD_CLASS} overflow-hidden p-6 ${TR_CHART_ENTRANCE}`}
        style={{ animationDelay: "70ms" }}
      >
        <p className={CARD_STAT_LABEL_CLASS}>Ideas Over Time</p>
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
              No ideas in this cycle
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function QaCoordinatorDashboardContent() {
  return (
    <div className="space-y-10">
      <QaCoordinatorOverview />
      <section aria-labelledby="qa-coord-engagement-heading">
        <h2 id="qa-coord-engagement-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>
          Engagement
        </h2>
        <div className="mt-4">
          <QaCoordinatorEngagement />
        </div>
      </section>
      <section aria-labelledby="qa-coord-charts-heading">
        <h2 id="qa-coord-charts-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>
          Insights
        </h2>
        <div className="mt-4">
          <DepartmentCharts />
        </div>
      </section>
    </div>
  );
}
