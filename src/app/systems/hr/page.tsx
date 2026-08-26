"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Plus, Upload, Download, X } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { SourceSystemHeader, SourceSystemNotice } from "@/components/systems/SourceSystemHeader";
import { SystemPageShell } from "@/components/systems/SystemPageShell";
import { ClickableRow } from "@/components/systems/ClickableRow";
import { getSourceSystem } from "@/data/systems";
import { DEPARTMENTS } from "@/data/config";
import type { Department, Employee } from "@/data/types";
import { getAvailabilityStatus, getSupervisorName } from "@/lib/hr";
import { useEmployees } from "@/store/employees-store";

const AVAILABILITY_STYLES: Record<string, string> = {
  Available: "bg-[var(--status-good-bg)] border-[var(--status-good-border)] text-[var(--status-good)]",
  Unavailable: "bg-[var(--status-warning-bg)] border-[var(--status-warning-border)] text-[var(--status-warning)]",
  Limited: "bg-[var(--status-serious-bg)] border-[var(--status-serious-border)] text-[var(--status-serious)]",
};

const SCHEDULE = "Full-time · Sun–Thu · 8:00 AM–5:00 PM";

function makeEmployee(input: {
  name: string;
  title: string;
  department: Department;
  weeklyHours: number;
  skills: string;
  knowledgeAreas: string;
}): Employee {
  const idSlug = input.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const skills = input.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => ({ name, level: "Intermediate" as const }));
  const knowledgeAreas = input.knowledgeAreas
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return {
    id: `${idSlug}-${Date.now().toString(36)}`,
    name: input.name,
    title: input.title,
    department: input.department,
    supervisorId: "sup-001",
    employeeIdNumber: `EMP-${Math.floor(10000 + Math.random() * 89999)}`,
    skills,
    knowledgeAreas,
    workingSchedule: SCHEDULE,
    weeklyHours: input.weeklyHours,
    workload: { project: 0, operational: 0, adhoc: 0, other: 0 },
    currentUtilization: 0,
    futureCapacity: 0,
    forecast8Week: [0, 0, 0, 0, 0, 0, 0, 0],
    upcomingProjects: [],
    upcomingTickets: [],
    adhoc: [],
    leaveEvents: [],
  };
}

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function exportEmployeesCsv(employees: Employee[]) {
  const header = ["Employee ID", "Employee", "Position", "Department", "Supervisor", "Skills", "Working Hours", "Availability"];
  const rows = employees.map((e) => [
    e.employeeIdNumber,
    e.name,
    e.title,
    e.department,
    getSupervisorName(e),
    e.skills.map((s) => `${s.name} (${s.level})`).join("; "),
    `${e.weeklyHours}h/week`,
    getAvailabilityStatus(e),
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "worklens-hr-employees.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function HrSystemPage() {
  const system = getSourceSystem("hr");
  const { employees, addEmployee } = useEmployees();
  const [showAddForm, setShowAddForm] = useState(false);
  const [importNotice, setImportNotice] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  const sorted = useMemo(() => [...employees].sort((a, b) => a.name.localeCompare(b.name)), [employees]);

  return (
    <SystemPageShell>
      <SourceSystemHeader
        system={{ ...system, name: "HR System", subtitle: "Employee Master Data" }}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setImportNotice(true);
                window.setTimeout(() => setImportNotice(false), 3500);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-sm font-medium text-ink hover:bg-brand-50"
            >
              <Upload className="h-4 w-4" strokeWidth={1.75} />
              Import
            </button>
            <button
              onClick={() => {
                exportEmployeesCsv(sorted);
                setExportNotice(true);
                window.setTimeout(() => setExportNotice(false), 3500);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-sm font-medium text-ink hover:bg-brand-50"
            >
              <Download className="h-4 w-4" strokeWidth={1.75} />
              Export
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-800 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Add Employee
            </button>
          </div>
        }
      />

      <p className="text-sm text-ink-secondary">Central employee information used by WorkLens.</p>

      {importNotice && (
        <div className="rounded-lg border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          Import simulated — file processing is not implemented in this prototype.
        </div>
      )}

      {exportNotice && (
        <div className="rounded-lg border border-[var(--status-good-border)] bg-[var(--status-good-bg)] px-4 py-3 text-sm text-[var(--status-good)]">
          Exported {sorted.length} employees to worklens-hr-employees.csv.
        </div>
      )}

      <Card>
        <CardHeader title="Employees" subtitle={`Showing ${sorted.length} of 84 employees synced from HR (demo dataset)`} />
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-brand-50/60 text-left text-xs font-medium uppercase tracking-wide text-ink-secondary">
                <th className="px-4 py-3">Employee ID</th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Supervisor</th>
                <th className="px-4 py-3">Skills</th>
                <th className="px-4 py-3">Working Hours</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((e) => {
                const availability = getAvailabilityStatus(e);
                return (
                  <ClickableRow key={e.id} href={`/systems/hr/${e.id}`}>
                    <td className="px-4 py-3 tabular text-ink-secondary whitespace-nowrap">{e.employeeIdNumber}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-ink group-hover:text-brand-700 group-hover:underline underline-offset-2">
                        {e.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-secondary whitespace-nowrap">{e.title}</td>
                    <td className="px-4 py-3 text-ink-secondary whitespace-nowrap">{e.department}</td>
                    <td className="px-4 py-3 text-ink-secondary whitespace-nowrap">{getSupervisorName(e)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {e.skills.slice(0, 3).map((s) => (
                          <span key={s.name} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-800 whitespace-nowrap">
                            {s.name}
                          </span>
                        ))}
                        {e.skills.length > 3 && (
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-ink-muted">+{e.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular text-ink-secondary whitespace-nowrap">{e.weeklyHours}h/week</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${AVAILABILITY_STYLES[availability]}`}>
                        {availability}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <ChevronRight className="h-4 w-4 text-ink-muted" />
                    </td>
                  </ClickableRow>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <SourceSystemNotice>
        Prototype assumption: HR provides an approved employee master dataset containing the fields required for
        capacity planning.
      </SourceSystemNotice>

      {showAddForm && (
        <AddEmployeeModal
          onClose={() => setShowAddForm(false)}
          onSubmit={(input) => {
            addEmployee(makeEmployee(input));
            setShowAddForm(false);
          }}
        />
      )}
    </SystemPageShell>
  );
}

function AddEmployeeModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: { name: string; title: string; department: Department; weeklyHours: number; skills: string; knowledgeAreas: string }) => void;
}) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState<Department>(DEPARTMENTS[0]);
  const [weeklyHours, setWeeklyHours] = useState(40);
  const [skills, setSkills] = useState("");
  const [knowledgeAreas, setKnowledgeAreas] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-ink">Add Employee</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || !title.trim()) return;
            onSubmit({ name: name.trim(), title: title.trim(), department, weeklyHours, skills, knowledgeAreas });
          }}
        >
          <Field label="Full Name">
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" required />
          </Field>
          <Field label="Position">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Department">
              <select value={department} onChange={(e) => setDepartment(e.target.value as Department)} className="input">
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Working Hours / Week">
              <input
                type="number"
                min={1}
                max={60}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value) || 40)}
                className="input"
              />
            </Field>
          </div>
          <Field label="Skills (comma-separated)">
            <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="SQL, Python, Power BI" className="input" />
          </Field>
          <Field label="Knowledge Areas (comma-separated)">
            <input
              value={knowledgeAreas}
              onChange={(e) => setKnowledgeAreas(e.target.value)}
              placeholder="Reporting, Data Visualization"
              className="input"
            />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-brand-50">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-secondary">{label}</span>
      {children}
    </label>
  );
}
