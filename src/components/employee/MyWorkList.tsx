"use client";

import { useState } from "react";
import { MessageSquare, StickyNote, ChevronDown, ChevronUp } from "lucide-react";
import { PriorityBadge } from "@/components/ui/StatusBadge";
import type { Employee, WorkflowStatus } from "@/data/types";
import { getDueStatus, type DueStatus } from "@/lib/date";
import { useWorkLog } from "@/store/work-log-store";
import type { AssignedTicket } from "@/store/tickets-store";

const WORKFLOW_OPTIONS: WorkflowStatus[] = ["Not Started", "In Progress", "Blocked", "Completed"];

const DUE_STYLES: Record<DueStatus, string> = {
  Overdue: "bg-[var(--status-critical-bg)] border-[var(--status-critical-border)] text-[var(--status-critical)]",
  "Due Soon": "bg-[var(--status-warning-bg)] border-[var(--status-warning-border)] text-[var(--status-warning)]",
  "On Track": "bg-[var(--status-good-bg)] border-[var(--status-good-border)] text-[var(--status-good)]",
};

interface WorkRow {
  key: string;
  title: string;
  type: "Project" | "Ticket" | "Ad-hoc";
  priority: "High" | "Medium" | "Low";
  deadline: string;
  estimatedHours: number;
  defaultStatus: string;
}

export function MyWorkList({ employee, assignedTickets }: { employee: Employee; assignedTickets: AssignedTicket[] }) {
  const rows: WorkRow[] = [
    ...employee.upcomingProjects.map((p) => ({
      key: `${employee.id}:${p.id}`,
      title: p.name,
      type: "Project" as const,
      priority: p.priority,
      deadline: p.deadline,
      estimatedHours: p.hoursPerWeek,
      defaultStatus: p.status,
    })),
    ...employee.upcomingTickets.map((t) => ({
      key: `${employee.id}:${t.id}`,
      title: t.title,
      type: "Ticket" as const,
      priority: t.priority,
      deadline: t.deadline,
      estimatedHours: t.estimatedHours,
      defaultStatus: t.status,
    })),
    ...employee.adhoc.map((a) => ({
      key: `${employee.id}:${a.id}`,
      title: a.name,
      type: "Ad-hoc" as const,
      priority: a.priority,
      deadline: a.deadline,
      estimatedHours: a.estimatedHours,
      defaultStatus: a.status,
    })),
    ...assignedTickets.map((t) => ({
      key: `${employee.id}:${t.id}`,
      title: `${t.title} (${t.id})`,
      type: "Ticket" as const,
      priority: t.priority,
      deadline: t.expectedResolutionDate,
      estimatedHours: t.estimatedHours,
      defaultStatus: t.status,
    })),
  ];

  if (rows.length === 0) {
    return <p className="text-sm text-ink-muted py-4">No active assignments.</p>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <WorkRowCard key={row.key} row={row} />
      ))}
    </div>
  );
}

function WorkRowCard({ row }: { row: WorkRow }) {
  const { getEntry, setWorkflowStatus, addNote, addMessage } = useWorkLog();
  const entry = getEntry(row.key);
  const [expanded, setExpanded] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  const due = getDueStatus(row.deadline);
  const workflowStatus = entry.workflowStatus ?? "Not Started";

  return (
    <div className="rounded-lg border border-border">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-ink">{row.title}</p>
            <span className="text-[11px] text-ink-muted">{row.type}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-secondary">
            <span>Due: {row.deadline}</span>
            <span className="tabular">{row.estimatedHours}h</span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${DUE_STYLES[due]}`}>
              {due}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <PriorityBadge priority={row.priority} />
          <select
            value={workflowStatus}
            onChange={(e) => setWorkflowStatus(row.key, e.target.value as WorkflowStatus)}
            className="input max-w-[150px]"
          >
            {WORKFLOW_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg border border-border-strong bg-surface p-2 text-ink-muted hover:bg-brand-50"
            aria-label="Toggle notes and messages"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border bg-brand-50/30 p-4 space-y-4">
          {(entry.notes.length > 0 || entry.messages.length > 0) && (
            <div className="space-y-2">
              {entry.notes.map((n, i) => (
                <div key={`n-${i}`} className="flex items-start gap-2 text-xs text-ink-secondary">
                  <StickyNote className="h-3.5 w-3.5 mt-0.5 shrink-0 text-ink-muted" />
                  <p>
                    {n.text} <span className="text-ink-muted">· {n.at}</span>
                  </p>
                </div>
              ))}
              {entry.messages.map((m, i) => (
                <div key={`m-${i}`} className="flex items-start gap-2 text-xs text-brand-700">
                  <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <p>
                    Sent to supervisor: &ldquo;{m.text}&rdquo; <span className="text-ink-muted">· {m.at}</span>
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ink-secondary">
                Add Note
              </label>
              <div className="flex gap-2">
                <input
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="e.g. Waiting for database access…"
                  className="input"
                />
                <button
                  onClick={() => {
                    if (!noteDraft.trim()) return;
                    addNote(row.key, noteDraft.trim());
                    setNoteDraft("");
                  }}
                  className="shrink-0 rounded-lg border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-ink hover:bg-brand-50"
                >
                  Add
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ink-secondary">
                Message Supervisor
              </label>
              <div className="flex gap-2">
                <input
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                  placeholder="e.g. Need clarification on requirements…"
                  className="input"
                />
                <button
                  onClick={() => {
                    if (!messageDraft.trim()) return;
                    addMessage(row.key, messageDraft.trim());
                    setMessageDraft("");
                    setMessageSent(true);
                    window.setTimeout(() => setMessageSent(false), 2000);
                  }}
                  className="shrink-0 rounded-lg bg-brand-800 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                >
                  Send
                </button>
              </div>
              {messageSent && <p className="mt-1 text-[11px] text-[var(--status-good)]">Sent (simulated).</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
