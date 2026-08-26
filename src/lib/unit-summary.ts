import type { Department, Employee } from "@/data/types";
import type { AssignedTicket } from "@/store/tickets-store";
import { getCapacityStatus } from "@/lib/capacity";

export interface UnitSummary {
  employees: Employee[];
  employeeCount: number;
  averageUtilization: number;
  availableCapacity: number;
  atRiskCount: number;
  overloadedCount: number;
  activeTasksCount: number;
  openTicketsCount: number;
  forecast8Week: { week: string; utilization: number }[];
}

export function getEmployeeWorkCounts(employee: Employee) {
  const projects = employee.upcomingProjects.length;
  const tickets = employee.upcomingTickets.length;
  return { projects, tickets, activeTasks: projects + tickets };
}

export interface EmployeeTask {
  key: string;
  type: "Project" | "Ticket" | "Ad-hoc";
  name: string;
  priority: "High" | "Medium" | "Low";
  deadline: string;
}

/** Every task currently on an employee's plate — seed projects/tickets/ad-hoc plus any
 * ticket assigned to them via the WorkLens Work queue (the tickets-store bridge). */
export function getEmployeeTasks(employee: Employee, tickets: AssignedTicket[]): EmployeeTask[] {
  return [
    ...employee.upcomingProjects.map((p) => ({ key: `p-${p.id}`, type: "Project" as const, name: p.name, priority: p.priority, deadline: p.deadline })),
    ...employee.upcomingTickets.map((t) => ({ key: `t-${t.id}`, type: "Ticket" as const, name: t.title, priority: t.priority, deadline: t.deadline })),
    ...employee.adhoc.map((a) => ({ key: `a-${a.id}`, type: "Ad-hoc" as const, name: a.name, priority: a.priority, deadline: a.deadline })),
    ...tickets
      .filter((t) => t.assignedEmployeeId === employee.id)
      .map((t) => ({ key: `at-${t.id}`, type: "Ticket" as const, name: t.title, priority: t.priority, deadline: t.expectedResolutionDate })),
  ];
}

export function computeUnitSummary(unit: Department, employees: Employee[], tickets: AssignedTicket[]): UnitSummary {
  const unitEmployees = employees.filter((e) => e.department === unit);
  const count = unitEmployees.length || 1;

  const averageUtilization = Math.round(
    unitEmployees.reduce((sum, e) => sum + e.currentUtilization, 0) / count
  );
  const availableCapacity = Math.max(0, Math.round(100 - averageUtilization));

  let atRiskCount = 0;
  let overloadedCount = 0;
  let activeTasksCount = 0;

  unitEmployees.forEach((e) => {
    const status = getCapacityStatus(e.currentUtilization).key;
    if (status === "atRisk") atRiskCount += 1;
    if (status === "overloaded" || status === "critical") overloadedCount += 1;
    activeTasksCount += e.upcomingProjects.length + e.upcomingTickets.length;
  });

  const openTicketsCount = tickets.filter(
    (t) => t.assignedUnit === unit && t.status !== "Resolved" && t.status !== "Closed"
  ).length;

  const forecast8Week = Array.from({ length: 8 }, (_, weekIdx) => {
    const values = unitEmployees.map((e) => e.forecast8Week[weekIdx] ?? e.currentUtilization);
    const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
    return { week: `Week ${weekIdx + 1}`, utilization: avg };
  });

  return {
    employees: unitEmployees,
    employeeCount: unitEmployees.length,
    averageUtilization,
    availableCapacity,
    atRiskCount,
    overloadedCount,
    activeTasksCount,
    openTicketsCount,
    forecast8Week,
  };
}
