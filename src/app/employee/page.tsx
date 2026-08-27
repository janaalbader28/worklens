"use client";

import { Bell } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CapacityForecastChart } from "@/components/charts/CapacityForecastChart";
import { availableCapacity } from "@/lib/capacity";
import { toWeekSeries } from "@/lib/forecast";
import { useEmployeeSession } from "@/store/session-store";
import { useEmployees } from "@/store/employees-store";

export default function EmployeeDashboardPage() {
  const { employeeId } = useEmployeeSession();
  const { employees } = useEmployees();
  const me = employees.find((e) => e.id === employeeId) ?? employees[0];
  const firstName = me.name.split(" ")[0];
  const avail = availableCapacity(me.currentUtilization);
  const availHoursNextWeek = Math.round((avail / 100) * me.weeklyHours);
  const week4 = me.forecast8Week[3] ?? me.currentUtilization;

  const workloadRows = [
    { label: "Planned Work", hours: me.workload.project },
    { label: "Operational Support", hours: me.workload.operational },
    { label: "Ad-hoc", hours: me.workload.adhoc },
    { label: "Other", hours: me.workload.other },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Good morning, {firstName}</h1>
        <p className="mt-1 text-sm text-ink-muted">Here&rsquo;s your current capacity and workload outlook.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex flex-col items-center justify-center text-center py-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">Current Capacity</p>
          <p className="mt-2 text-4xl font-semibold text-ink tabular">{me.currentUtilization}%</p>
          <div className="mt-3">
            <StatusBadge utilization={me.currentUtilization} />
          </div>
        </Card>
        <Card className="flex flex-col justify-center gap-3 py-6">
          <Metric label="Active Tasks" value={String(me.upcomingTickets.length + me.adhoc.length)} />
          <Metric label="Tickets" value={String(me.upcomingTickets.length)} />
          <Metric label="Ad-hoc" value={String(me.adhoc.length)} />
        </Card>
        <Card className="flex flex-col items-center justify-center text-center py-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">Available Capacity</p>
          <p className="mt-2 text-4xl font-semibold text-ink tabular">{avail}%</p>
        </Card>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3.5">
        <Bell className="h-4 w-4 mt-0.5 shrink-0 text-brand-700" />
        <p className="text-sm text-brand-800">
          You currently have <span className="font-semibold">{availHoursNextWeek} hours</span> of available capacity
          next week.
        </p>
      </div>

      {week4 >= 80 && (
        <div className="flex items-start gap-3 rounded-xl border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] px-4 py-3.5">
          <Bell className="h-4 w-4 mt-0.5 shrink-0 text-[var(--status-warning)]" />
          <div className="text-sm text-ink">
            <p>
              Your capacity is expected to reach <span className="font-semibold">{week4}%</span> in Week 4.
            </p>
            <p className="mt-1 text-ink-secondary">
              If you expect additional work, consider submitting a handover or capacity note.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader title="Workload Breakdown" subtitle={`This week · ${me.weeklyHours}h schedule`} />
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
                  style={{ width: `${(row.hours / me.weeklyHours) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Upcoming Capacity" subtitle="Projected utilization over the next few weeks" />
        <CapacityForecastChart data={toWeekSeries(me.forecast8Week.slice(0, 4))} />
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-ink-muted">{label}</span>
      <span className="text-sm font-semibold tabular text-ink">{value}</span>
    </div>
  );
}
