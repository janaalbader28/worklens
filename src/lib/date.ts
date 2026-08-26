// Simulated "today" for the demo dataset — the org's forecast/leave/ticket data is
// written relative to this date so the prototype tells a coherent story regardless
// of when it's actually run.
export const DEMO_TODAY = new Date("2026-08-26");
export const DEMO_TODAY_LABEL = "26 Aug 2026";

export function parseLooseDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export type DueStatus = "Overdue" | "Due Soon" | "On Track";

/** Due-soon window, in days, used to flag upcoming deadlines. */
const DUE_SOON_DAYS = 5;

export function getDueStatus(deadline: string): DueStatus {
  const date = parseLooseDate(deadline);
  if (!date) return "On Track";
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntil = Math.round((date.getTime() - DEMO_TODAY.getTime()) / msPerDay);
  if (daysUntil < 0) return "Overdue";
  if (daysUntil <= DUE_SOON_DAYS) return "Due Soon";
  return "On Track";
}
