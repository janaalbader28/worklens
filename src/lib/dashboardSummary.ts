import type { Department, Employee } from "@/data/types";
import type { AssignedTicket } from "@/store/tickets-store";
import { ticketsForUnit } from "@/store/tickets-store";
import {
  computeEmployeeCapacity,
  unifiedItemStatus,
  deliveryBucket,
  itemRemainingHours,
  progressFraction,
  isCurrentlyOnLeave,
  isOnUpcomingLeave,
  isOnOrUpcomingLeave,
  type WorkLogLookup,
  type EmployeeCapacity,
  type DisplayStatus,
  type DeliveryBucket,
} from "@/lib/capacityEngine";
import { getCapacityStatus, type CapacityStatus } from "@/lib/capacity";
import { CAPACITY_THRESHOLDS } from "@/data/config";
import { getDueStatus } from "@/lib/date";

export interface UnitWorkItem {
  key: string;
  employeeId: string;
  employeeName: string;
  title: string;
  dueDate: string | null;
  remainingHours: number;
  status: DisplayStatus;
  bucket: DeliveryBucket;
  progress?: number;
  ticketId?: string;
}

export interface EmployeeCapacityRow {
  employee: Employee;
  capacity: EmployeeCapacity;
  status: CapacityStatus;
  activeItems: number;
  onLeave: "Now" | "Upcoming" | null;
}

export type AttentionTone = "critical" | "serious" | "warning" | "info";

export interface AttentionItem {
  tone: AttentionTone;
  label: string;
  message: string;
  href: string;
}

export interface DashboardSummary {
  unitEmployees: Employee[];
  teamMembers: number;
  totalAvailableHours: number;
  totalWeeklyHours: number;
  availableCapacityPct: number;
  onLeaveCount: number;
  openTicketsCount: number;
  overdueWorkCount: number;
  atRiskCount: number;
  employeeCapacities: EmployeeCapacityRow[];
  workItems: UnitWorkItem[];
  teamProgress: { completed: number; inProgress: number; notStarted: number; overallPercent: number };
  workDelivery: { completed: number; overdue: number; inProgress: number };
  attentionItems: AttentionItem[];
  forecast8Week: { week: string; utilization: number }[];
}

function buildUnitWorkItems(unitEmployees: Employee[], tickets: AssignedTicket[], getEntry: WorkLogLookup): UnitWorkItem[] {
  const items: UnitWorkItem[] = [];

  unitEmployees.forEach((e) => {
    tickets
      .filter((t) => (t.assignedEmployeeIds ?? []).includes(e.id))
      .forEach((t) => {
        const entry = getEntry(`${e.id}:${t.id}`);
        const status = unifiedItemStatus(entry.workflowStatus, t.status);
        items.push({
          key: `${e.id}:${t.id}`,
          employeeId: e.id,
          employeeName: e.name,
          title: t.title,
          dueDate: t.expectedResolutionDate,
          remainingHours: itemRemainingHours(t.estimatedHours, status === "Completed", entry.progress),
          status,
          bucket: deliveryBucket(status, t.expectedResolutionDate),
          progress: entry.progress,
          ticketId: t.id,
        });
      });

    e.adhoc.forEach((a) => {
      const entry = getEntry(`${e.id}:${a.id}`);
      const status = unifiedItemStatus(entry.workflowStatus);
      const dueDate = a.deadline === "Ongoing" ? null : a.deadline;
      items.push({
        key: `${e.id}:${a.id}`,
        employeeId: e.id,
        employeeName: e.name,
        title: a.name,
        dueDate,
        remainingHours: itemRemainingHours(a.estimatedHours, status === "Completed", entry.progress),
        status,
        bucket: deliveryBucket(status, dueDate),
        progress: entry.progress,
      });
    });
  });

  return items;
}

/** A ticket shared by 2 employees appears once per assignee in `workItems` (each
 * person legitimately needs to see it in their own workload) — but it's still one
 * ticket. Aggregate counts (Overdue Work, Team Progress, Work Delivery, Attention
 * Required) must not count it twice, so they run over this deduplicated view instead,
 * merging the assignee names for display. Ad-hoc items are never shared, so they pass
 * through unchanged. */
function dedupeByTicket(items: UnitWorkItem[]): UnitWorkItem[] {
  const byIdentity = new Map<string, UnitWorkItem>();
  const order: string[] = [];
  items.forEach((item) => {
    const identity = item.ticketId ?? item.key;
    const existing = byIdentity.get(identity);
    if (existing) {
      if (!existing.employeeName.includes(item.employeeName)) {
        existing.employeeName = `${existing.employeeName}, ${item.employeeName}`;
      }
      return;
    }
    byIdentity.set(identity, { ...item });
    order.push(identity);
  });
  return order.map((id) => byIdentity.get(id)!);
}

export function computeDashboardSummary(unit: Department, employees: Employee[], tickets: AssignedTicket[], getEntry: WorkLogLookup): DashboardSummary {
  const unitEmployees = employees.filter((e) => e.department === unit);
  const workItems = buildUnitWorkItems(unitEmployees, tickets, getEntry);
  const uniqueItems = dedupeByTicket(workItems);

  const employeeCapacities: EmployeeCapacityRow[] = unitEmployees.map((employee) => {
    const capacity = computeEmployeeCapacity(employee, tickets, getEntry);
    const activeItems = workItems.filter((i) => i.employeeId === employee.id && i.status !== "Completed").length;
    return {
      employee,
      capacity,
      status: getCapacityStatus(capacity.utilization),
      activeItems,
      onLeave: isCurrentlyOnLeave(employee) ? "Now" : isOnUpcomingLeave(employee) ? "Upcoming" : null,
    };
  });
  const capacityByEmployee = new Map(employeeCapacities.map((r) => [r.employee.id, r]));

  const totalAvailableHours = Math.round(employeeCapacities.reduce((sum, r) => sum + r.capacity.availableHours, 0) * 10) / 10;
  const totalWeeklyHours = employeeCapacities.reduce((sum, r) => sum + r.capacity.weeklyHours, 0);
  const availableCapacityPct = totalWeeklyHours > 0 ? Math.round((totalAvailableHours / totalWeeklyHours) * 100) : 0;

  const onLeaveCount = unitEmployees.filter((e) => isOnOrUpcomingLeave(e)).length;
  const openTicketsCount = ticketsForUnit(tickets, unit).filter((t) => t.status !== "Resolved" && t.status !== "Closed").length;
  const overdueWorkCount = uniqueItems.filter((i) => i.bucket === "Overdue").length;

  const atRiskCount = uniqueItems.filter((i) => {
    if (i.status === "Completed") return false;
    const row = capacityByEmployee.get(i.employeeId);
    if (row?.onLeave === "Now" || row?.onLeave === "Upcoming") return true;
    const dueSoon = i.dueDate ? getDueStatus(i.dueDate) === "Due Soon" : false;
    return dueSoon && (row?.capacity.utilization ?? 0) >= CAPACITY_THRESHOLDS.healthy.max;
  }).length;

  const activeItems = workItems.filter((i) => i.status !== "Completed");
  const teamProgress = {
    completed: uniqueItems.filter((i) => i.status === "Completed").length,
    // Blocked items are still active/started work, just stuck — folded into "In
    // Progress" here since Team Progress no longer breaks Blocked out on its own.
    inProgress: uniqueItems.filter((i) => i.status === "In Progress" || i.status === "Blocked").length,
    notStarted: uniqueItems.filter((i) => i.status === "Not Started").length,
    overallPercent: uniqueItems.length
      ? Math.round(uniqueItems.reduce((sum, i) => sum + progressFraction(i.status, i.progress), 0) / uniqueItems.length)
      : 0,
  };

  const workDelivery = {
    completed: uniqueItems.filter((i) => i.bucket === "Completed").length,
    overdue: uniqueItems.filter((i) => i.bucket === "Overdue").length,
    inProgress: uniqueItems.filter((i) => i.bucket === "In Progress").length,
  };

  const attentionItems: AttentionItem[] = [];
  const itemHref = (i: UnitWorkItem) => (i.ticketId ? `/systems/tickets/${i.ticketId}` : `/supervisor/people/${i.employeeId}`);

  uniqueItems
    .filter((i) => i.bucket === "Overdue")
    .slice(0, 2)
    .forEach((i) =>
      attentionItems.push({
        tone: "critical",
        label: "Critical",
        message: `${i.title} is overdue and likely to miss its deadline.`,
        href: itemHref(i),
      })
    );

  employeeCapacities
    .filter((r) => r.capacity.utilization >= CAPACITY_THRESHOLDS.atRisk.max)
    .slice(0, 2)
    .forEach((r) =>
      attentionItems.push({
        tone: "serious",
        label: "Capacity Risk",
        message: `${r.employee.name} is approaching full capacity (${r.capacity.utilization}% utilized).`,
        href: `/supervisor/people/${r.employee.id}`,
      })
    );

  employeeCapacities
    .filter((r) => r.onLeave === "Upcoming" && r.activeItems > 0)
    .slice(0, 2)
    .forEach((r) =>
      attentionItems.push({
        tone: "warning",
        label: "Upcoming Leave",
        message: `${r.employee.name} will be unavailable while ${r.activeItems} work item${r.activeItems === 1 ? " is" : "s are"} active.`,
        href: "/supervisor/handover",
      })
    );

  uniqueItems
    .filter((i) => i.status === "Blocked")
    .slice(0, 2)
    .forEach((i) =>
      attentionItems.push({
        tone: "info",
        label: "Blocked",
        message: `${i.title} (${i.employeeName}) is currently blocked.`,
        href: itemHref(i),
      })
    );

  const forecast8Week = Array.from({ length: 8 }, (_, weekIdx) => {
    const values = unitEmployees.map((e) => e.forecast8Week[weekIdx] ?? e.currentUtilization);
    const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
    return { week: `Week ${weekIdx + 1}`, utilization: avg };
  });

  return {
    unitEmployees,
    teamMembers: unitEmployees.length,
    totalAvailableHours,
    totalWeeklyHours,
    availableCapacityPct,
    onLeaveCount,
    openTicketsCount,
    overdueWorkCount,
    atRiskCount,
    employeeCapacities,
    workItems: activeItems,
    teamProgress,
    workDelivery,
    attentionItems: attentionItems.slice(0, 6),
    forecast8Week,
  };
}
