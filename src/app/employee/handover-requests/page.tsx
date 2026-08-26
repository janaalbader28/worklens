"use client";

import { useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { useEmployeeSession } from "@/store/session-store";
import { useEmployees } from "@/store/employees-store";
import { useHandoverRequests } from "@/store/handover-requests-store";

export default function HandoverRequestsPage() {
  const { employeeId } = useEmployeeSession();
  const { employees } = useEmployees();
  const me = employees.find((e) => e.id === employeeId) ?? employees.find((e) => e.id === "sara-al-qahtani")!;
  const { requests, submitRequest } = useHandoverRequests();

  const [note, setNote] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [affected, setAffected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const workOptions = [
    ...me.upcomingProjects.map((p) => p.name),
    ...me.upcomingTickets.map((t) => t.title),
    ...me.adhoc.map((a) => a.name),
  ];

  const myRequests = requests.filter((r) => r.employeeId === me.id);

  function toggleAffected(item: string) {
    setAffected((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  }

  function handleSubmit() {
    if (!startDate || !endDate) return;
    submitRequest({ employeeId: me.id, note, startDate, endDate, affectedWork: affected });
    setSubmitted(true);
    setNote("");
    setStartDate("");
    setEndDate("");
    setAffected([]);
    window.setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Handover Requests</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Report upcoming unavailability so your supervisor can plan coverage ahead of time.
        </p>
      </div>

      <Card>
        <CardHeader title="Report Unavailability" subtitle="e.g. “I will be unavailable from 10–17 September.”" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start Date">
            <input value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="10 September 2026" className="input" />
          </Field>
          <Field label="End Date">
            <input value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="17 September 2026" className="input" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Reason / Note">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="input resize-none" />
          </Field>
        </div>

        {workOptions.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-secondary">
              Affected Work — select what may need covering
            </p>
            <div className="flex flex-wrap gap-2">
              {workOptions.map((item) => {
                const active = affected.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAffected(item)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active ? "border-brand-700 bg-brand-800 text-white" : "border-border-strong bg-surface text-ink-secondary hover:bg-brand-50"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={!startDate || !endDate}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
          >
            Submit Handover Request
          </button>
          {submitted && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--status-good)]">
              <CheckCircle2 className="h-4 w-4" />
              Sent to your supervisor
            </span>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Your Requests" subtitle="Status of previously submitted handover requests" />
        {myRequests.length === 0 ? (
          <p className="text-sm text-ink-muted py-4">No handover requests submitted yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {myRequests.map((r) => (
              <li key={r.id} className="py-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink">
                    {r.startDate} – {r.endDate}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                      r.status === "Pending Supervisor Review"
                        ? "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning)]"
                        : "border-[var(--status-good-border)] bg-[var(--status-good-bg)] text-[var(--status-good)]"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {r.status}
                  </span>
                </div>
                {r.note && <p className="mt-1 text-xs text-ink-secondary italic">&ldquo;{r.note}&rdquo;</p>}
                {r.affectedWork.length > 0 && (
                  <p className="mt-1 text-xs text-ink-muted">Affected: {r.affectedWork.join(", ")}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
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
