import type { Department, Employee } from "@/data/types";
import { SUPERVISOR } from "@/data/employees";
import { DEMO_TODAY, parseLooseDate } from "@/lib/date";

// One nominated lead per department — used only to render a believable "Supervisor"
// column on the HR System page. WorkLens itself doesn't rely on this hierarchy.
const DEPARTMENT_LEAD: Record<Department, string> = {
  "Data & Analytics": "Ahmed Al-Hassan",
  "Digital Solutions": "Saad Al-Dawsari",
  "Business Systems": "Fatimah Al-Mutairi",
  Cybersecurity: "Khalid Al-Otaibi",
  "IT Service Support": "Abdullah Al-Harbi",
  Applications: "Yousef Al-Ghamdi",
};

export function getSupervisorName(employee: Pick<Employee, "name" | "department" | "supervisorNameOverride">): string {
  if (employee.supervisorNameOverride) return employee.supervisorNameOverride;
  const lead = DEPARTMENT_LEAD[employee.department];
  return employee.name === lead ? SUPERVISOR.name : lead;
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
