"use client";

import { useState } from "react";
import { ChevronRight, Plus, X } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { PriorityBadge } from "@/components/ui/StatusBadge";
import { SourceSystemHeader, SourceSystemNotice } from "@/components/systems/SourceSystemHeader";
import { SystemPageShell } from "@/components/systems/SystemPageShell";
import { ClickableRow } from "@/components/systems/ClickableRow";
import { getSourceSystem } from "@/data/systems";
import { DEPARTMENTS } from "@/data/config";
import type { Department } from "@/data/types";
import { TICKETS_TOTAL_RECORDS } from "@/data/tickets";
import { useTickets } from "@/store/tickets-store";
import { DEMO_TODAY_LABEL } from "@/lib/date";

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-[var(--status-critical-bg)] border-[var(--status-critical-border)] text-[var(--status-critical)]",
  "In Progress": "bg-[var(--status-warning-bg)] border-[var(--status-warning-border)] text-[var(--status-warning)]",
  "On Hold": "bg-brand-50 border-border-strong text-ink-secondary",
  Resolved: "bg-[var(--status-good-bg)] border-[var(--status-good-border)] text-[var(--status-good)]",
  Closed: "bg-brand-50 border-border-strong text-ink-muted",
};

export default function TicketSystemPage() {
  const system = getSourceSystem("tickets");
  const { tickets, addTicket } = useTickets();
  const [showForm, setShowForm] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  return (
    <SystemPageShell>
      <SourceSystemHeader
        system={{ ...system, name: "IT Ticket System", subtitle: "Operational Support & Service Requests" }}
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-800 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            New Incident
          </button>
        }
      />

      <Card>
        <CardHeader
          title="Tickets"
          subtitle={`Showing ${tickets.length} of ${TICKETS_TOTAL_RECORDS.toLocaleString()} synced records`}
        />
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[880px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-brand-50/60 text-left text-xs font-medium uppercase tracking-wide text-ink-secondary">
                <th className="px-4 py-3">Incident ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Assigned Unit</th>
                <th className="px-4 py-3">Raised Date</th>
                <th className="px-4 py-3">Estimated Effort</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <ClickableRow key={t.id} href={`/systems/tickets/${t.id}`}>
                  <td className="px-4 py-3 tabular text-ink-secondary whitespace-nowrap">{t.id}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink group-hover:text-brand-700 group-hover:underline underline-offset-2">
                      {t.title}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[t.status]}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td className="px-4 py-3 text-ink-secondary whitespace-nowrap">{t.assignedUnit}</td>
                  <td className="px-4 py-3 text-ink-secondary whitespace-nowrap">{t.raisedDate}</td>
                  <td className="px-4 py-3 tabular text-ink-secondary">{t.estimatedHours}h</td>
                  <td className="px-2 py-3">
                    <ChevronRight className="h-4 w-4 text-ink-muted" />
                  </td>
                </ClickableRow>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SourceSystemNotice>
        Prototype representation of an existing organizational system. Incidents are assigned to a unit only — a
        supervisor decides which employee handles the work inside WorkLens.
      </SourceSystemNotice>

      {showForm && (
        <NewIncidentModal
          error={addError}
          onClose={() => {
            setAddError(null);
            setShowForm(false);
          }}
          onSubmit={async (input) => {
            setAddError(null);
            try {
              await addTicket(input);
              setShowForm(false);
            } catch {
              setAddError("Couldn't save this incident — check your connection and try again.");
            }
          }}
        />
      )}
    </SystemPageShell>
  );
}

function NewIncidentModal({
  error,
  onClose,
  onSubmit,
}: {
  error: string | null;
  onClose: () => void;
  onSubmit: (input: Parameters<ReturnType<typeof useTickets>["addTicket"]>[0]) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [raisedDate, setRaisedDate] = useState(DEMO_TODAY_LABEL);
  const [status, setStatus] = useState<"Open" | "In Progress">("Open");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [assignedUnit, setAssignedUnit] = useState<Department>("IT Service Support");
  const [estimatedHours, setEstimatedHours] = useState(3);
  const [slaHours, setSlaHours] = useState(24);
  const [expectedResolutionDate, setExpectedResolutionDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-lg my-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-ink">New Incident</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-[var(--status-critical-border)] bg-[var(--status-critical-bg)] px-3.5 py-2.5 text-xs text-[var(--status-critical)]">
            {error}
          </p>
        )}

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!title.trim() || submitting) return;
            setSubmitting(true);
            await onSubmit({
              title: title.trim(),
              description: description.trim() || "No additional description provided.",
              status,
              priority,
              assignedUnit,
              raisedDate,
              estimatedHours,
              slaHours,
              expectedResolutionDate: expectedResolutionDate || "Not set",
              createdBy: "Prototype User",
              assignedBy: "Service Desk Triage",
            });
            setSubmitting(false);
          }}
        >
          <Field label="Incident Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" required />
          </Field>
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input resize-none"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Raised Date">
              <input value={raisedDate} onChange={(e) => setRaisedDate(e.target.value)} className="input" />
            </Field>
            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="input">
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
              </select>
            </Field>
            <Field label="Priority">
              <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)} className="input">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </Field>
            <Field label="Assigned Unit">
              <select value={assignedUnit} onChange={(e) => setAssignedUnit(e.target.value as Department)} className="input">
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Estimated Effort (hours)">
              <input
                type="number"
                min={1}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value) || 1)}
                className="input"
              />
            </Field>
            <Field label="SLA (hours)">
              <input
                type="number"
                min={1}
                value={slaHours}
                onChange={(e) => setSlaHours(Number(e.target.value) || 1)}
                className="input"
              />
            </Field>
          </div>
          <Field label="Expected Resolution Date">
            <input
              value={expectedResolutionDate}
              onChange={(e) => setExpectedResolutionDate(e.target.value)}
              placeholder="e.g. 26 Aug 2026"
              className="input"
            />
          </Field>

          <p className="text-xs text-ink-muted">
            The supervisor of <span className="font-medium text-ink-secondary">{assignedUnit}</span> will decide which
            employee handles this inside WorkLens.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-brand-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save Incident"}
            </button>
          </div>
        </form>
      </div>
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
