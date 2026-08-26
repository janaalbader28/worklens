import type { Employee } from "@/data/types";
import { HANDOVER_DEFAULT } from "@/data/scenarios";
import { computeSkillMatch } from "@/lib/simulate";
import { availableCapacity } from "@/lib/capacity";

export interface AffectedWorkItem {
  name: string;
  type: string;
  hours: number;
}

export interface HandoverCandidate {
  employee: Employee;
  skillMatch: number;
  availableCapacity: number;
  projectedCapacity: number;
  recommendation: "Best Match" | "Higher Risk";
}

function isDefaultCase(employeeId: string, start: string, end: string) {
  return (
    employeeId === HANDOVER_DEFAULT.employeeId &&
    start.trim() === HANDOVER_DEFAULT.unavailableStart &&
    end.trim() === HANDOVER_DEFAULT.unavailableEnd
  );
}

export function computeHandover(
  employees: Employee[],
  employeeId: string,
  start: string,
  end: string
): { affectedWork: AffectedWorkItem[]; candidates: HandoverCandidate[] } {
  const getEmployeeById = (id: string) => employees.find((e) => e.id === id);

  if (isDefaultCase(employeeId, start, end)) {
    return {
      affectedWork: HANDOVER_DEFAULT.affectedWork,
      candidates: HANDOVER_DEFAULT.candidates.map((c) => ({
        employee: getEmployeeById(c.employeeId)!,
        skillMatch: c.skillMatch,
        availableCapacity: c.availableCapacity,
        projectedCapacity: c.projectedCapacity,
        recommendation: c.recommendation,
      })),
    };
  }

  const employee = getEmployeeById(employeeId);
  if (!employee) return { affectedWork: [], candidates: [] };

  const affectedWork: AffectedWorkItem[] = [
    ...employee.upcomingProjects.map((p) => ({ name: p.name, type: "Project", hours: p.hoursPerWeek })),
    ...employee.upcomingTickets.map((t) => ({ name: t.title, type: "Ticket", hours: t.estimatedHours })),
    ...employee.adhoc.map((a) => ({ name: a.name, type: "Ad-hoc", hours: a.estimatedHours })),
  ];
  const totalAffectedHours = affectedWork.reduce((sum, w) => sum + w.hours, 0);

  const ranked = employees
    .filter((e) => e.id !== employee.id)
    .map((e) => ({
      employee: e,
      skillMatch: computeSkillMatch(e, employee.skills.map((s) => s.name)),
    }))
    .filter((c) => c.skillMatch > 0)
    .sort((a, b) => b.skillMatch - a.skillMatch || a.employee.currentUtilization - b.employee.currentUtilization)
    .slice(0, 2);

  const candidates: HandoverCandidate[] = ranked.map((c, idx) => {
    const avail = availableCapacity(c.employee.currentUtilization);
    const projected = Math.round(c.employee.currentUtilization + (totalAffectedHours / c.employee.weeklyHours) * 100);
    return {
      employee: c.employee,
      skillMatch: c.skillMatch,
      availableCapacity: avail,
      projectedCapacity: projected,
      recommendation: idx === 0 ? "Best Match" : "Higher Risk",
    };
  });

  return { affectedWork, candidates };
}
