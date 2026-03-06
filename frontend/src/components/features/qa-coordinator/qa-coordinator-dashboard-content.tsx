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
  MANAGEMENT_STAT_GRID_CLASS,
  DASHBOARD_SECTION_HEADING_CLASS,
  CARD_STAT_LABEL_CLASS,
  TYPO_STAT_COORD,
  TYPO_STAT_BASE_COORD,
  TYPO_BODY_SM,
  INSIGHTS_DONUT_COLORS,
  CHART_COLOR_CATEGORICAL,
  CHART_COLOR_TEMPORAL,
  CHART_TOOLTIP_LABEL_CLASS,
  TR_CHART_ENTRANCE,
} from "@/config/design";
import { UNIFIED_CARD_CLASS } from "../admin/constants";
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
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/ui/loading-state";
import { useIdeasContextQuery } from "@/hooks/use-ideas";
import { useIsMobile } from "@/hooks/use-mobile";

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

function QaCoordinatorOverview({ hasActiveCycle }: { hasActiveCycle: boolean }) {
  const { data: ideasContext } = useIdeasContextQuery({ enabled: true });
  const { data: stats } = useDepartmentStatsQuery();

  const activeCycleName = ideasContext?.activeCycleName ?? null;
  const submissionClosesAt = ideasContext?.submissionClosesAt ?? null;
  const interactionClosesAt = ideasContext?.interactionClosesAt ?? null;
  const hasStats = stats !== null && stats !== undefined;

  return (
    <div className="flex flex-col gap-10">
      {hasActiveCycle ? (
        <section aria-labelledby="qa-coord-cycle-heading">
          <h2 id="qa-coord-cycle-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>Proposal Cycle</h2>
          <div className={`mt-4 ${UNIFIED_CARD_CLASS} px-6 py-6`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
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
      ) : null}
      {!hasActiveCycle ? (
        <>
          <section aria-labelledby="qa-coord-overview-heading">
            <h2 id="qa-coord-overview-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>Overview</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
                <p className={CARD_STAT_LABEL_CLASS}>Active academic year</p>
                <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>
                  {hasStats ? formatAcademicYearDisplay(stats.activeYearName ?? ideasContext?.activeAcademicYear?.name ?? "") || "—" : "—"}
                </p>
              </div>
              <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
                <p className={CARD_STAT_LABEL_CLASS}>Total proposal cycles</p>
                <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>
                  {hasStats ? stats.cyclesInYearCount : "—"}
                </p>
              </div>
              <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
                <p className={CARD_STAT_LABEL_CLASS}>Total ideas</p>
                <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>
                  <QaCoordinatorStatValue select="totalIdeas" />
                </p>
              </div>
            </div>
          </section>
          <section aria-labelledby="qa-coord-participation-heading">
            <h2 id="qa-coord-participation-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>Participation rate</h2>
            <div className="mt-4">
              <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
                <p className={CARD_STAT_LABEL_CLASS}>Members participated</p>
                <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>
                  <QaCoordinatorParticipationValue />
                </p>
                <div className="mt-2.5">
                  <QaCoordinatorParticipationProgress />
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section aria-labelledby="qa-coord-participation-heading">
          <h2 id="qa-coord-participation-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>Participation</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
              <p className={CARD_STAT_LABEL_CLASS}>Total ideas</p>
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
      )}
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
  const isMobile = useIsMobile();
  const { data: charts, isLoading } = useDepartmentChartsQuery();

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
  const hasCategoryData = ideasByCategory.length > 0;
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
      <div
        className={`${UNIFIED_CARD_CLASS} overflow-hidden p-6 ${TR_CHART_ENTRANCE}`}
        style={{ animationDelay: "0ms" }}
      >
        <p className={CARD_STAT_LABEL_CLASS}>Ideas by Category</p>
        <div className="mt-5 min-h-[200px]">
          {hasCategoryData ? (
            <div className={cn("flex", isMobile ? "flex-col gap-0" : "flex-row items-center gap-3")}>
              <div className={cn("min-w-0 flex-1 min-h-[180px]", isMobile ? "h-60" : "h-72 min-h-[220px]")}>
                <ChartContainer config={CHART_CONFIG_CATEGORY} className="h-full w-full !aspect-auto">
                  <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          indicator="line"
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
                      innerRadius="45%"
                      outerRadius="85%"
                      paddingAngle={1}
                      minAngle={2}
                      isAnimationActive={true}
                      animationDuration={500}
                      animationEasing="ease-out"
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={INSIGHTS_DONUT_COLORS[i % INSIGHTS_DONUT_COLORS.length]}
                          stroke="var(--background)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>
              {!isMobile && (
                <div className="shrink-0 flex flex-col gap-1 py-0 md:w-36">
                  {pieData.map((d, i) => (
                    <Tooltip key={d.name} delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div className="flex min-w-0 cursor-default items-center gap-1">
                          <span
                            className="size-2 shrink-0 rounded-[2px]"
                            style={{
                              backgroundColor: INSIGHTS_DONUT_COLORS[i % INSIGHTS_DONUT_COLORS.length],
                            }}
                          />
                          <span className={cn("min-w-0 truncate text-[11px] text-muted-foreground")}>
                            {d.name}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">{d.name}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={`flex aspect-video items-center justify-center ${TYPO_BODY_SM}`}>
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

  return (
    <div className="space-y-10">
      <QaCoordinatorOverview hasActiveCycle={hasActiveCycle} />
      <section aria-labelledby="qa-coord-engagement-heading">
        <h2 id="qa-coord-engagement-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>
          Engagement
        </h2>
        <div className="mt-4">
          <QaCoordinatorEngagement />
        </div>
      </section>
      {hasActiveCycle && (
        <section aria-labelledby="qa-coord-charts-heading">
          <h2 id="qa-coord-charts-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>
            Insights
          </h2>
          <div className="mt-4">
            <DepartmentCharts />
          </div>
        </section>
      )}
    </div>
  );
}
