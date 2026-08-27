"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { CommentsThread } from "@/components/work/CommentsThread";
import type { AssignedTicket } from "@/store/tickets-store";
import type { Employee } from "@/data/types";
import { TICKET_STATUS_OPTIONS, type TicketStatus, type TicketPriority } from "@/data/tickets";

const PRIORITY_OPTIONS: TicketPriority[] = ["High", "Medium", "Low"];
const MAX_ASSIGNEES = 2;

/** Full ticket detail — description, editable status/priority, skills, up to 2
 * assignees, and the shared comment thread. Used from both the supervisor's Work page
 * and the calendar, so clicking a ticket deadline anywhere in the app opens the exact
 * same panel. Status/priority/skills live on the ticket itself (one shared field), so
 * either assignee changing them reflects for both immediately — it's one ticket, just
 * visible to more than one person. */
export function TaskDetailPanel({
  ticket,
  employees,
  currentUserName,
  onClose,
  onUpdateStatus,
  onUpdatePriority,
  onUpdateSkills,
  onUpdateAssignees,
}: {
  ticket: AssignedTicket;
  employees: Employee[];
  currentUserName: string;
  onClose: () => void;
  onUpdateStatus: (status: TicketStatus) => void;
  onUpdatePriority: (priority: TicketPriority) => void;
  onUpdateSkills: (skills: string[]) => void;
  onUpdateAssignees: (employeeIds: string[]) => void;
}) {
  const assigneeIds = ticket.assignedEmployeeIds ?? [];
  const assignees = assigneeIds.map((id) => employees.find((e) => e.id === id)).filter((e): e is Employee => !!e);
  const [skillDraft, setSkillDraft] = useState("");
  const [addAssigneeId, setAddAssigneeId] = useState("");
  const skills = ticket.relatedSkills ?? [];
  const availableToAdd = employees.filter((e) => !assigneeIds.includes(e.id));

  function addSkill() {
    const name = skillDraft.trim();
    if (!name || skills.some((s) => s.toLowerCase() === name.toLowerCase())) {
      setSkillDraft("");
      return;
    }
    onUpdateSkills([...skills, name]);
    setSkillDraft("");
  }

  function removeSkill(name: string) {
    onUpdateSkills(skills.filter((s) => s !== name));
  }

  function removeAssignee(id: string) {
    onUpdateAssignees(assigneeIds.filter((a) => a !== id));
  }

  function addAssignee() {
    if (!addAssigneeId || assigneeIds.length >= MAX_ASSIGNEES) return;
    onUpdateAssignees([...assigneeIds, addAssigneeId]);
    setAddAssigneeId("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-8" onClick={onClose}>
      <div
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{ticket.id}</p>
            <h2 className="mt-0.5 text-lg font-semibold text-ink">{ticket.title}</h2>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <label className="flex items-center gap-2 text-xs">
            <span className="font-medium uppercase tracking-wide text-ink-secondary">Status</span>
            <select
              value={ticket.status}
              onChange={(e) => onUpdateStatus(e.target.value as TicketStatus)}
              className="input max-w-[160px]"
            >
              {TICKET_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs">
            <span className="font-medium uppercase tracking-wide text-ink-secondary">Priority</span>
            <select
              value={ticket.priority}
              onChange={(e) => onUpdatePriority(e.target.value as TicketPriority)}
              className="input max-w-[140px]"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-lg border border-border bg-brand-50/40 p-3.5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">Description:</p>
          <p className="mt-1 text-sm text-ink-secondary leading-relaxed">{ticket.description}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-border bg-brand-50/40 p-3.5 text-xs sm:grid-cols-4">
          <Detail label="Raised" value={ticket.raisedDate} />
          <Detail label="Estimated" value={`${ticket.estimatedHours}h`} />
          <Detail label="SLA" value={`${ticket.slaHours}h`} />
          <Detail label="Expected By" value={ticket.expectedResolutionDate} />
          <Detail label="Assigned Unit" value={ticket.assignedUnit} />
          <Detail label="Created By" value={ticket.createdBy} />
          <Detail label="Assigned By" value={ticket.assignedBy} />
        </div>

        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-ink">
            Assigned To {assignees.length > 1 && <span className="font-normal text-ink-muted">— shared by {assignees.length}</span>}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            {assignees.length === 0 && <p className="text-sm text-ink-muted">Unassigned</p>}
            {assignees.map((e) => (
              <span
                key={e.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 pl-2.5 pr-1.5 py-1 text-xs font-medium text-brand-800"
              >
                {e.name}
                <button
                  onClick={() => removeAssignee(e.id)}
                  className="rounded-full p-0.5 text-brand-500 hover:bg-brand-100 hover:text-brand-800"
                  aria-label={`Remove ${e.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          {assigneeIds.length < MAX_ASSIGNEES && availableToAdd.length > 0 && (
            <div className="mt-2.5 flex items-center gap-2">
              <select value={addAssigneeId} onChange={(e) => setAddAssigneeId(e.target.value)} className="input max-w-[220px]">
                <option value="">{assigneeIds.length === 0 ? "Assign to…" : "Add a co-assignee…"}</option>
                {availableToAdd.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
              <button
                onClick={addAssignee}
                disabled={!addAssigneeId}
                className="rounded-lg border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-ink hover:bg-brand-50 disabled:opacity-50"
              >
                {assigneeIds.length === 0 ? "Assign" : "Add"}
              </button>
            </div>
          )}
          <p className="mt-1.5 text-xs text-ink-muted">
            Up to {MAX_ASSIGNEES} people can share this ticket — status, priority and skills stay the same for both; whoever
            updates them updates it for everyone.
          </p>
        </div>

        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-ink">Skills</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            {skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 pl-2.5 pr-1.5 py-1 text-xs font-medium text-brand-800"
              >
                {s}
                <button
                  onClick={() => removeSkill(s)}
                  className="rounded-full p-0.5 text-brand-500 hover:bg-brand-100 hover:text-brand-800"
                  aria-label={`Remove ${s}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              value={skillDraft}
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Add a skill…"
              className="input max-w-[140px] py-1.5 text-xs"
            />
            <button
              onClick={addSkill}
              className="rounded-lg border border-border-strong bg-surface px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-brand-50"
            >
              Add
            </button>
          </div>
          <p className="mt-1.5 text-xs text-ink-muted">Used to suggest candidates for this ticket.</p>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-ink">Comments</h3>
          {assigneeIds.length > 0 ? (
            <CommentsThread workLogKey={`${assigneeIds[0]}:${ticket.id}`} currentUserName={currentUserName} />
          ) : (
            <p className="text-xs text-ink-muted">Assign this ticket to an employee to start a comment thread.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-ink-muted">{label}</p>
      <p className="mt-0.5 font-medium text-ink">{value}</p>
    </div>
  );
}
