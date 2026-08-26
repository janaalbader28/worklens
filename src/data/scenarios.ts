export const DEFAULT_SCENARIO_PROJECT = {
  name: "HR Predictive Analytics Dashboard",
  startDate: "01 September 2026",
  durationWeeks: 8,
  estimatedHours: 240,
  priority: "High" as const,
  requiredSkills: ["Python", "SQL", "Power BI", "Data Analytics"],
};

export const DEFAULT_CANDIDATES = [
  { employeeId: "sara-al-qahtani", skillMatch: 94, currentUtilization: 72, projectedUtilization: 89 },
  { employeeId: "ahmed-al-hassan", skillMatch: 91, currentUtilization: 96, projectedUtilization: 121 },
  { employeeId: "mohammed-al-salem", skillMatch: 86, currentUtilization: 64, projectedUtilization: 82 },
];

export const DEFAULT_ALLOCATION_SCENARIOS = [
  {
    id: "A",
    label: "Scenario A",
    description: "Assign to Ahmed",
    assignees: [{ employeeId: "ahmed-al-hassan", projected: 121 }],
    overallProjected: 121,
    recommended: false,
  },
  {
    id: "B",
    label: "Scenario B",
    description: "Assign to Sara",
    assignees: [{ employeeId: "sara-al-qahtani", projected: 89 }],
    overallProjected: 89,
    recommended: false,
  },
  {
    id: "C",
    label: "Scenario C",
    description: "Split between Sara + Mohammed",
    assignees: [
      { employeeId: "sara-al-qahtani", projected: 78 },
      { employeeId: "mohammed-al-salem", projected: 74 },
    ],
    overallProjected: 78,
    recommended: true,
  },
];

export const RECOMMENDATION_REASONS = [
  "Required skills covered",
  "Strong skill match",
  "Sufficient available capacity",
  "No major deadline conflicts",
  "Lower projected overload risk",
  "Maintains sustainable capacity",
];

export const HANDOVER_DEFAULT = {
  employeeId: "sara-al-qahtani",
  unavailableStart: "10 September 2026",
  unavailableEnd: "17 September 2026",
  affectedWork: [
    { name: "Power BI Dashboard", type: "Project", hours: 8 },
    { name: "SQL Report", type: "Project", hours: 5 },
    { name: "Operational Ticket Queue", type: "Operational", hours: 6 },
  ],
  candidates: [
    {
      employeeId: "mohammed-al-salem",
      skillMatch: 91,
      availableCapacity: 24,
      projectedCapacity: 79,
      recommendation: "Best Match" as const,
    },
    {
      employeeId: "fatimah-al-mutairi",
      skillMatch: 84,
      availableCapacity: 13,
      projectedCapacity: 91,
      recommendation: "Higher Risk" as const,
    },
  ],
};
