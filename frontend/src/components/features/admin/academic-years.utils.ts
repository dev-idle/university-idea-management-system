/**
 * Parse "YYYY-MM-DD" as local date (avoids UTC timezone issues).
 */
function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Format Date to "YYYY-MM-DD" in local time (avoids toISOString UTC shift).
 */
function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Compute end date from start date for academic year (+1 year rule).
 * End = (Start + 1 year) - 1 day (full year period).
 *
 * Examples:
 * 01/07/2026 → 30/06/2027
 * 01/02/2026 → 31/01/2027
 * 01/03/2026 → 28/02/2027 or 29/02/2027 (leap year)
 *
 * @param startDate - "YYYY-MM-DD" string or Date (parsed as local)
 */
export function computeEndDateFromStart(
  startDate: Date | string
): { date: Date; formatted: string } {
  const start =
    typeof startDate === "string"
      ? parseLocalDate(startDate)
      : new Date(startDate);
  const month = start.getMonth();
  const year = start.getFullYear();
  const day = start.getDate();

  // End = (Start + 1 year) - 1 day
  const plusOneYear = new Date(year + 1, month, day);
  plusOneYear.setDate(plusOneYear.getDate() - 1);
  const end = plusOneYear;
  return { date: end, formatted: formatLocalDate(end) };
}

export { formatAcademicYearDisplay } from "@/lib/utils";
export function toInputDate(d: Date | string): string {
  if (typeof d === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const parsed = new Date(d);
    return formatLocalDate(parsed);
  }
  return formatLocalDate(d);
}
