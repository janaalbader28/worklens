"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarClock, Flag, User, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PriorityBadge } from "@/components/ui/StatusBadge";
import { SourceSystemNotice } from "@/components/systems/SourceSystemHeader";
import { SystemPageShell } from "@/components/systems/SystemPageShell";
import { DEPARTMENTS } from "@/data/config";
import type { Department } from "@/data/types";
import type { FlowProject } from "@/data/flow";
import { useFlowProjects } from "../flow-store";

const STATUSES: FlowProject["status"][] = ["Planned", "In Progress", "On Hold", "Completed"];
const PRIORITIES: FlowProject["priority"][] = ["High", "Medium", "Low"];

const STATUS_STYLES: Record<string, string> = {
  "In Progress": "bg-brand-50 border-border-strong text-brand-700",
  Planned: "bg-[var(--status-warning-bg)] border-[var(--status-warning-border)] text-[var(--status-warning)]",
  Completed: "bg-[var(--status-good-bg)] border-[var(--status-good-border)] text-[var(--status-good)]",
  "On Hold": "bg-brand-50 border-border-strong text-ink-secondary",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

export default function FlowDetailPage() {
  const params = useParams<{ id: string }>();
  const { projects, updateProject } = useFlowProjects();
  const record = projects.find((p) => p.id === params.id);

  if (!record) {
    return (
      <SystemPageShell>
        <p className="text-sm text-ink-muted">Record not found.</p>
      </SystemPageShell>
    );
  }

  return <FlowDetailForm key={record.id} record={record} allProjects={projects} onUpdate={updateProject} />;
}

function FlowDetailForm({
  record,
  allProjects,
  onUpdate,
}: {
  record: FlowProject;
  allProjects: FlowProject[];
  onUpdate: (id: string, patch: Partial<FlowProject>) => void;
}) {
  const [description, setDescription] = useState(record.description);
  const [taskDescription, setTaskDescription] = useState(record.taskDescription);
  const [owner, setOwner] = useState(record.owner);
  const [assignedUnit, setAssignedUnit] = useState<Department>(record.assignedUnit);
  const [assignedEmployee, setAssignedEmployee] = useState(record.assignedEmployee ?? "");
  const [priority, setPriority] = useState(record.priority);
  const [status, setStatus] = useState(record.status);
  const [estimatedHours, setEstimatedHours] = useState(record.estimatedHours);
  const [startDate, setStartDate] = useState(record.startDate);
  const [deadline, setDeadline] = useState(record.deadline);
  const [saved, setSaved] = useState(false);

  const siblings = useMemo(
    () => allProjects.filter((p) => p.project === record.project).sort((a, b) => a.deadline.localeCompare(b.deadline)),
    [allProjects, record.project]
  );
  const upcomingDeadline = siblings
    .map((s) => s.deadline)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];

  function handleSave() {
    onUpdate(record.id, {
      description,
      taskDescription,
      owner,
      assignedUnit,
      assignedEmployee: assignedEmployee.trim() || undefined,
      priority,
      status,
      estimatedHours,
      startDate,
      deadline,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <SystemPageShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">Project · Task</p>
          <h1 className="mt-0.5 text-2xl font-semibold text-ink tracking-tight">{record.project}</h1>
          <p className="text-sm text-ink-secondary">{record.task}</p>
        </div>
        <PriorityBadge priority={record.priority} />
      </div>

      <Card>
        <div className="space-y-5">
          <Field label="Description (project)">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="input resize-none" />
          </Field>
          <Field label="Description (this task)">
            <textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} rows={2} className="input resize-none" />
          </Field>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Project Owner" icon={User}>
              <input value={owner} onChange={(e) => setOwner(e.target.value)} className="input" />
            </Field>
            <Field label="Assigned Unit" icon={Flag}>
              <select value={assignedUnit} onChange={(e) => setAssignedUnit(e.target.value as Department)} className="input">
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Assigned Employee">
              <input
                value={assignedEmployee}
                onChange={(e) => setAssignedEmployee(e.target.value)}
                placeholder="Not yet assigned"
                className="input"
              />
            </Field>
            <Field label="Priority">
              <select value={priority} onChange={(e) => setPriority(e.target.value as FlowProject["priority"])} className="input">
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as FlowProject["status"])} className="input">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
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
            <Field label="Start Date" icon={CalendarClock}>
              <input value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
            </Field>
            <Field label="Deadline" icon={CalendarClock}>
              <input value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input" />
            </Field>
            <div>
              <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                <CalendarClock className="h-3 w-3" />
                Upcoming Deadline (project)
              </p>
              <p className="mt-1.5 text-sm font-medium text-ink">{upcomingDeadline}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            Save Changes
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--status-good)]">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </Card>

      <Card>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-secondary">Milestones</p>
        <ul className="space-y-1.5">
          {record.milestones.map((m) => (
            <li key={m} className="flex items-center gap-2 text-sm text-ink-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              {m}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
          Other tasks within this project ({siblings.length - 1})
        </p>
        {siblings.length === 1 ? (
          <p className="text-sm text-ink-muted">No other tasks recorded for this project.</p>
        ) : (
          <ul className="space-y-2">
            {siblings
              .filter((task) => task.id !== record.id)
              .map((task) => (
                <li key={task.id}>
                  <Link
                    href={`/systems/flow/${task.id}`}
                    className="block rounded-lg border border-border p-3 hover:bg-brand-50/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-ink hover:text-brand-700 hover:underline underline-offset-2">
                        {task.task}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <PriorityBadge priority={task.priority} />
                        <StatusPill status={task.status} />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-ink-secondary">{task.taskDescription}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                      <span>Assigned Unit: {task.assignedUnit}</span>
                      <span>Assigned Employee: {task.assignedEmployee ?? "Not yet assigned"}</span>
                      <span className="tabular">{task.estimatedHours}h estimated</span>
                      <span>Due {task.deadline}</span>
                    </div>
                  </Link>
                </li>
              ))}
          </ul>
        )}
      </Card>

      <SourceSystemNotice>
        Prototype representation of an existing organizational system. Project work can carry an assigned unit
        and/or an assigned employee, depending on the source data — WorkLens consumes whichever it&rsquo;s given.
      </SourceSystemNotice>
    </SystemPageShell>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon?: typeof User; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-ink-secondary">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </span>
      {children}
    </label>
  );
}
