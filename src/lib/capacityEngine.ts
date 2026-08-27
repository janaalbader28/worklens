// The one shared source of truth for "how busy is this employee right now" and "is this
// work item done, blocked, or at risk" — used by the Supervisor Dashboard, Team Capacity,
// and the employee capacity pages alike, so they can never disagree with each other.
//
// Architecture note: rather than making every consumer (ticket-candidate ranking, the
// Handover/What-If simulators, Team Capacity's table/card views, StatusBadge colors, ...)
// recompute this independently, `CapacitySyncEngine` (mounted once at the app root) is the
// only thing that WRITES the result back onto `Employee.currentUtilization` — every other
// page keeps reading that same stored field exactly as before. That keeps this fix scoped
// to "make the number correct and keep it correct" rather than a rewrite of every page that
// happens to read utilization.

import type { Employee, WorkflowStatus } from "@/data/types";
import type { AssignedTicket } from "@/store/tickets-store";
import type { TicketStatus } from "@/data/tickets";
import { DEMO_TODAY, parseLooseDate, getDueStatus } from "@/lib/date";

export interface WorkLogLookup {
  (key: string): { workflowStatus?: WorkflowStatus; progress?: number };
}

/** A ticket is done once it's Resolved/Closed on the ticket itself (the supervisor's or
 * IT Ticket System's call) OR the assignee has marked their personal tracking Completed —
 * either should free up their capacity. Ad-hoc items have no system-of-record status of
 * their own, so only the work-log's Completed applies. */
export function isItemComplete(workflowStatus: WorkflowStatus | undefined, ticketStatus?: TicketStatus): boolean {
  if (workflowStatus === "Completed") return true;
  if (ticketStatus === "Resolved" || ticketStatus === "Closed") return true;
  return false;
}

/** Remaining effort for one work item — the full estimate once progress/completion is
 * factored in. Completed work is always 0h remaining regardless of a stale progress value. */
export function itemRemainingHours(estimatedHours: number, complete: boolean, progress: number | undefined): number {
  if (complete) return 0;
  const pct = Math.min(100, Math.max(0, progress ?? 0));
  return Math.round(estimatedHours * (1 - pct / 100) * 10) / 10;
}

export interface EmployeeCapacity {
  weeklyHours: number;
  activeHours: number;
  availableHours: number;
  utilization: number;
}

/** Every ticket assigned to `employee` (live tickets-store data) plus their seed ad-hoc
 * items, reduced by logged progress and zeroed out once complete. `upcomingTickets` (a
 * seed duplicate of the ticket concept, superseded by the live tickets store) is
 * deliberately excluded so real tickets aren't counted twice under two systems. */
export function computeEmployeeCapacity(employee: Employee, tickets: AssignedTicket[], getEntry: WorkLogLookup): EmployeeCapacity {
  let activeHours = 0;

  tickets
    .filter((t) => (t.assignedEmployeeIds ?? []).includes(employee.id))
    .forEach((t) => {
      const entry = getEntry(`${employee.id}:${t.id}`);
      activeHours += itemRemainingHours(t.estimatedHours, isItemComplete(entry.workflowStatus, t.status), entry.progress);
    });

  employee.adhoc.forEach((a) => {
    const entry = getEntry(`${employee.id}:${a.id}`);
    activeHours += itemRemainingHours(a.estimatedHours, isItemComplete(entry.workflowStatus), entry.progress);
  });

  activeHours = Math.round(activeHours * 10) / 10;
  const weeklyHours = employee.weeklyHours || 40;
  return {
    weeklyHours,
    activeHours,
    availableHours: Math.max(0, Math.round((weeklyHours - activeHours) * 10) / 10),
    utilization: Math.round((activeHours / weeklyHours) * 100),
  };
}

export interface EmployeeWorkItem {
  key: string;
  title: string;
  type: "Ticket" | "Ad-hoc";
  dueDate: string | null;
  status: DisplayStatus;
  progress: number;
  remainingHours: number;
  ticketId?: string;
}

/** Every active-or-completed work item on `employee`'s plate, in the same shape
 * whether it's a live ticket or a seed ad-hoc item — used for both the "my work"
 * lists (My Work, MyWorkList) and the small KPI counts (Active Work, Overdue, Due
 * Soon) that need to agree with each other and with `computeEmployeeCapacity`. */
export function computeEmployeeWorkItems(employee: Employee, tickets: AssignedTicket[], getEntry: WorkLogLookup): EmployeeWorkItem[] {
  const items: EmployeeWorkItem[] = [];

  tickets
    .filter((t) => (t.assignedEmployeeIds ?? []).includes(employee.id))
    .forEach((t) => {
      const entry = getEntry(`${employee.id}:${t.id}`);
      const status = unifiedItemStatus(entry.workflowStatus, t.status);
      items.push({
        key: `${employee.id}:${t.id}`,
        title: t.title,
        type: "Ticket",
        dueDate: t.expectedResolutionDate,
        status,
        progress: status === "Completed" ? 100 : Math.min(100, Math.max(0, entry.progress ?? 0)),
        remainingHours: itemRemainingHours(t.estimatedHours, status === "Completed", entry.progress),
        ticketId: t.id,
      });
    });

  employee.adhoc.forEach((a) => {
    const entry = getEntry(`${employee.id}:${a.id}`);
    const status = unifiedItemStatus(entry.workflowStatus);
    const dueDate = a.deadline === "Ongoing" ? null : a.deadline;
    items.push({
      key: `${employee.id}:${a.id}`,
      title: a.name,
      type: "Ad-hoc",
      dueDate,
      status,
      progress: status === "Completed" ? 100 : Math.min(100, Math.max(0, entry.progress ?? 0)),
      remainingHours: itemRemainingHours(a.estimatedHours, status === "Completed", entry.progress),
    });
  });

  return items;
}

export type DisplayStatus = "Completed" | "In Progress" | "Not Started" | "Blocked";

/** A single, unified status for any work item — ticket or ad-hoc — for status rollups
 * (Team Progress, Work Delivery) that don't care which system the item came from. */
export function unifiedItemStatus(workflowStatus: WorkflowStatus | undefined, ticketStatus?: TicketStatus): DisplayStatus {
  if (isItemComplete(workflowStatus, ticketStatus)) return "Completed";
  if (workflowStatus === "Blocked") return "Blocked";
  if (workflowStatus === "In Progress" || ticketStatus === "In Progress") return "In Progress";
  return "Not Started";
}

export type DeliveryBucket = "Completed" | "Overdue" | "In Progress";

/** Where a work item lands on the "are we actually delivering" view — a passed due
 * date is the one signal that overrides everything else, since it's true regardless
 * of whether the item is also logged as blocked. Blocked status has its own visibility
 * in Team Progress, so it isn't split out again here. */
export function deliveryBucket(status: DisplayStatus, dueDate: string | null | undefined): DeliveryBucket {
  if (status === "Completed") return "Completed";
  if (dueDate && getDueStatus(dueDate) === "Overdue") return "Overdue";
  return "In Progress";
}

/** A rough, per-item "how done is it" fraction used for the team's overall progress
 * average — real logged progress when we have it, otherwise a status-based estimate. */
export function progressFraction(status: DisplayStatus, progress: number | undefined): number {
  if (status === "Completed") return 100;
  if (typeof progress === "number") return Math.min(100, Math.max(0, progress));
  if (status === "In Progress") return 50;
  if (status === "Blocked") return 25;
  return 0;
}

function rangesOverlapToday(start: string, end: string): boolean {
  const s = parseLooseDate(start);
  const e = parseLooseDate(end);
  if (!s || !e) return false;
  return DEMO_TODAY >= s && DEMO_TODAY <= e;
}

export function isCurrentlyOnLeave(employee: Employee): boolean {
  return employee.leaveEvents.some((l) => l.status !== "Pending" && rangesOverlapToday(l.start, l.end));
}

/** Leave starting soon enough to matter for near-term planning — a supervisor deciding
 * who to assign new work to this week needs to know about next week's leave too. */
export function isOnUpcomingLeave(employee: Employee, withinDays = 7): boolean {
  return employee.leaveEvents.some((l) => {
    if (l.status === "Pending") return false;
    const start = parseLooseDate(l.start);
    if (!start) return false;
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.round((start.getTime() - DEMO_TODAY.getTime()) / msPerDay);
    return days >= 0 && days <= withinDays;
  });
}

export function isOnOrUpcomingLeave(employee: Employee, withinDays = 7): boolean {
  return isCurrentlyOnLeave(employee) || isOnUpcomingLeave(employee, withinDays);
}
