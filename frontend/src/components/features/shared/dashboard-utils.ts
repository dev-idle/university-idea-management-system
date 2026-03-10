/** Format date for proposal cycle deadlines (e.g. "Mar 12, 2026, 11:59 PM"). */
export function fmtDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Format date range for chart labels (e.g. "Mar 5 – Mar 12"). */
export function formatPeriodLabel(dateStr: string, dateEndStr?: string): string {
  const parse = (s: string) => {
    const m = String(s ?? "").slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
  };
  const start = parse(dateStr);
  const end = dateEndStr
    ? parse(dateEndStr)
    : start
      ? (() => {
          const d = new Date(start);
          d.setDate(d.getDate() + 4);
          return d;
        })()
      : null;
  if (!start || Number.isNaN(start.getTime()) || !end || Number.isNaN(end.getTime()))
    return dateStr || "—";
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  return start.getTime() === end.getTime() ? fmt(start) : `${fmt(start)} – ${fmt(end)}`;
}

export type ClosedCycle = {
  id: string;
  name: string;
  ideaSubmissionClosesAt: Date | string;
  interactionClosesAt: Date | string;
};
