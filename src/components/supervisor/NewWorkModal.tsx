"use client";

import { useState } from "react";
import { X, FolderKanban, CheckSquare, Ticket, Zap, CheckCircle2 } from "lucide-react";
import type { Department } from "@/data/types";
import { useTickets } from "@/store/tickets-store";
import { DEMO_TODAY_LABEL } from "@/lib/date";

type WorkKind = "project" | "task" | "ticket" | "adhoc";

const KIND_OPTIONS: { key: WorkKind; label: string; icon: typeof FolderKanban }[] = [
  { key: "project", label: "New Project", icon: FolderKanban },
  { key: "task", label: "New Task", icon: CheckSquare },
  { key: "ticket", label: "New Ticket", icon: Ticket },
  { key: "adhoc", label: "Ad-hoc Work", icon: Zap },
];

export function NewWorkModal({ unit, onClose }: { unit: Department; onClose: () => void }) {
  const { addTicket } = useTickets();
  const [kind, setKind] = useState<WorkKind | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const assignedUnit = unit;
  const [estimatedHours, setEstimatedHours] = useState(8);
  const [deadline, setDeadline] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit() {
    if (!title.trim()) return;
    if (kind === "ticket") {
      addTicket({
        title: title.trim(),
        description: description.trim() || "No additional description provided.",
        status: "Open",
        priority,
        assignedUnit,
        raisedDate: DEMO_TODAY_LABEL,
        estimatedHours,
        slaHours: 24,
        expectedResolutionDate: deadline || "Not set",
        createdBy: "Supervisor",
        assignedBy: "Supervisor",
      });
    }
    // Project / Task / Ad-hoc work: simulated-only for this prototype — FLOW and SDLC
    // remain read-only source systems, so these are recorded for this session only.
    setDone(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-lg my-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-ink">{kind ? KIND_OPTIONS.find((k) => k.key === kind)?.label : "New Work"}</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-[var(--status-good)]" />
            <p className="text-sm font-medium text-ink">
              {kind === "ticket" ? "Ticket created and added to the unit queue." : "Work item created (simulated)."}
            </p>
            <button onClick={onClose} className="mt-2 rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              Close
            </button>
          </div>
        ) : !kind ? (
          <div className="grid grid-cols-2 gap-3">
            {KIND_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setKind(opt.key)}
                className="flex flex-col items-center gap-2 rounded-lg border border-border-strong bg-surface p-4 text-center hover:bg-brand-50"
              >
                <opt.icon className="h-5 w-5 text-brand-600" strokeWidth={1.75} />
                <span className="text-sm font-medium text-ink">{opt.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <Field label="Title">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" required autoFocus />
            </Field>
            <Field label="Description">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="input resize-none" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Priority">
                <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)} className="input">
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </Field>
              <Field label="Assigned Unit">
                <input value={assignedUnit} disabled className="input opacity-60" />
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
              <Field label="Deadline">
                <input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="e.g. 12 Sep 2026" className="input" />
              </Field>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button type="button" onClick={() => setKind(null)} className="rounded-lg border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-brand-50">
                Back
              </button>
              <button type="submit" className="rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                Create
              </button>
            </div>
          </form>
        )}
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
