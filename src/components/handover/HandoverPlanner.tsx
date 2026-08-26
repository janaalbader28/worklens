"use client";

import { useState } from "react";
import { Repeat2, Loader2, Award, ShieldAlert } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { AiTag } from "@/components/ui/AiTag";
import { CapacityBar } from "@/components/ui/ProgressBar";
import { HANDOVER_DEFAULT } from "@/data/scenarios";
import { computeHandover, type AffectedWorkItem, type HandoverCandidate } from "@/lib/handover";
import { useEmployees } from "@/store/employees-store";

export function HandoverPlanner({
  initialEmployeeId,
  initialStart,
  initialEnd,
}: {
  initialEmployeeId?: string;
  initialStart?: string;
  initialEnd?: string;
}) {
  const [employeeId, setEmployeeId] = useState(initialEmployeeId ?? HANDOVER_DEFAULT.employeeId);
  const [start, setStart] = useState(initialStart ?? HANDOVER_DEFAULT.unavailableStart);
  const [end, setEnd] = useState(initialEnd ?? HANDOVER_DEFAULT.unavailableEnd);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ affectedWork: AffectedWorkItem[]; candidates: HandoverCandidate[] } | null>(
    null
  );
  const [approved, setApproved] = useState(false);

  const { employees } = useEmployees();
  const employee = employees.find((e) => e.id === employeeId);

  function handleSimulate() {
    setLoading(true);
    setResult(null);
    setApproved(false);
    window.setTimeout(() => {
      setResult(computeHandover(employees, employeeId, start, end));
      setLoading(false);
    }, 700);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Simulate an Absence"
          subtitle="Choose an employee and a date range to see what work is affected and who can cover it."
        />
        <div className="grid gap-5 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-secondary">
              Employee
            </span>
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="input">
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-secondary">
              Unavailable From
            </span>
            <input value={start} onChange={(e) => setStart(e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-secondary">
              Unavailable Until
            </span>
            <input value={end} onChange={(e) => setEnd(e.target.value)} className="input" />
          </label>
        </div>

        {employee && (
          <p className="mt-3 text-xs text-ink-muted">
            {employee.title} · {employee.department} · Currently {employee.currentUtilization}% utilized
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Repeat2 className="h-4 w-4" />}
            {loading ? "Simulating…" : "Simulate Absence"}
          </button>
        </div>
      </Card>

      {result && !loading && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Affected Work" subtitle={`Work currently assigned to ${employee?.name} during this period`} />
            {result.affectedWork.length === 0 ? (
              <p className="text-sm text-ink-muted py-4">No active work found for this employee.</p>
            ) : (
              <ul className="divide-y divide-border">
                {result.affectedWork.map((w) => (
                  <li key={w.name} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{w.name}</p>
                      <p className="text-xs text-ink-muted">{w.type}</p>
                    </div>
                    <span className="tabular text-sm font-medium text-ink-secondary">{w.hours}h</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-ink">Recommended Handover Candidates</h3>
              <AiTag />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {result.candidates.map((c) => {
                const best = c.recommendation === "Best Match";
                return (
                  <Card key={c.employee.id} className={best ? "border-2 border-brand-600 shadow-md relative" : "relative"}>
                    {best && (
                      <span className="absolute -top-3 left-4 rounded-full bg-brand-800 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                        Best Match
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-brand-800 text-white text-sm font-semibold flex items-center justify-center">
                        {c.employee.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink">{c.employee.name}</p>
                        <p className="text-xs text-ink-muted">{c.employee.title}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <Metric label="Skill Match" value={`${c.skillMatch}%`} />
                      <Metric label="Available Capacity" value={`${c.availableCapacity}%`} />
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-ink-secondary">Projected Capacity</span>
                        <span className="tabular font-medium text-ink">{c.projectedCapacity}%</span>
                      </div>
                      <CapacityBar value={c.projectedCapacity} showLabel={false} />
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-xs font-medium">
                      {best ? (
                        <>
                          <Award className="h-4 w-4 text-[var(--status-good)]" />
                          <span className="text-[var(--status-good)]">Recommendation: Best Match</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="h-4 w-4 text-[var(--status-warning)]" />
                          <span className="text-[var(--status-warning)]">Recommendation: Higher Risk</span>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="bg-brand-50/50 border-brand-100">
            <p className="text-xs leading-relaxed text-ink-secondary">
              WorkLens ranks handover candidates using skill overlap, current availability and projected capacity
              after reassignment. <span className="font-medium text-ink">Recommendation supports the supervisor;
              final handover decision remains a human decision.</span>
            </p>
          </Card>

          {approved ? (
            <div className="flex items-center gap-2 rounded-lg border border-[var(--status-good-border)] bg-[var(--status-good-bg)] px-3.5 py-3">
              <Award className="h-4 w-4 shrink-0 text-[var(--status-good)]" />
              <p className="text-xs font-medium text-[var(--status-good)]">
                Handover approved (simulated). No real reassignment has been made outside this prototype.
              </p>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={() => setApproved(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                Approve Handover
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="tabular font-semibold text-ink">{value}</p>
    </div>
  );
}
