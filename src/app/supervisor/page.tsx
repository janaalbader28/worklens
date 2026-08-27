"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Users, Gauge, CalendarClock, Ticket, AlertTriangle, ShieldAlert, ChevronRight, Ban, TrendingUp } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { InfoTip } from "@/components/ui/InfoTip";
import { CapacityForecastChart } from "@/components/charts/CapacityForecastChart";
import { CapacityDistributionBar } from "@/components/charts/CapacityDistributionBar";
import { useTickets } from "@/store/tickets-store";
import { useSupervisorSession } from "@/store/session-store";
import { useEmployees } from "@/store/employees-store";
import { useWorkLog } from "@/store/work-log-store";
import { computeDashboardSummary, type AttentionTone } from "@/lib/dashboardSummary";

const ATTENTION_STYLES: Record<AttentionTone, { icon: typeof AlertTriangle; text: string; bg: string; border: string; label: string }> = {
  critical: { icon: AlertTriangle, text: "text-[var(--status-critical)]", bg: "bg-[var(--status-critical-bg)]", border: "border-[var(--status-critical-border)]", label: "🔴" },
  serious: { icon: ShieldAlert, text: "text-[var(--status-serious)]", bg: "bg-[var(--status-serious-bg)]", border: "border-[var(--status-serious-border)]", label: "🟠" },
  warning: { icon: CalendarClock, text: "text-[var(--status-warning)]", bg: "bg-[var(--status-warning-bg)]", border: "border-[var(--status-warning-border)]", label: "🟡" },
  info: { icon: Ban, text: "text-brand-700", bg: "bg-brand-50", border: "border-brand-100", label: "🔵" },
};

export default function SupervisorDashboardPage() {
  const { unit } = useSupervisorSession();
  const { tickets } = useTickets();
  const { employees } = useEmployees();
  const { getEntry } = useWorkLog();

  const summary = useMemo(() => computeDashboardSummary(unit, employees, tickets, getEntry), [unit, employees, tickets, getEntry]);

  const progressDistribution = [
    { key: "completed", label: "Completed", value: summary.teamProgress.completed, color: "var(--status-good)" },
    { key: "inProgress", label: "In Progress", value: summary.teamProgress.inProgress, color: "var(--brand-600)" },
    { key: "notStarted", label: "Not Started", value: summary.teamProgress.notStarted, color: "var(--border-strong)" },
  ];

  const deliveryDistribution = [
    { key: "completed", label: "Completed", value: summary.workDelivery.completed, color: "var(--status-good)" },
    { key: "inProgress", label: "In Progress", value: summary.workDelivery.inProgress, color: "var(--brand-600)" },
    { key: "overdue", label: "Overdue", value: summary.workDelivery.overdue, color: "var(--status-critical)" },
  ];

  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{unit}</p>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Supervisor Dashboard</h1>
        <p className="mt-1 text-sm text-ink-muted">Live view of your team&rsquo;s capacity, progress and delivery.</p>
      </div>

      {/* KPI overview */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Team Members" value={String(summary.teamMembers)} icon={<Users className="h-4 w-4" />} info="teamMembers" />
        <KpiCard
          label="Available Capacity"
          value={`${summary.totalAvailableHours}h`}
          hint={`${summary.availableCapacityPct}% of team capacity`}
          tone="good"
          icon={<Gauge className="h-4 w-4" />}
          info="availableCapacity"
        />
        <KpiCard
          label="On Leave"
          value={String(summary.onLeaveCount)}
          tone={summary.onLeaveCount > 0 ? "warning" : "neutral"}
          icon={<CalendarClock className="h-4 w-4" />}
          info="onLeave"
        />
        <KpiCard label="Open Tickets" value={String(summary.openTicketsCount)} icon={<Ticket className="h-4 w-4" />} info="openTickets" />
        <KpiCard
          label="Overdue Work"
          value={String(summary.overdueWorkCount)}
          tone={summary.overdueWorkCount > 0 ? "serious" : "neutral"}
          icon={<AlertTriangle className="h-4 w-4" />}
          info="overdueWork"
        />
        <KpiCard
          label="At Risk"
          value={String(summary.atRiskCount)}
          tone={summary.atRiskCount > 0 ? "warning" : "neutral"}
          icon={<TrendingUp className="h-4 w-4" />}
          info="atRisk"
        />
      </div>

      {/* Team Progress + Work Delivery */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Team Progress" subtitle="Where active work currently stands, by status" />
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-secondary">Overall team progress</span>
              <InfoTip text="Average completion across all active and completed work — uses each item's logged progress % where available, otherwise a status-based estimate (In Progress ≈ 50%, Blocked ≈ 25%, Not Started = 0%, Completed = 100%)." />
            </div>
            <span className="tabular text-sm font-semibold text-ink">{summary.teamProgress.overallPercent}%</span>
          </div>
          <div className="mb-5 h-2 rounded-full bg-brand-50 overflow-hidden">
            <div className="h-full rounded-full bg-brand-600" style={{ width: `${summary.teamProgress.overallPercent}%` }} />
          </div>
          <CapacityDistributionBar data={progressDistribution} />
        </Card>

        <Card>
          <CardHeader title="Work Delivery" subtitle="Are we actually getting the work done?" />
          <CapacityDistributionBar data={deliveryDistribution} />
        </Card>
      </div>

      {/* 8-Week Capacity Outlook */}
      <Card>
        <CardHeader title="8-Week Capacity Outlook" subtitle="Expected team utilization based on currently planned work." />
        <CapacityForecastChart data={summary.forecast8Week} />
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
          <LegendDash color="var(--status-warning)" label="80% recommended capacity threshold" />
          <LegendDash color="var(--status-critical)" label="95% overload threshold" />
        </div>
        <p className="mt-3 text-xs text-ink-muted border-t border-border pt-3">
          <span className="font-medium text-ink-secondary">Forecast</span> ≠ <span className="font-medium text-ink-secondary">What-If</span> —
          this is the expected future based on existing plans. To test a hypothetical change, use{" "}
          <Link href="/supervisor/what-if" className="text-brand-700 hover:underline">
            What-If
          </Link>
          .
        </p>
      </Card>

      {/* Team Capacity at a Glance */}
      <div>
        <div className="mb-3 flex items-center gap-1.5">
          <h2 className="text-sm font-semibold text-ink">Team Capacity at a Glance</h2>
          <InfoTip text="Utilization = active remaining work hours ÷ weekly working hours × 100. Available capacity = weekly working hours − active remaining work hours. Completed work and logged progress reduce active hours immediately." />
        </div>
        {summary.employeeCapacities.length === 0 ? (
          <Card className="flex items-center gap-3 text-sm text-ink-secondary">
            <Users className="h-4 w-4 text-ink-muted" />
            No employees are currently recorded under {unit}.
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {summary.employeeCapacities.map((row) => (
              <Link
                key={row.employee.id}
                href={`/supervisor/people/${row.employee.id}`}
                className="rounded-xl border border-border bg-surface p-4 shadow-sm transition-colors hover:bg-brand-50/40 hover:border-brand-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-brand-800 text-white text-xs font-semibold flex items-center justify-center">
                      {row.employee.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0 leading-tight">
                      <p className="truncate text-sm font-medium text-ink">{row.employee.name}</p>
                      <p className="truncate text-xs text-ink-muted">{row.activeItems} active item{row.activeItems === 1 ? "" : "s"}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-ink-secondary">{row.capacity.utilization}% utilized</span>
                  <span className="tabular font-medium text-ink">{row.capacity.availableHours}h available</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-brand-50 overflow-hidden">
                  <div className={`h-full rounded-full ${row.status.dot}`} style={{ width: `${Math.min(100, row.capacity.utilization)}%` }} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${row.status.bg} ${row.status.border} ${row.status.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${row.status.dot}`} />
                    {row.status.label}
                  </span>
                  {row.onLeave && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--status-warning)]">
                      <CalendarClock className="h-3 w-3" />
                      {row.onLeave === "Now" ? "On Leave" : "Upcoming Leave"}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Attention Required */}
      {summary.attentionItems.length > 0 && (
        <Card>
          <CardHeader title="Attention Required" subtitle="The most important things that need a decision" />
          <ul className="space-y-2.5">
            {summary.attentionItems.map((item, i) => {
              const style = ATTENTION_STYLES[item.tone];
              return (
                <li key={i}>
                  <Link
                    href={item.href}
                    className={`flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors hover:brightness-[0.98] ${style.bg} ${style.border}`}
                  >
                    <style.icon className={`h-4 w-4 mt-0.5 shrink-0 ${style.text}`} strokeWidth={2} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold uppercase tracking-wide ${style.text}`}>{item.label}</p>
                      <p className="text-sm text-ink mt-0.5">{item.message}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-ink-muted" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {summary.teamMembers === 0 && (
        <Card className="flex items-center gap-3 text-sm text-ink-secondary">
          <Users className="h-4 w-4 text-ink-muted" />
          No employees are currently recorded under {unit} in the demo dataset.
        </Card>
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
