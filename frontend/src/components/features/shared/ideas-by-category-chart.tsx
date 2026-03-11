"use client";

import { Cell, Pie, PieChart } from "recharts";
import { cn } from "@/lib/utils";
import {
  CARD_STAT_LABEL_CLASS,
  TYPO_BODY_SM,
  INSIGHTS_BAR_COLOR,
  INSIGHTS_DONUT_COLORS,
  CHART_TOOLTIP_LABEL_CLASS,
  TR_CHART_ENTRANCE,
} from "@/config/design";
import { UNIFIED_CARD_CLASS } from "../admin/constants";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";

const CHART_CONFIG_CATEGORY = {
  count: { label: "Ideas", color: INSIGHTS_BAR_COLOR },
  value: { label: "Ideas", color: INSIGHTS_BAR_COLOR },
} as const;

export type IdeasByCategoryChartProps = {
  data: { name: string; value: number }[];
  className?: string;
  animationDelay?: string;
};

export function IdeasByCategoryChart({
  data,
  className,
  animationDelay = "140ms",
}: IdeasByCategoryChartProps) {
  const isMobile = useIsMobile();
  const hasData = data.some((d) => (d.value ?? 0) > 0);

  return (
    <div
      className={cn(UNIFIED_CARD_CLASS, "overflow-hidden p-6", TR_CHART_ENTRANCE, className)}
      style={animationDelay ? { animationDelay } : undefined}
    >
      <p className={CARD_STAT_LABEL_CLASS}>Ideas by Category</p>
      <div className="mt-5 min-h-[200px]">
        {hasData ? (
          <div
            className={cn(
              "flex",
              isMobile ? "flex-col gap-0" : "flex-row items-center gap-3"
            )}
          >
            <div
              className={cn(
                "min-w-0 min-h-[180px] flex-1",
                isMobile ? "h-60" : "h-72 min-h-[220px]"
              )}
            >
              <ChartContainer
                config={CHART_CONFIG_CATEGORY}
                className="h-full w-full !aspect-auto"
              >
                <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        indicator="line"
                        labelClassName={CHART_TOOLTIP_LABEL_CLASS}
                        nameKey="value"
                        labelFormatter={(_val, payload) => {
                          const categoryName =
                            payload?.[0]?.payload?.name ?? payload?.[0]?.name;
                          const str =
                            typeof categoryName === "string"
                              ? categoryName
                              : String(categoryName ?? "");
                          return str.length > 36 ? `${str.slice(0, 33)}…` : str;
                        }}
                      />
                    }
                    cursor
                  />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="45%"
                    outerRadius="85%"
                      paddingAngle={0.5}
                      minAngle={0}
                    isAnimationActive={true}
                    animationDuration={500}
                    animationEasing="ease-out"
                  >
                    {data.map((d, i) => (
                      <Cell
                        key={`${d.name}-${i}`}
                        fill={
                          INSIGHTS_DONUT_COLORS[
                            i % INSIGHTS_DONUT_COLORS.length
                          ]
                        }
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
                {data.map((d, i) => (
                  <Tooltip key={d.name} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <div className="flex min-w-0 cursor-default items-center gap-1">
                        <span
                          className="size-2 shrink-0 rounded-[2px]"
                          style={{
                            backgroundColor:
                              INSIGHTS_DONUT_COLORS[
                                i % INSIGHTS_DONUT_COLORS.length
                              ],
                          }}
                        />
                        <span
                          className={cn(
                            "min-w-0 truncate text-[11px] text-muted-foreground"
                          )}
                        >
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
          <div
            className={`flex aspect-video items-center justify-center ${TYPO_BODY_SM}`}
          >
            No ideas in this cycle
          </div>
        )}
      </div>
    </div>
  );
}
