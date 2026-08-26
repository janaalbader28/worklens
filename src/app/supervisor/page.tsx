"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, AlertTriangle, Users, Gauge, PieChart, TrendingUp, ShieldAlert, ListChecks, Ticket } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { CapacityForecastChart } from "@/components/charts/CapacityForecastChart";
import { CapacityDistributionBar } from "@/components/charts/CapacityDistributionBar";
import { NewWorkModal } from "@/components/supervisor/NewWorkModal";
import { useTickets } from "@/store/tickets-store";
import { useSupervisorSession } from "@/store/session-store";
import { useEmployees } from "@/store/employees-store";
import { computeUnitSummary } from "@/lib/unit-summary";

export default function SupervisorDashboardPage() {
  const { unit } = useSupervisorSession();
  const { tickets } = useTickets();
  const { employees } = useEmployees();
  const [showNewWork, setShowNewWork] = useState(false);

  const summary = useMemo(() => computeUnitSummary(unit, employees, tickets), [unit, employees, tickets]);

  const distribution = useMemo(() => {
    const healthy = summary.employeeCount - summary.atRiskCount - summary.overloadedCount;
    return [
      { key: "healthy", label: "Healthy", value: Math.max(0, healthy) },
      { key: "atRisk", label: "At Risk", value: summary.atRiskCount },
      { key: "overloaded", label: "Overloaded", value: summary.overloadedCount },
    ];
  }, [summary]);

  const week4 = summary.forecast8Week[3]?.utilization ?? 0;
  const risks: string[] = [];
  if (week4 >= 90) risks.push(`${unit} is projected to reach ${week4}% capacity in 4 weeks.`);
  const overloadSoon = summary.employees.filter((e) => Math.max(...e.forecast8Week) > 95).length;
  if (overloadSoon > 0) {
    risks.push(`${overloadSoon} employee${overloadSoon === 1 ? " is" : "s are"} projected to exceed the recommended capacity threshold.`);
  }

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{unit}</p>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Supervisor Dashboard</h1>
          <p className="mt-1 text-sm text-ink-muted">Last updated: 26 Aug 2026, 10:42 AM</p>
        </div>
        <button
          onClick={() => setShowNewWork(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          New Work
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Utilization Rate"
          value={`${summary.averageUtilization}%`}
          icon={<Gauge className="h-4 w-4" />}
          info="utilization"
        />
        <KpiCard
          label="Available Capacity"
          value={`${summary.availableCapacity}%`}
          tone="good"
          icon={<PieChart className="h-4 w-4" />}
          info="availableCapacity"
        />
        <KpiCard
          label="At Risk"
          value={String(summary.atRiskCount)}
          tone="warning"
          icon={<TrendingUp className="h-4 w-4" />}
          info="atRisk"
        />
        <KpiCard
          label="Overloaded"
          value={String(summary.overloadedCount)}
          tone="serious"
          icon={<ShieldAlert className="h-4 w-4" />}
          info="overloaded"
        />
        <KpiCard
          label="Active Tasks"
          value={String(summary.activeTasksCount)}
          icon={<ListChecks className="h-4 w-4" />}
          info="activeTasks"
        />
        <KpiCard
          label="Open Tickets"
          value={String(summary.openTicketsCount)}
          icon={<Ticket className="h-4 w-4" />}
          info="openTickets"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader
            title="8-Week Capacity Outlook"
            subtitle="What's likely to happen if current plans continue"
            action={
              <span className="inline-flex items-center rounded-full border border-accent-violet/30 bg-accent-violet-bg px-2.5 py-1 text-xs font-medium text-accent-violet">
                Illustrative Forecast
              </span>
            }
          />
          <CapacityForecastChart data={summary.forecast8Week} />
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
            <LegendDash color="var(--status-warning)" label="80% at-risk threshold" />
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

        <Card className="lg:col-span-2">
          <CardHeader title="Current Unit Capacity" subtitle={`Across ${summary.employeeCount} employees in ${unit}`} />
          <CapacityDistributionBar data={distribution} />
        </Card>
      </div>

      {risks.length > 0 && (
        <Card>
          <CardHeader title="Upcoming Capacity Risks" subtitle="Generated from current workload and forecast trends" />
          <ul className="space-y-3">
            {risks.map((risk) => (
              <li
                key={risk}
                className="flex items-start gap-3 rounded-lg border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] px-4 py-3"
              >
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-[var(--status-warning)]" strokeWidth={2} />
                <p className="text-sm text-ink">{risk}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {summary.employeeCount === 0 && (
        <Card className="flex items-center gap-3 text-sm text-ink-secondary">
          <Users className="h-4 w-4 text-ink-muted" />
          No employees are currently recorded under {unit} in the demo dataset.
        </Card>
      )}

      {showNewWork && <NewWorkModal unit={unit} onClose={() => setShowNewWork(false)} />}
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
