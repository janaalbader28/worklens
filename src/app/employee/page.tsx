"use client";

import { useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { InfoTip } from "@/components/ui/InfoTip";
import { CapacityForecastChart } from "@/components/charts/CapacityForecastChart";
import { TaskDetailPanel } from "@/components/work/TaskDetailPanel";
import { availableCapacity } from "@/lib/capacity";
import { toWeekSeries } from "@/lib/forecast";
import { getDueStatus } from "@/lib/date";
import { computeEmployeeWorkItems, type DisplayStatus } from "@/lib/capacityEngine";
import { useEmployeeSession } from "@/store/session-store";
import { useEmployees } from "@/store/employees-store";
import { useTickets } from "@/store/tickets-store";
import { useWorkLog } from "@/store/work-log-store";

const STATUS_STYLES: Record<DisplayStatus, string> = {
  Completed: "bg-[var(--status-good-bg)] border-[var(--status-good-border)] text-[var(--status-good)]",
  "In Progress": "bg-brand-50 border-brand-100 text-brand-700",
  Blocked: "bg-[var(--status-critical-bg)] border-[var(--status-critical-border)] text-[var(--status-critical)]",
  "Not Started": "bg-brand-50/60 border-border-strong text-ink-secondary",
};

export default function EmployeeDashboardPage() {
  const { employeeId } = useEmployeeSession();
  const { employees } = useEmployees();
  const me = employees.find((e) => e.id === employeeId) ?? employees[0];
  const { tickets, updateTicketStatus, updateTicketPriority, updateTicketSkills, setTicketAssignees } = useTickets();
  const { getEntry } = useWorkLog();
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const firstName = me.name.split(" ")[0];
  const avail = availableCapacity(me.currentUtilization);
  const availHoursNextWeek = Math.round((avail / 100) * me.weeklyHours);
  const week4 = me.forecast8Week[3] ?? me.currentUtilization;

  const workItems = useMemo(() => computeEmployeeWorkItems(me, tickets, getEntry), [me, tickets, getEntry]);
  const activeWorkItems = workItems.filter((i) => i.status !== "Completed");
  const overdueCount = activeWorkItems.filter((i) => i.dueDate && getDueStatus(i.dueDate) === "Overdue").length;
  const dueSoonCount = activeWorkItems.filter((i) => i.dueDate && getDueStatus(i.dueDate) === "Due Soon").length;
  const detailTicket = openTicketId ? tickets.find((t) => t.id === openTicketId) ?? null : null;

  const operationalHours = activeWorkItems.filter((i) => i.type === "Ticket").reduce((sum, i) => sum + i.remainingHours, 0);
  const adhocHours = activeWorkItems.filter((i) => i.type === "Ad-hoc").reduce((sum, i) => sum + i.remainingHours, 0);
  const workloadRows = [
    { label: "Planned Work", hours: 0 },
    { label: "Operational Support", hours: Math.round(operationalHours * 10) / 10 },
    { label: "Ad-hoc", hours: Math.round(adhocHours * 10) / 10 },
    { label: "Other", hours: 0 },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Good morning, {firstName}</h1>
        <p className="mt-1 text-sm text-ink-muted">Here&rsquo;s your current capacity and workload outlook.</p>
      </div>

      {detailError && (
        <p className="rounded-lg border border-[var(--status-critical-border)] bg-[var(--status-critical-bg)] px-4 py-3 text-sm text-[var(--status-critical)]">
          {detailError}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card className="flex flex-col items-center justify-center text-center py-6">
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-secondary">
            Current Utilization
            <InfoTip text="Remaining work hours across your active tickets and ad-hoc items, ÷ your weekly working hours × 100. Completing an item or logging progress lowers this immediately." />
          </div>
          <p className="mt-2 text-4xl font-semibold text-ink tabular">{me.currentUtilization}%</p>
          <div className="mt-3">
            <StatusBadge utilization={me.currentUtilization} />
          </div>
        </Card>
        <Card className="flex flex-col items-center justify-center text-center py-6">
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-secondary">
            Available Capacity
            <InfoTip text="Your weekly working hours minus your remaining active work hours." />
          </div>
          <p className="mt-2 text-4xl font-semibold text-ink tabular">{avail}%</p>
        </Card>
        <Card className="flex flex-col items-center justify-center text-center py-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">Active Work</p>
          <p className="mt-2 text-4xl font-semibold text-ink tabular">{activeWorkItems.length}</p>
        </Card>
        <Card className="flex flex-col items-center justify-center text-center py-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">Overdue</p>
          <p className={`mt-2 text-4xl font-semibold tabular ${overdueCount > 0 ? "text-[var(--status-critical)]" : "text-ink"}`}>
            {overdueCount}
          </p>
        </Card>
        <Card className="flex flex-col items-center justify-center text-center py-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">Due Soon</p>
          <p className={`mt-2 text-4xl font-semibold tabular ${dueSoonCount > 0 ? "text-[var(--status-warning)]" : "text-ink"}`}>
            {dueSoonCount}
          </p>
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
        <CardHeader title="My Work" subtitle="Your currently assigned tickets and ad-hoc items" />
        {activeWorkItems.length === 0 ? (
          <p className="text-sm text-ink-muted py-4">No active work assigned right now.</p>
        ) : (
          <ul className="divide-y divide-border">
            {activeWorkItems.map((item) => (
              <li
                key={item.key}
                onClick={item.ticketId ? () => setOpenTicketId(item.ticketId!) : undefined}
                onKeyDown={(e) => item.ticketId && e.key === "Enter" && setOpenTicketId(item.ticketId!)}
                role={item.ticketId ? "button" : undefined}
                tabIndex={item.ticketId ? 0 : undefined}
                className={`flex flex-wrap items-center justify-between gap-3 py-3 ${
                  item.ticketId ? "cursor-pointer rounded-lg px-2 -mx-2 outline-none hover:bg-brand-50/40 focus:bg-brand-50/40 transition-colors" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{item.title}</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {item.type} · Due {item.dueDate ?? "No deadline"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="tabular text-xs text-ink-secondary">{item.progress}%</span>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[item.status]}`}>
                    {item.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Upcoming Capacity" subtitle="Forecast based on currently assigned work — next 8 weeks" />
        <CapacityForecastChart data={toWeekSeries(me.forecast8Week)} />
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
          <LegendDash color="var(--status-warning)" label="80% recommended capacity threshold" />
          <LegendDash color="var(--status-critical)" label="95% overload threshold" />
        </div>
      </Card>

      {detailTicket && (
        <TaskDetailPanel
          ticket={detailTicket}
          employees={employees}
          currentUserName={me.name}
          onClose={() => setOpenTicketId(null)}
          onUpdateStatus={(status) => updateTicketStatus(detailTicket.id, status).catch(() => setDetailError("Couldn't update status — check your connection and try again."))}
          onUpdatePriority={(priority) => updateTicketPriority(detailTicket.id, priority).catch(() => setDetailError("Couldn't update priority — check your connection and try again."))}
          onUpdateSkills={(skills) => updateTicketSkills(detailTicket.id, skills).catch(() => setDetailError("Couldn't update skills — check your connection and try again."))}
          onUpdateAssignees={(ids) => setTicketAssignees(detailTicket.id, ids).catch(() => setDetailError("Couldn't update assignees — check your connection and try again."))}
        />
      )}
    </div>
  );
}

function LegendDash({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-0.5 w-3.5 rounded-full" style={{ background: color, opacity: 0.7 }} />
      {label}
    </span>
  );
}
