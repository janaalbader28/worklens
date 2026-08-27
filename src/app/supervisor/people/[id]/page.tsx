"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, Repeat2, X } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SkillLevelBar } from "@/components/ui/ProgressBar";
import { CapacityForecastChart } from "@/components/charts/CapacityForecastChart";
import { WorkItemRow, type WorkRow } from "@/components/work/WorkItemRow";
import type { SkillLevel } from "@/data/types";
import { useEmployees } from "@/store/employees-store";
import { useSupervisorSession } from "@/store/session-store";
import { getDepartmentSupervisor } from "@/lib/hr";
import { availableCapacity } from "@/lib/capacity";
import { toWeekSeries } from "@/lib/forecast";
import { useTickets } from "@/store/tickets-store";

const SKILL_LEVELS: SkillLevel[] = ["Beginner", "Intermediate", "Advanced", "Expert"];

export default function EmployeeDetailsPage() {
  const params = useParams<{ id: string }>();
  const { employees, updateEmployee } = useEmployees();
  const employee = employees.find((e) => e.id === params.id);
  const { tickets } = useTickets();
  const { unit } = useSupervisorSession();
  const currentUserName = getDepartmentSupervisor(unit, employees)?.name ?? "Supervisor";
  const [skillDraft, setSkillDraft] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("Beginner");
  const [skillError, setSkillError] = useState<string | null>(null);

  async function addSkill() {
    if (!employee) return;
    const name = skillDraft.trim();
    if (!name || employee.skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setSkillDraft("");
      return;
    }
    setSkillError(null);
    try {
      await updateEmployee(employee.id, { skills: [...employee.skills, { name, level: skillLevel }] });
      setSkillDraft("");
    } catch {
      setSkillError("Couldn't save this skill — check your connection and try again.");
    }
  }

  async function removeSkill(name: string) {
    if (!employee) return;
    setSkillError(null);
    try {
      await updateEmployee(employee.id, { skills: employee.skills.filter((s) => s.name !== name) });
    } catch {
      setSkillError("Couldn't remove this skill — check your connection and try again.");
    }
  }

  if (!employee) {
    return (
      <div className="max-w-6xl space-y-4">
        <Link href="/supervisor/team-capacity" className="inline-flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          Back to Team Capacity
        </Link>
        <p className="text-sm text-ink-muted">Employee not found.</p>
      </div>
    );
  }

  const assignedTickets = tickets.filter((t) => (t.assignedEmployeeIds ?? []).includes(employee.id));

  const ticketRows: WorkRow[] = [
    ...employee.upcomingTickets.map((t) => ({
      key: `${employee.id}:${t.id}`,
      title: t.title,
      type: "Ticket" as const,
      priority: t.priority,
      deadline: t.deadline,
      estimatedHours: t.estimatedHours,
    })),
    ...assignedTickets.map((t) => ({
      key: `${employee.id}:${t.id}`,
      title: `${t.title} (${t.id})`,
      type: "Ticket" as const,
      priority: t.priority,
      deadline: t.expectedResolutionDate,
      estimatedHours: t.estimatedHours,
    })),
  ];
  const adhocRows: WorkRow[] = employee.adhoc.map((a) => ({
    key: `${employee.id}:${a.id}`,
    title: a.name,
    type: "Ad-hoc",
    priority: a.priority,
    deadline: a.deadline,
    estimatedHours: a.estimatedHours,
  }));
  const totalHours = employee.workload.project + employee.workload.operational + employee.workload.adhoc + employee.workload.other;
  const avail = availableCapacity(employee.currentUtilization);
  const initials = employee.name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  const workloadRows: { label: string; hours: number }[] = [
    { label: "Planned Work", hours: employee.workload.project },
    { label: "Operational Tickets", hours: employee.workload.operational },
    { label: "Ad-hoc Work", hours: employee.workload.adhoc },
    { label: "Other Commitments", hours: employee.workload.other },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      <Link href="/supervisor/team-capacity" className="inline-flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Back to Team Capacity
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 shrink-0 rounded-full bg-brand-800 text-white text-lg font-semibold flex items-center justify-center">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink tracking-tight">{employee.name}</h1>
            <p className="text-sm text-ink-secondary">{employee.department}</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {employee.employeeIdNumber} · {employee.workingSchedule}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge utilization={employee.currentUtilization} />
          <Link
            href={`/supervisor/handover?employee=${employee.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-sm font-medium text-ink hover:bg-brand-50"
          >
            <Repeat2 className="h-4 w-4" />
            Simulate Absence
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">Total Workload</p>
          <p className="mt-1.5 text-2xl font-semibold text-ink tabular">
            {totalHours} <span className="text-base font-normal text-ink-muted">/ {employee.weeklyHours} hrs</span>
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">Current Capacity</p>
          <p className="mt-1.5 text-2xl font-semibold text-ink tabular">{employee.currentUtilization}%</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">Available Capacity</p>
          <p className="mt-1.5 text-2xl font-semibold text-ink tabular">{avail}%</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Skills" subtitle="Editable — changes reflect in the HR System too" />
          <div className="space-y-3.5">
            {employee.skills.map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-4">
                <span className="text-sm text-ink w-32 shrink-0">{s.name}</span>
                <div className="flex flex-1 items-center gap-3">
                  <SkillLevelBar level={s.level} />
                </div>
                <button
                  onClick={() => removeSkill(s.name)}
                  className="shrink-0 text-ink-muted hover:text-ink"
                  aria-label={`Remove ${s.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {employee.skills.length === 0 && <p className="text-sm text-ink-muted">No skills on record.</p>}
          </div>

          <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-2">
            <input
              value={skillDraft}
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="New or existing skill name…"
              className="input flex-1 min-w-[220px]"
            />
            <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value as SkillLevel)} className="input max-w-[140px]">
              {SKILL_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <button
              onClick={addSkill}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-800 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Add Skill
            </button>
          </div>
          {skillError && <p className="mt-2 text-xs font-medium text-[var(--status-critical)]">{skillError}</p>}
        </Card>

        <Card>
          <CardHeader title="Workload Breakdown" subtitle={`${totalHours} of ${employee.weeklyHours} hours allocated`} />
          <div className="space-y-4">
            {workloadRows.map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-ink-secondary">{row.label}</span>
                  <span className="tabular font-medium text-ink">{row.hours}h</span>
                </div>
                <div className="h-1.5 rounded-full bg-brand-50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{ width: `${(row.hours / employee.weeklyHours) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Future Capacity" subtitle="Projected utilization over the next 8 weeks" />
        <CapacityForecastChart data={toWeekSeries(employee.forecast8Week)} />
      </Card>

      <div>
        <h2 className="text-sm font-semibold text-ink mb-3">Current Work</h2>
        <p className="mb-3 text-xs text-ink-muted">Click a task to view details, update its status, and add notes.</p>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Tickets" />
            {ticketRows.length === 0 ? (
              <EmptyState label="No open tickets." />
            ) : (
              <div className="space-y-3">
                {ticketRows.map((row) => (
                  <WorkItemRow key={row.key} row={row} currentUserName={currentUserName} />
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Ad-hoc Activities" />
            {adhocRows.length === 0 ? (
              <EmptyState label="No ad-hoc activities." />
            ) : (
              <div className="space-y-3">
                {adhocRows.map((row) => (
                  <WorkItemRow key={row.key} row={row} currentUserName={currentUserName} />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader title="Leave / Availability" />
        {employee.leaveEvents.length === 0 ? (
          <EmptyState label="No upcoming leave scheduled." />
        ) : (
          <ul className="space-y-3">
            {employee.leaveEvents.map((l) => (
              <li key={l.id} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium text-ink">{l.type}</p>
                <p className="mt-1 text-xs text-ink-secondary">
                  {l.start} – {l.end}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="text-sm text-ink-muted py-4">{label}</p>;
}
