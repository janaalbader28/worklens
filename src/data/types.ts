export type Department =
  | "Data & Analytics"
  | "Digital Solutions"
  | "Business Systems"
  | "Cybersecurity"
  | "IT Service Support"
  | "Applications";

/** A "unit" is the same organizational grouping as a Department, named for contexts
 * (supervisor login, ticket routing) where "unit" is the more natural term. */
export type Unit = Department;

export type WorkflowStatus = "Not Started" | "In Progress" | "Blocked" | "Completed";

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface Skill {
  name: string;
  level: SkillLevel;
}

export interface WorkloadBreakdown {
  project: number;
  operational: number;
  adhoc: number;
  other: number;
}

export interface UpcomingProject {
  id: string;
  name: string;
  role: string;
  priority: "High" | "Medium" | "Low";
  deadline: string;
  hoursPerWeek: number;
  status: "On Track" | "At Risk" | "Delayed";
}

export interface UpcomingTicket {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  deadline: string;
  estimatedHours: number;
  status: "Open" | "In Progress" | "Queued";
}

export interface AdhocItem {
  id: string;
  name: string;
  priority: "High" | "Medium" | "Low";
  deadline: string;
  estimatedHours: number;
  status: "Open" | "In Progress" | "Queued";
}

export interface LeaveEvent {
  id: string;
  type: "Annual Leave" | "Public Holiday" | "Training" | "Sick Leave";
  start: string;
  end: string;
}

export interface Employee {
  id: string;
  name: string;
  title: string;
  department: Department;
  supervisorId: string | null;
  employeeIdNumber: string;
  /** Editable via the HR System's employee profile; falls back to a derived address when unset. */
  email?: string;
  /** Editable via the HR System's employee profile; falls back to a derived status when unset. */
  availabilityOverride?: "Available" | "Unavailable";
  /** Editable via the HR System's employee profile; falls back to the department lead when unset. */
  supervisorNameOverride?: string;
  skills: Skill[];
  knowledgeAreas: string[];
  workingSchedule: string;
  weeklyHours: number;
  workload: WorkloadBreakdown;
  currentUtilization: number;
  futureCapacity: number;
  forecast8Week: number[];
  upcomingProjects: UpcomingProject[];
  upcomingTickets: UpcomingTicket[];
  adhoc: AdhocItem[];
  leaveEvents: LeaveEvent[];
}
