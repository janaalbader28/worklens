"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { CapacityForecastChart } from "@/components/charts/CapacityForecastChart";
import { MyWorkList } from "@/components/employee/MyWorkList";
import { toWeekSeries } from "@/lib/forecast";
import { useEmployeeSession } from "@/store/session-store";
import { useEmployees } from "@/store/employees-store";
import { useTickets } from "@/store/tickets-store";

export default function MyWorkPage() {
  const { employeeId } = useEmployeeSession();
  const { employees } = useEmployees();
  const me = employees.find((e) => e.id === employeeId) ?? employees.find((e) => e.id === "sara-al-qahtani")!;
  const { tickets } = useTickets();
  const assignedTickets = tickets.filter((t) => t.assignedEmployeeId === me.id);

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">My Work</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Update status, add notes and message your supervisor on anything assigned to you.
        </p>
      </div>

      <Card>
        <CardHeader title="Current Assignments" subtitle="Projects, tickets and ad-hoc responsibilities" />
        <MyWorkList employee={me} assignedTickets={assignedTickets} />
      </Card>

      <Card>
        <CardHeader title="Upcoming Workload Timeline" subtitle="Projected utilization over the next 8 weeks" />
        <CapacityForecastChart data={toWeekSeries(me.forecast8Week)} />
      </Card>
    </div>
  );
}
