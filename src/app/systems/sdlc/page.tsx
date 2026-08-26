"use client";

import { useState } from "react";
import { X, Plus, User, ChevronRight } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { SourceSystemHeader, SourceSystemNotice } from "@/components/systems/SourceSystemHeader";
import { SystemPageShell } from "@/components/systems/SystemPageShell";
import { ClickableRow } from "@/components/systems/ClickableRow";
import { getSourceSystem } from "@/data/systems";
import { SDLC_TOTAL_RECORDS, type SdlcActivity } from "@/data/sdlc";
import { DEPARTMENTS } from "@/data/config";
import type { Department } from "@/data/types";
import { useSdlcActivities } from "./sdlc-store";

const STAGES: SdlcActivity["stage"][] = ["Planning", "Development", "Testing", "Deployment"];
const STATUSES: SdlcActivity["status"][] = ["Planned", "In Progress", "Testing", "Completed"];

const STAGE_STYLES: Record<string, string> = {
  Planning: "bg-brand-50 border-border-strong text-ink-secondary",
  Development: "bg-brand-50 border-border-strong text-brand-700",
  Testing: "bg-[var(--status-warning-bg)] border-[var(--status-warning-border)] text-[var(--status-warning)]",
  Deployment: "bg-[var(--status-good-bg)] border-[var(--status-good-border)] text-[var(--status-good)]",
};

const STATUS_STYLES: Record<string, string> = {
  Planned: "bg-brand-50 border-border-strong text-ink-secondary",
  "In Progress": "bg-brand-50 border-border-strong text-brand-700",
  Testing: "bg-[var(--status-warning-bg)] border-[var(--status-warning-border)] text-[var(--status-warning)]",
  Completed: "bg-[var(--status-good-bg)] border-[var(--status-good-border)] text-[var(--status-good)]",
};

export default function SdlcSystemPage() {
  const system = getSourceSystem("sdlc");
  const { activities, addActivity } = useSdlcActivities();
  const [showAddForm, setShowAddForm] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

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
            Add Activity
          </button>
        }
      />

      <Card>
        <CardHeader
          title="Development Activities"
          subtitle={`Showing ${activities.length} of ${SDLC_TOTAL_RECORDS} synced records — click a row for details`}
        />
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-brand-50/60 text-left text-xs font-medium uppercase tracking-wide text-ink-secondary">
                <th className="px-4 py-3">Application</th>
                <th className="px-4 py-3">Activity</th>
                <th className="px-4 py-3">Lifecycle Stage</th>
                <th className="px-4 py-3">Assigned Unit</th>
                <th className="px-4 py-3">Estimated Effort</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <ClickableRow key={a.id} href={`/systems/sdlc/${a.id}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-medium text-ink group-hover:text-brand-700 group-hover:underline underline-offset-2">
                      {a.application}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-secondary">{a.activity}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${STAGE_STYLES[a.stage]}`}>
                      {a.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-secondary whitespace-nowrap">{a.assignedUnit}</td>
                  <td className="px-4 py-3 tabular text-ink-secondary">{a.estimatedHours}h</td>
                  <td className="px-4 py-3 text-ink-secondary whitespace-nowrap">{a.deadline}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <ChevronRight className="h-4 w-4 text-ink-muted" />
                  </td>
                </ClickableRow>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SourceSystemNotice>Prototype representation of an existing organizational system.</SourceSystemNotice>

      {showAddForm && (
        <AddSdlcModal
          error={addError}
          onClose={() => {
            setAddError(null);
            setShowAddForm(false);
          }}
          onSubmit={async (activity) => {
            setAddError(null);
            try {
              await addActivity(activity);
              setShowAddForm(false);
            } catch {
              setAddError("Couldn't save this activity — check your connection and try again.");
            }
          }}
        />
      )}
    </SystemPageShell>
  );
}

function AddSdlcModal({
  error,
  onClose,
  onSubmit,
}: {
  error: string | null;
  onClose: () => void;
  onSubmit: (activity: SdlcActivity) => Promise<void>;
}) {
  const [application, setApplication] = useState("");
  const [activity, setActivity] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<SdlcActivity["stage"]>("Planning");
  const [status, setStatus] = useState<SdlcActivity["status"]>("Planned");
  const [assignedUnit, setAssignedUnit] = useState<Department>(DEPARTMENTS[0]);
  const [estimatedHours, setEstimatedHours] = useState(16);
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [relatedMilestone, setRelatedMilestone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/40 px-4 py-8">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-lg my-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-ink">Add Activity</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Close">
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
            if (!application.trim() || !activity.trim() || submitting) return;
            setSubmitting(true);
            await onSubmit({
              id: `sdlc-${Date.now().toString(36)}`,
              application: application.trim(),
              activity: activity.trim(),
              description: description.trim() || "No description provided.",
              stage,
              assignedUnit,
              estimatedHours,
              startDate: startDate || "Not set",
              deadline: deadline || "Not set",
              status,
              relatedMilestone: relatedMilestone.trim() || "Not set",
            });
            setSubmitting(false);
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Application">
              <input value={application} onChange={(e) => setApplication(e.target.value)} className="input" required />
            </Field>
            <Field label="Activity">
              <input value={activity} onChange={(e) => setActivity(e.target.value)} className="input" required />
            </Field>
          </div>
          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="input resize-none" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Lifecycle Stage">
              <select value={stage} onChange={(e) => setStage(e.target.value as SdlcActivity["stage"])} className="input">
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as SdlcActivity["status"])} className="input">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
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
            <Field label="Start Date">
              <input value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="e.g. 01 Sep 2026" className="input" />
            </Field>
            <Field label="Deadline">
              <input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="e.g. 20 Sep 2026" className="input" />
            </Field>
          </div>
          <Field label="Related Milestone">
            <input value={relatedMilestone} onChange={(e) => setRelatedMilestone(e.target.value)} className="input" />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-brand-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? "Adding…" : "Add Activity"}
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
