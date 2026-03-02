"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
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
  SECTION_LABEL_CLASS,
  TYPO_STAT_SUBTLE,
  TYPO_STAT_BASE_SUBTLE,
  TYPO_BODY_SM,
  INSIGHTS_BAR_COLOR,
  INSIGHTS_RATE_COLOR,
  INSIGHTS_LINE_COLOR,
  INSIGHTS_DONUT_COLORS,
  CHART_TOOLTIP_CLASS,
  CHART_TOOLTIP_LABEL_CLASS,
  CHART_TOOLTIP_VALUE_CLASS,
  TR_CHART_ENTRANCE,
} from "@/config/design";
import { UNIFIED_CARD_CLASS } from "../admin/constants";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQaManagerStatsQuery, useQaManagerChartsQuery } from "@/hooks/use-profile";
import { useIdeasContextQuery } from "@/hooks/use-ideas";
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
        <div className="min-w-0">
          <p className={SECTION_LABEL_CLASS}>Total ideas</p>
          <p className={`mt-1.5 ${TYPO_STAT_SUBTLE}`}>{hasStats ? stats.totalIdeas : "—"}</p>
        </div>
        <div className="min-w-0">
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <p className={`${SECTION_LABEL_CLASS} cursor-default`}>Total departments</p>
            </TooltipTrigger>
            <TooltipContent side="top">
              Excludes IT Services and Quality Assurance Office
            </TooltipContent>
          </Tooltip>
          <p className={`mt-1.5 ${TYPO_STAT_SUBTLE}`}>
            {hasStats ? stats.totalDepartments : "—"}
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
  rate: { label: "Submission rate (%)", color: INSIGHTS_RATE_COLOR },
  count: { label: "Ideas", color: INSIGHTS_RATE_COLOR }, /* alias for cursor --color-rate */
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
  const { data: charts, isLoading } = useQaManagerChartsQuery();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className={`${UNIFIED_CARD_CLASS} min-h-[280px] overflow-hidden p-6`}>
          <p className={SECTION_LABEL_CLASS}>Ideas per Department</p>
          <div className="mt-4 flex aspect-video items-center justify-center">
            <LoadingState compact />
          </div>
        </div>
        <div className={`${UNIFIED_CARD_CLASS} min-h-[280px] overflow-hidden p-6`}>
          <p className={SECTION_LABEL_CLASS}>Submission Rate per Department</p>
          <div className="mt-4 flex aspect-video items-center justify-center">
            <LoadingState compact />
          </div>
        </div>
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

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Ideas per Department — bar chart */}
      <div
        className={`${UNIFIED_CARD_CLASS} overflow-hidden p-6 ${TR_CHART_ENTRANCE}`}
        style={{ animationDelay: "0ms" }}
      >
        <p className={SECTION_LABEL_CLASS}>Ideas per Department</p>
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

      {/* Submission Rate per Department — vertical bar */}
      <div
        className={`${UNIFIED_CARD_CLASS} overflow-hidden p-6 ${TR_CHART_ENTRANCE}`}
        style={{ animationDelay: "70ms" }}
      >
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <p className={`${SECTION_LABEL_CLASS} cursor-default`}>
              Submission Rate per Department
            </p>
          </TooltipTrigger>
          <TooltipContent side="top">
            Distinct staff who submitted / Total staff (excl. IT Services & QA Office)
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
                      className={CHART_TOOLTIP_CLASS}
                      labelClassName={CHART_TOOLTIP_LABEL_CLASS}
                      formatter={(value, _name, item) => {
                        const p = (item?.payload ?? item) as {
                          departmentName?: string;
                          submittedCount?: number;
                          totalStaff?: number;
                          fill?: string;
                        };
                        const label = p.departmentName != null && p.submittedCount != null && p.totalStaff != null
                          ? `${p.departmentName} — ${p.submittedCount}/${p.totalStaff} staff`
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
              No department data yet
            </div>
          )}
        </div>
      </div>

      {/* Ideas by Category — donut chart */}
      <div
        className={`${UNIFIED_CARD_CLASS} overflow-hidden p-6 ${TR_CHART_ENTRANCE}`}
        style={{ animationDelay: "140ms" }}
      >
        <p className={SECTION_LABEL_CLASS}>Ideas by Category</p>
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
                    <span className={cn("shrink-0", CHART_TOOLTIP_VALUE_CLASS)}>
                      {d.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`flex h-full items-center justify-center ${TYPO_BODY_SM}`}>
              No ideas yet in this period
            </div>
          )}
        </div>
      </div>

      {/* Ideas Over Time — line chart */}
      <div
        className={`${UNIFIED_CARD_CLASS} overflow-hidden p-6 ${TR_CHART_ENTRANCE}`}
        style={{ animationDelay: "210ms" }}
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
      <section aria-labelledby="qa-manager-charts-heading">
        <h2 id="qa-manager-charts-heading" className={SECTION_LABEL_CLASS}>
          Insights
        </h2>
        <div className="mt-2.5">
          <QaManagerCharts />
        </div>
      </section>
    </div>
  );
}
