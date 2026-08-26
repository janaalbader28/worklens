"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarClock, Repeat2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge, PriorityBadge } from "@/components/ui/StatusBadge";
import { SkillLevelBar } from "@/components/ui/ProgressBar";
import { CapacityForecastChart } from "@/components/charts/CapacityForecastChart";
import { useEmployees } from "@/store/employees-store";
import { availableCapacity } from "@/lib/capacity";
import { toWeekSeries } from "@/lib/forecast";
import { getDueStatus, type DueStatus } from "@/lib/date";
import { useTickets } from "@/store/tickets-store";

const DUE_STYLES: Record<DueStatus, string> = {
  Overdue: "bg-[var(--status-critical-bg)] border-[var(--status-critical-border)] text-[var(--status-critical)]",
  "Due Soon": "bg-[var(--status-warning-bg)] border-[var(--status-warning-border)] text-[var(--status-warning)]",
  "On Track": "bg-[var(--status-good-bg)] border-[var(--status-good-border)] text-[var(--status-good)]",
};

export default function EmployeeDetailsPage() {
  const params = useParams<{ id: string }>();
  const { employees } = useEmployees();
  const employee = employees.find((e) => e.id === params.id);
  const { tickets } = useTickets();

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

  const assignedTickets = tickets.filter((t) => t.assignedEmployeeId === employee.id);
  const totalHours = employee.workload.project + employee.workload.operational + employee.workload.adhoc + employee.workload.other;
  const avail = availableCapacity(employee.currentUtilization);
  const initials = employee.name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  const workloadRows: { label: string; hours: number }[] = [
    { label: "Project Work", hours: employee.workload.project },
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
            <p className="text-sm text-ink-secondary">
              {employee.title} · {employee.department}
            </p>
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
          <CardHeader title="Skills" subtitle="From HR employee master data" />
          <div className="space-y-3.5">
            {employee.skills.map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-4">
                <span className="text-sm text-ink w-32 shrink-0">{s.name}</span>
                <SkillLevelBar level={s.level} />
              </div>
            ))}
          </div>
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
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader title="Projects" />
            {employee.upcomingProjects.length === 0 ? (
              <EmptyState label="No upcoming projects." />
            ) : (
              <ul className="space-y-3">
                {employee.upcomingProjects.map((p) => {
                  const due = getDueStatus(p.deadline);
                  return (
                    <li key={p.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-ink">{p.name}</p>
                        <PriorityBadge priority={p.priority} />
                      </div>
                      <p className="mt-1 text-xs text-ink-muted">{p.role}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-ink-secondary">
                        <span className="flex items-center gap-1">
                          <CalendarClock className="h-3.5 w-3.5" /> Due: {p.deadline}
                        </span>
                        <span className="tabular">{p.hoursPerWeek}h/wk</span>
                      </div>
                      <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${DUE_STYLES[due]}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {due}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="Tickets" />
            {employee.upcomingTickets.length === 0 && assignedTickets.length === 0 ? (
              <EmptyState label="No open tickets." />
            ) : (
              <ul className="space-y-3">
                {employee.upcomingTickets.map((t) => {
                  const due = getDueStatus(t.deadline);
                  return (
                    <li key={t.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-ink">{t.title}</p>
                        <PriorityBadge priority={t.priority} />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-ink-secondary">
                        <span>Due: {t.deadline}</span>
                        <span className="tabular">{t.estimatedHours}h</span>
                      </div>
                      <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${DUE_STYLES[due]}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {due}
                      </span>
                    </li>
                  );
                })}
                {assignedTickets.map((t) => {
                  const due = getDueStatus(t.expectedResolutionDate);
                  return (
                    <li key={t.id} className="rounded-lg border border-brand-100 bg-brand-50/40 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-ink">
                          {t.title} <span className="text-xs font-normal text-ink-muted">({t.id})</span>
                        </p>
                        <PriorityBadge priority={t.priority} />
                      </div>
                      <p className="mt-1 text-[11px] text-brand-700">Newly assigned from IT Ticket System</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-ink-secondary">
                        <span>Expected: {t.expectedResolutionDate}</span>
                        <span className="tabular">{t.estimatedHours}h</span>
                      </div>
                      <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${DUE_STYLES[due]}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {due}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="Ad-hoc Activities" />
            {employee.adhoc.length === 0 ? (
              <EmptyState label="No ad-hoc activities." />
            ) : (
              <ul className="space-y-3">
                {employee.adhoc.map((a) => (
                  <li key={a.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-ink">{a.name}</p>
                      <PriorityBadge priority={a.priority} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-ink-secondary">
                      <span>{a.deadline}</span>
                      <span className="tabular">{a.estimatedHours}h</span>
                    </div>
                  </li>
                ))}
              </ul>
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
