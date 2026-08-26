"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { HandoverPlanner } from "@/components/handover/HandoverPlanner";
import { useEmployees } from "@/store/employees-store";
import { useHandoverRequests } from "@/store/handover-requests-store";

export default function HandoverPlannerPage() {
  const { employees } = useEmployees();
  const { requests, markReviewed } = useHandoverRequests();
  const [review, setReview] = useState<{ employeeId: string; start: string; end: string } | null>(null);

  const pending = requests.filter((r) => r.status === "Pending Supervisor Review");

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Handover &amp; Continuity Planner</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Simulate an employee becoming unavailable and identify who can cover their work.
        </p>
      </div>

      {pending.length > 0 && (
        <Card>
          <CardHeader
            title="Incoming Handover Requests"
            subtitle="Submitted by employees from their portal"
            action={
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] px-2.5 py-1 text-xs font-medium text-[var(--status-warning)]">
                <Inbox className="h-3.5 w-3.5" />
                {pending.length} pending
              </span>
            }
          />
          <ul className="divide-y divide-border">
            {pending.map((r) => {
              const employee = employees.find((e) => e.id === r.employeeId);
              return (
                <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-ink">{employee?.name ?? r.employeeId}</p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Unavailable {r.startDate} – {r.endDate}
                    </p>
                    {r.note && <p className="text-xs text-ink-secondary mt-1 italic">&ldquo;{r.note}&rdquo;</p>}
                    {r.affectedWork.length > 0 && (
                      <p className="text-xs text-ink-muted mt-1">Affected: {r.affectedWork.join(", ")}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setReview({ employeeId: r.employeeId, start: r.startDate, end: r.endDate })}
                      className="rounded-lg bg-brand-800 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                    >
                      Review in Planner
                    </button>
                    <button
                      onClick={() => markReviewed(r.id)}
                      className="rounded-lg border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-ink hover:bg-brand-50"
                    >
                      Mark Reviewed
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <HandoverPlanner
        key={review ? `${review.employeeId}-${review.start}-${review.end}` : "default"}
        initialEmployeeId={review?.employeeId}
        initialStart={review?.start}
        initialEnd={review?.end}
      />
    </div>
  );
}
