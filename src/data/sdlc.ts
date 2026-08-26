// Mock response shape for the SDLC System's API, e.g. GET /api/sdlc/activities.

import type { Department } from "./types";

export interface SdlcActivity {
  id: string;
  application: string;
  activity: string;
  description: string;
  stage: "Planning" | "Development" | "Testing" | "Deployment";
  assignedUnit: Department;
  assignedEmployee?: string;
  estimatedHours: number;
  startDate: string;
  deadline: string;
  status: "Planned" | "In Progress" | "Testing" | "Completed";
  relatedMilestone: string;
}

export const SDLC_ACTIVITIES: SdlcActivity[] = [
  {
    id: "sdlc-001",
    application: "HR Portal",
    activity: "API Development",
    description: "Develop REST APIs required to support employee profile and HR analytics functionality.",
    stage: "Development",
    assignedUnit: "Applications",
    assignedEmployee: "Ahmed Al-Hassan",
    estimatedHours: 40,
    startDate: "01 Sep 2026",
    deadline: "20 Sep 2026",
    status: "In Progress",
    relatedMilestone: "HR Portal v2.0 Release",
  },
  {
    id: "sdlc-002",
    application: "Analytics Platform",
    activity: "Data Pipeline Testing",
    description: "Test the reliability and accuracy of the analytics platform's nightly data pipeline.",
    stage: "Testing",
    assignedUnit: "Data & Analytics",
    assignedEmployee: "Sara Al-Qahtani",
    estimatedHours: 24,
    startDate: "15 Sep 2026",
    deadline: "25 Sep 2026",
    status: "Testing",
    relatedMilestone: "Analytics Platform GA",
  },
  {
    id: "sdlc-003",
    application: "Employee App",
    activity: "UI Enhancement",
    description: "Improve navigation and accessibility across the Employee App's core screens.",
    stage: "Development",
    assignedUnit: "Applications",
    estimatedHours: 32,
    startDate: "20 Sep 2026",
    deadline: "01 Oct 2026",
    status: "Planned",
    relatedMilestone: "Employee App 3.1",
  },
  {
    id: "sdlc-004",
    application: "Self-Service Portal",
    activity: "Backend API Hardening",
    description: "Add rate limiting, input validation and error handling to the self-service portal's backend APIs.",
    stage: "Development",
    assignedUnit: "Applications",
    assignedEmployee: "Haifa Al-Turki",
    estimatedHours: 36,
    startDate: "01 Sep 2026",
    deadline: "22 Sep 2026",
    status: "In Progress",
    relatedMilestone: "Self-Service Portal Beta",
  },
  {
    id: "sdlc-005",
    application: "Self-Service Portal",
    activity: "Frontend Component Library",
    description: "Build the shared UI component library used across the self-service portal.",
    stage: "Development",
    assignedUnit: "Applications",
    assignedEmployee: "Reem Al-Shammari",
    estimatedHours: 28,
    startDate: "01 Sep 2026",
    deadline: "22 Sep 2026",
    status: "In Progress",
    relatedMilestone: "Self-Service Portal Beta",
  },
  {
    id: "sdlc-006",
    application: "Self-Service Portal",
    activity: "Release Regression Testing",
    description: "Run full regression testing ahead of the self-service portal's beta release.",
    stage: "Testing",
    assignedUnit: "Applications",
    assignedEmployee: "Faisal Al-Qahtani",
    estimatedHours: 20,
    startDate: "12 Sep 2026",
    deadline: "18 Sep 2026",
    status: "Planned",
    relatedMilestone: "Self-Service Portal Beta",
  },
  {
    id: "sdlc-007",
    application: "Data Warehouse",
    activity: "Migration Scripting",
    description: "Write and validate the scripts used to migrate historical data into the new warehouse.",
    stage: "Development",
    assignedUnit: "Data & Analytics",
    assignedEmployee: "Turki Al-Anazi",
    estimatedHours: 45,
    startDate: "10 Sep 2026",
    deadline: "28 Sep 2026",
    status: "In Progress",
    relatedMilestone: "Data Warehouse Cutover",
  },
  {
    id: "sdlc-008",
    application: "Procurement Module",
    activity: "Production Cutover",
    description: "Execute the production cutover for the procurement module's final rollout region.",
    stage: "Deployment",
    assignedUnit: "Business Systems",
    assignedEmployee: "Omar Al-Rashid",
    estimatedHours: 16,
    startDate: "16 Sep 2026",
    deadline: "18 Sep 2026",
    status: "Planned",
    relatedMilestone: "ERP Procurement Go-Live",
  },
  {
    id: "sdlc-009",
    application: "Analytics Platform",
    activity: "Dashboard Wireframes",
    description: "Produce wireframes for the new analytics platform dashboards ahead of development.",
    stage: "Planning",
    assignedUnit: "Data & Analytics",
    assignedEmployee: "Maha Al-Subaie",
    estimatedHours: 12,
    startDate: "28 Aug 2026",
    deadline: "05 Sep 2026",
    status: "Completed",
    relatedMilestone: "Analytics Platform GA",
  },
  {
    id: "sdlc-010",
    application: "SOC Tooling",
    activity: "Alert Rule Automation",
    description: "Automate SIEM alert rule deployment to reduce manual SOC tooling overhead.",
    stage: "Development",
    assignedUnit: "Cybersecurity",
    assignedEmployee: "Khalid Al-Otaibi",
    estimatedHours: 22,
    startDate: "02 Sep 2026",
    deadline: "12 Sep 2026",
    status: "In Progress",
    relatedMilestone: "SOC Tooling Refresh",
  },
];

export const SDLC_TOTAL_RECORDS = 312;
