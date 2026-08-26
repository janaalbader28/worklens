"use client";

import { useState } from "react";
import { X, Plus, User, ChevronRight } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { PriorityBadge } from "@/components/ui/StatusBadge";
import { SourceSystemHeader, SourceSystemNotice } from "@/components/systems/SourceSystemHeader";
import { SystemPageShell } from "@/components/systems/SystemPageShell";
import { ClickableRow } from "@/components/systems/ClickableRow";
import { getSourceSystem } from "@/data/systems";
import { FLOW_TOTAL_RECORDS, type FlowProject } from "@/data/flow";
import { DEPARTMENTS } from "@/data/config";
import type { Department } from "@/data/types";
import { useFlowProjects } from "./flow-store";

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

export default function FlowSystemPage() {
  const system = getSourceSystem("flow");
  const { projects, addProject } = useFlowProjects();
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <SystemPageShell>
      <SourceSystemHeader
        system={system}
        actions={
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-800 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Add Project / Task
          </button>
        }
      />

      <Card>
        <CardHeader
          title="Projects & Tasks"
          subtitle={`Showing ${projects.length} of ${FLOW_TOTAL_RECORDS} synced records — click a row for details`}
        />
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-brand-50/60 text-left text-xs font-medium uppercase tracking-wide text-ink-secondary">
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned Unit</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Estimated Effort</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <ClickableRow key={p.id} href={`/systems/flow/${p.id}`}>
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink group-hover:text-brand-700 group-hover:underline underline-offset-2">
                      {p.project}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-secondary">{p.task}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-ink-secondary whitespace-nowrap">{p.assignedUnit}</td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={p.priority} />
                  </td>
                  <td className="px-4 py-3 tabular text-ink-secondary">{p.estimatedHours}h</td>
                  <td className="px-4 py-3 text-ink-secondary whitespace-nowrap">{p.startDate}</td>
                  <td className="px-4 py-3 text-ink-secondary whitespace-nowrap">{p.deadline}</td>
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
        Prototype representation of an existing organizational system. Project work can carry an assigned unit
        and/or an assigned employee, depending on the source data — WorkLens consumes whichever it&rsquo;s given.
      </SourceSystemNotice>

      {showAddForm && (
        <AddFlowRecordModal
          onClose={() => setShowAddForm(false)}
          onSubmit={(record) => {
            addProject(record);
            setShowAddForm(false);
          }}
        />
      )}
    </SystemPageShell>
  );
}

function AddFlowRecordModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (record: FlowProject) => void;
}) {
  const [project, setProject] = useState("");
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [assignedUnit, setAssignedUnit] = useState<Department>(DEPARTMENTS[0]);
  const [priority, setPriority] = useState<FlowProject["priority"]>("Medium");
  const [status, setStatus] = useState<FlowProject["status"]>("Planned");
  const [estimatedHours, setEstimatedHours] = useState(16);
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [milestones, setMilestones] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/40 px-4 py-8">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-lg my-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-ink">Add Project / Task</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!project.trim() || !task.trim()) return;
            onSubmit({
              id: `flow-${Date.now().toString(36)}`,
              project: project.trim(),
              task: task.trim(),
              description: description.trim() || "No description provided.",
              taskDescription: taskDescription.trim() || "No description provided.",
              owner: owner.trim() || "Unassigned",
              status,
              priority,
              assignedUnit,
              estimatedHours,
              startDate: startDate || "Not set",
              deadline: deadline || "Not set",
              budget: "Not set",
              milestones: milestones
                .split(",")
                .map((m) => m.trim())
                .filter(Boolean),
            });
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Project Name">
              <input value={project} onChange={(e) => setProject(e.target.value)} className="input" required />
            </Field>
            <Field label="Task Name">
              <input value={task} onChange={(e) => setTask(e.target.value)} className="input" required />
            </Field>
          </div>
          <Field label="Project Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="input resize-none" />
          </Field>
          <Field label="Task Description">
            <textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} rows={2} className="input resize-none" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Project Owner">
              <input value={owner} onChange={(e) => setOwner(e.target.value)} className="input" />
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
            <Field label="Start Date">
              <input value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="e.g. 01 Sep 2026" className="input" />
            </Field>
            <Field label="Deadline">
              <input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="e.g. 15 Sep 2026" className="input" />
            </Field>
          </div>
          <Field label="Milestones (comma-separated)">
            <input value={milestones} onChange={(e) => setMilestones(e.target.value)} placeholder="Design sign-off, Beta release" className="input" />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-brand-50">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              Add Record
            </button>
          </div>
        </form>
      </div>
    </div>
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
