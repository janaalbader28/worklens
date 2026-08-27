import type { Department, Employee } from "@/data/types";
import { DEMO_TODAY, parseLooseDate } from "@/lib/date";

/** The one "Supervisor"-level employee in a department — new hires in that department
 * are linked to them as their supervisor by default. Data-driven off `level`, so
 * promoting someone to Supervisor on their HR profile is what makes them the default. */
export function getDepartmentSupervisor(department: Department, employees: Employee[]): Employee | undefined {
  return employees.find((e) => e.department === department && e.level === "Supervisor");
}

/** Always derived live from the department's current Supervisor — never overridable
 * per-employee, so a supervisor change (see `getDepartmentSupervisor`) is reflected
 * for everyone who reports to them the moment it happens, with no stale per-employee
 * snapshot to go out of sync. A Supervisor is the top of their department's chain in
 * this demo, so they have no supervisor of their own. */
export function getSupervisorName(employee: Pick<Employee, "level" | "department">, employees: Employee[]): string {
  if (employee.level === "Supervisor") return "—";
  const supervisor = getDepartmentSupervisor(employee.department, employees);
  return supervisor?.name ?? "—";
}

export function getEmployeeEmail(employee: Pick<Employee, "name" | "email">): string {
  if (employee.email) return employee.email;
  const first = employee.name.split(" ")[0].toLowerCase();
  return `${first}@worklens-demo.example`;
}

export type AvailabilityStatus = "Available" | "Unavailable" | "Limited";

export function getAvailabilityStatus(employee: Employee): AvailabilityStatus {
  if (employee.availabilityOverride) return employee.availabilityOverride;
  const onLeaveNow = employee.leaveEvents.some((leave) => {
    const start = parseLooseDate(leave.start);
    const end = parseLooseDate(leave.end);
    if (!start || !end) return false;
    return DEMO_TODAY >= start && DEMO_TODAY <= end;
  });
  if (onLeaveNow) return "Unavailable";
  if (employee.currentUtilization > 95) return "Limited";
  return "Available";
}
