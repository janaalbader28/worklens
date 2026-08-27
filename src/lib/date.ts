// Simulated "today" for the demo dataset — the org's forecast/leave/ticket data is
// written relative to this date so the prototype tells a coherent story regardless
// of when it's actually run.
export const DEMO_TODAY = new Date("2026-08-26");
export const DEMO_TODAY_LABEL = "26 Aug 2026";

export function parseLooseDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Formats a Date (e.g. from a native `<input type="date">`) to match the
 * "26 Aug 2026" style used throughout the app's seed data. (Not using
 * `toLocaleDateString` here — the en-GB locale abbreviates September as
 * "Sept", four letters, inconsistent with every other month and with the
 * app's existing three-letter seed dates.) */
export function formatDisplayDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = SHORT_MONTHS[date.getMonth()];
  return `${day} ${month} ${date.getFullYear()}`;
}

/** Converts a "26 Aug 2026"-style label to the `YYYY-MM-DD` value a native
 * `<input type="date">` expects. Inverse of `formatDisplayDate`. */
export function toInputDateValue(label: string): string {
  const date = parseLooseDate(label);
  if (!date) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
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
