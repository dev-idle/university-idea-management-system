"use client";

import Link from "next/link";
import { MessageSquare, Eye, ThumbsUp, ThumbsDown, ChevronRight } from "lucide-react";
import {
  Bar,
  BarChart,
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
  INSIGHTS_BAR_COLOR,
  INSIGHTS_RATE_CONTRAST,
  INSIGHTS_LINE_COLOR,
  INSIGHTS_DONUT_COLORS,
  CHART_TOOLTIP_LABEL_CLASS,
  CHART_TOOLTIP_VALUE_CLASS,
  TR_CHART_ENTRANCE,
} from "@/config/design";
import { UNIFIED_CARD_CLASS } from "../admin/constants";
import { formatAcademicYearDisplay } from "../admin/academic-years.utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQaManagerStatsQuery, useQaManagerChartsQuery } from "@/hooks/use-profile";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIdeasContextQuery, useIdeasQuery } from "@/hooks/use-ideas";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LoadingState } from "@/components/ui/loading-state";
function fmtDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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

function QaManagerOverview({ hasActiveCycle }: { hasActiveCycle: boolean }) {
  const { data: stats } = useQaManagerStatsQuery();
  const { data: ideasContext } = useIdeasContextQuery({ enabled: true });

  const activeCycleName = ideasContext?.activeCycleName ?? null;
  const submissionClosesAt = ideasContext?.submissionClosesAt ?? null;
  const interactionClosesAt = ideasContext?.interactionClosesAt ?? null;
  const hasStats = stats !== null && stats !== undefined;

  return (
    <div className="flex flex-col gap-10">
      {hasActiveCycle ? (
        <section aria-labelledby="qa-manager-cycle-heading">
          <h2 id="qa-manager-cycle-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>Proposal Cycle</h2>
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
      <section aria-labelledby="qa-manager-overview-heading">
        <h2 id="qa-manager-overview-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>Overview</h2>
        <div className={cn("mt-4", MANAGEMENT_STAT_GRID_CLASS, hasActiveCycle && "xl:grid-cols-2")}>
          {!hasActiveCycle && (
            <>
              <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
                <p className={CARD_STAT_LABEL_CLASS}>Active academic year</p>
                <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>
                  {hasStats && stats.activeYearName ? formatAcademicYearDisplay(stats.activeYearName) : "—"}
                </p>
              </div>
              <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
                <p className={CARD_STAT_LABEL_CLASS}>Total proposal cycles</p>
                <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>
                  {hasStats ? stats.cyclesInYearCount : "—"}
                </p>
              </div>
            </>
          )}
          <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
            <p className={CARD_STAT_LABEL_CLASS}>Total ideas</p>
            <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>{hasStats ? stats.totalIdeas : "—"}</p>
          </div>
          <div className={`${UNIFIED_CARD_CLASS} px-6 py-4 min-w-0`}>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <p className={`${CARD_STAT_LABEL_CLASS} cursor-default`}>Total departments</p>
              </TooltipTrigger>
              <TooltipContent side="top">
                Excludes IT Services and Quality Assurance Office
              </TooltipContent>
            </Tooltip>
            <p className={`mt-1.5 ${TYPO_STAT_COORD}`}>
              {hasStats ? stats.totalDepartments : "—"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function QaManagerEngagement() {
  const { data: stats } = useQaManagerStatsQuery();
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

const CHART_CONFIG_RATE = {
  rate: { label: "Submission rate (%)", color: INSIGHTS_RATE_CONTRAST },
  count: { label: "Ideas", color: INSIGHTS_RATE_CONTRAST }, /* alias for cursor --color-rate */
} as const;
const CHART_CONFIG_TIME = {
  count: { label: "Ideas", color: INSIGHTS_LINE_COLOR },
} as const;
const CHART_CONFIG_DEPT = {
  count: { label: "Ideas", color: INSIGHTS_BAR_COLOR },
} as const;
const CHART_CONFIG_CATEGORY = {
  count: { label: "Ideas", color: INSIGHTS_BAR_COLOR },
  value: { label: "Ideas", color: INSIGHTS_BAR_COLOR },
} as const;

function QaManagerCharts() {
  const isMobile = useIsMobile();
  const { data: charts, isLoading } = useQaManagerChartsQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${UNIFIED_CARD_CLASS} min-h-[280px] overflow-hidden p-6`}>
          <p className={CARD_STAT_LABEL_CLASS}>Ideas per Department</p>
          <div className="mt-4 flex aspect-video items-center justify-center">
            <LoadingState compact />
          </div>
        </div>
        <div className={`${UNIFIED_CARD_CLASS} min-h-[280px] overflow-hidden p-6`}>
          <p className={CARD_STAT_LABEL_CLASS}>Submission Rate per Department</p>
          <div className="mt-4 flex aspect-video items-center justify-center">
            <LoadingState compact />
          </div>
        </div>
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

  const submissionRate = charts?.submissionRatePerDepartment ?? [];
  const ideasOverTime = (charts?.ideasOverTime ?? []).map((d) => ({
    ...d,
    label: formatPeriodLabel(d.date, d.dateEnd),
  }));
  const ideasPerDept = charts?.ideasPerDepartment ?? [];
  const ideasByCategory = charts?.ideasByCategory ?? [];

  const hasRateData = submissionRate.some((d) => d.rate > 0 || d.totalStaff > 0);
  const hasTimeData = ideasOverTime.some((d) => d.count > 0);
  const hasDeptData = ideasPerDept.some((d) => d.count > 0);
  const hasCategoryData = ideasByCategory.length > 0;
  const pieData = ideasByCategory.map((d) => ({ name: d.categoryName, value: d.count }));

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
      {/* Ideas per Department — bar chart */}
      <div
        className={`${UNIFIED_CARD_CLASS} overflow-hidden p-6 ${TR_CHART_ENTRANCE}`}
        style={{ animationDelay: "0ms" }}
      >
        <p className={CARD_STAT_LABEL_CLASS}>Ideas per Department</p>
        <div className="mt-4 aspect-video">
          {hasDeptData ? (
            <ChartContainer config={CHART_CONFIG_DEPT} className="h-full w-full">
              <BarChart
                data={ideasPerDept}
                margin={{ left: 0, right: 12, top: 8, bottom: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis
                  dataKey="departmentName"
                  hide={isMobile}
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
              No ideas in this cycle
            </div>
          )}
        </div>
      </div>

      {/* Submission Rate per Department — vertical bar */}
      <div
        className={`${UNIFIED_CARD_CLASS} overflow-hidden p-6 ${TR_CHART_ENTRANCE}`}
        style={{ animationDelay: "70ms" }}
      >
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <p className={`${CARD_STAT_LABEL_CLASS} cursor-default`}>
              Submission Rate per Department
            </p>
          </TooltipTrigger>
            <TooltipContent side="top">
              Distinct staff who submitted / Total staff (excl. IT Services, QA Office, QA Coordinators)
            </TooltipContent>
        </Tooltip>
        <div className="mt-4 aspect-video">
          {hasRateData ? (
            <ChartContainer config={CHART_CONFIG_RATE} className="h-full w-full">
              <BarChart
                data={submissionRate}
                margin={{ left: 0, right: 12, top: 8, bottom: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis
                  dataKey="departmentName"
                  hide={isMobile}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => {
                    const s = String(v ?? "");
                    return s.length > 12 ? `${s.slice(0, 10)}…` : s;
                  }}
                />
                <YAxis
                  type="number"
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                  tickFormatter={(v) => `${Number(v)}%`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelClassName={CHART_TOOLTIP_LABEL_CLASS}
                      formatter={(value, _name, item) => {
                        const p = (item?.payload ?? item) as {
                          departmentName?: string;
                          submittedCount?: number;
                          totalStaff?: number;
                          fill?: string;
                        };
                        const label = p.departmentName != null && p.submittedCount != null && p.totalStaff != null
                          ? `${p.departmentName} — ${p.submittedCount}/${p.totalStaff} Staff`
                          : "";
                        return (
                          <>
                            <div
                              className="w-1 shrink-0 rounded-[2px]"
                              style={{
                                backgroundColor: p?.fill ?? (item as { color?: string })?.color ?? "var(--color-rate)",
                              }}
                            />
                            <div className="flex flex-1 flex-col justify-between gap-1 leading-none">
                              {label ? (
                                <div className={cn("font-medium", CHART_TOOLTIP_LABEL_CLASS)}>
                                  {label}
                                </div>
                              ) : null}
                              <div className="flex justify-between items-end">
                                <span className="text-muted-foreground">Submission rate (%)</span>
                                <span className={CHART_TOOLTIP_VALUE_CLASS}>
                                  {Math.round(Number(value)).toLocaleString()}%
                                </span>
                              </div>
                            </div>
                          </>
                        );
                      }}
                    />
                  }
                  cursor
                />
                <Bar dataKey="rate" fill="var(--color-rate)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className={`flex h-full items-center justify-center ${TYPO_BODY_SM}`}>
              No department data in this cycle
            </div>
          )}
        </div>
      </div>

      {/* Ideas by Category — donut chart */}
      <div
        className={`${UNIFIED_CARD_CLASS} overflow-hidden p-6 ${TR_CHART_ENTRANCE}`}
        style={{ animationDelay: "140ms" }}
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

      {/* Ideas Over Time — line chart */}
      <div
        className={`${UNIFIED_CARD_CLASS} overflow-hidden p-6 ${TR_CHART_ENTRANCE}`}
        style={{ animationDelay: "210ms" }}
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

function HighlightIdeaCard({
  idea,
  rank,
}: {
  idea: { id: string; title: string; voteCounts?: { up: number; down: number }; commentCount?: number; viewCount?: number };
  rank: number;
}) {
  const votes = idea.voteCounts ?? { up: 0, down: 0 };
  const comments = idea.commentCount ?? 0;
  const views = idea.viewCount ?? 0;

  const rankStyle = rank === 1
    ? "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
    : rank === 2
      ? "bg-slate-400/15 text-slate-600 dark:bg-slate-400/20 dark:text-slate-300"
      : rank === 3
        ? "bg-amber-700/15 text-amber-800 dark:bg-amber-600/20 dark:text-amber-500"
        : "bg-muted/50 text-muted-foreground";

  const metrics = [
    { key: "up", icon: ThumbsUp, value: votes.up },
    { key: "down", icon: ThumbsDown, value: votes.down },
    { key: "comments", icon: MessageSquare, value: comments },
    { key: "views", icon: Eye, value: views },
  ];

  return (
    <Link
      href={`/ideas/${idea.id}`}
      className={cn(
        "group flex items-start gap-3 rounded-lg border border-border/55 bg-muted/[0.03] px-4 py-3",
        "transition-colors hover:bg-muted/[0.06] hover:border-border/80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums",
          rankStyle
        )}
        aria-hidden
      >
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="min-w-0 truncate text-sm font-medium text-foreground group-hover:text-primary" title={idea.title}>
          {idea.title}
        </p>
        <div className="mt-1.5 hidden flex-wrap items-center gap-x-1 gap-y-1 text-[11px] text-muted-foreground md:flex">
          {metrics.map(({ key, icon: Icon, value }, i) => (
            <span key={key} className="inline-flex items-center gap-2">
              {i > 0 && (
                <span className="select-none px-1 text-muted-foreground/10" aria-hidden>|</span>
              )}
              <Icon className="size-3 shrink-0 opacity-55" strokeWidth={2} aria-hidden />
              <span className="tabular-nums">{value}</span>
            </span>
          ))}
        </div>
      </div>
      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-primary/80" aria-hidden />
    </Link>
  );
}

function QaManagerHighlight() {
  const { data: popular, isLoading: popularLoading } = useIdeasQuery(
    { sort: "mostPopular", limit: 5 },
    { enabled: true }
  );
  const { data: mostComments, isLoading: commentsLoading } = useIdeasQuery(
    { sort: "mostComments", limit: 5 },
    { enabled: true }
  );
  const { data: mostViewed, isLoading: viewedLoading } = useIdeasQuery(
    { sort: "mostViewed", limit: 5 },
    { enabled: true }
  );

  const isLoading = popularLoading || commentsLoading || viewedLoading;
  const hasPopular = (popular?.items?.length ?? 0) > 0;
  const hasComments = (mostComments?.items?.length ?? 0) > 0;
  const hasViewed = (mostViewed?.items?.length ?? 0) > 0;
  const hasAny = hasPopular || hasComments || hasViewed;

  if (isLoading) {
    return (
      <section aria-labelledby="qa-manager-highlight-heading">
        <h2 id="qa-manager-highlight-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>
          Top Ideas
        </h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className={`${UNIFIED_CARD_CLASS} min-h-[120px] p-6`}>
            <LoadingState compact />
          </div>
          <div className={`${UNIFIED_CARD_CLASS} min-h-[120px] p-6`}>
            <LoadingState compact />
          </div>
          <div className={`${UNIFIED_CARD_CLASS} min-h-[120px] p-6`}>
            <LoadingState compact />
          </div>
        </div>
      </section>
    );
  }

  if (!hasAny) return null;

  return (
    <section aria-labelledby="qa-manager-highlight-heading">
      <h2 id="qa-manager-highlight-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>
        Top Ideas
      </h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className={`${UNIFIED_CARD_CLASS} overflow-hidden p-6 ${TR_CHART_ENTRANCE}`}>
          <div className="flex items-center gap-2.5">
            <ThumbsUp className="size-3.5 shrink-0 text-muted-foreground/70" strokeWidth={2} aria-hidden />
            <p className={CARD_STAT_LABEL_CLASS}>Most Popular</p>
          </div>
          <div className="mt-4 flex min-h-[120px] flex-col gap-2.5">
            {hasPopular ? (
              popular!.items.map((idea, i) => (
                <HighlightIdeaCard key={idea.id} idea={idea} rank={i + 1} />
              ))
            ) : (
              <div className="flex flex-1 items-center justify-center py-8">
                <p className={TYPO_BODY_SM}>No ideas with votes yet</p>
              </div>
            )}
          </div>
        </div>
        <div className={`${UNIFIED_CARD_CLASS} overflow-hidden p-6 ${TR_CHART_ENTRANCE}`}>
          <div className="flex items-center gap-2.5">
            <MessageSquare className="size-3.5 shrink-0 text-muted-foreground/70" strokeWidth={2} aria-hidden />
            <p className={CARD_STAT_LABEL_CLASS}>Most Comments</p>
          </div>
          <div className="mt-4 flex min-h-[120px] flex-col gap-2.5">
            {hasComments ? (
              mostComments!.items.map((idea, i) => (
                <HighlightIdeaCard key={idea.id} idea={idea} rank={i + 1} />
              ))
            ) : (
              <div className="flex flex-1 items-center justify-center py-8">
                <p className={TYPO_BODY_SM}>No ideas with comments yet</p>
              </div>
            )}
          </div>
        </div>
        <div className={`${UNIFIED_CARD_CLASS} overflow-hidden p-6 ${TR_CHART_ENTRANCE}`}>
          <div className="flex items-center gap-2.5">
            <Eye className="size-3.5 shrink-0 text-muted-foreground/70" strokeWidth={2} aria-hidden />
            <p className={CARD_STAT_LABEL_CLASS}>Most Viewed</p>
          </div>
          <div className="mt-4 flex min-h-[120px] flex-col gap-2.5">
            {hasViewed ? (
              mostViewed!.items.map((idea, i) => (
                <HighlightIdeaCard key={idea.id} idea={idea} rank={i + 1} />
              ))
            ) : (
              <div className="flex flex-1 items-center justify-center py-8">
                <p className={TYPO_BODY_SM}>No ideas with views yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function QaManagerDashboardContent() {
  const { data: ideasContext } = useIdeasContextQuery({ enabled: true });
  const hasActiveCycle = Boolean(ideasContext?.activeCycleName);

  return (
    <div className="space-y-10">
      <QaManagerOverview hasActiveCycle={hasActiveCycle} />
      <section aria-labelledby="qa-manager-engagement-heading">
        <h2 id="qa-manager-engagement-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>
          Engagement
        </h2>
        <div className="mt-4">
          <QaManagerEngagement />
        </div>
      </section>
      {hasActiveCycle && (
        <section aria-labelledby="qa-manager-charts-heading">
          <h2 id="qa-manager-charts-heading" className={DASHBOARD_SECTION_HEADING_CLASS}>
            Insights
          </h2>
          <div className="mt-4">
            <QaManagerCharts />
          </div>
        </section>
      )}
      <QaManagerHighlight />
    </div>
  );
}
