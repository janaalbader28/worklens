"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { CalendarClock, Milestone, User, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SourceSystemNotice } from "@/components/systems/SourceSystemHeader";
import { SystemPageShell } from "@/components/systems/SystemPageShell";
import { DEPARTMENTS } from "@/data/config";
import type { Department } from "@/data/types";
import type { SdlcActivity } from "@/data/sdlc";
import { useSdlcActivities } from "../sdlc-store";

const STAGES: SdlcActivity["stage"][] = ["Planning", "Development", "Testing", "Deployment"];
const STATUSES: SdlcActivity["status"][] = ["Planned", "In Progress", "Testing", "Completed"];

export default function SdlcDetailPage() {
  const params = useParams<{ id: string }>();
  const { activities, updateActivity } = useSdlcActivities();
  const activity = activities.find((a) => a.id === params.id);

  if (!activity) {
    return (
      <SystemPageShell>
        <p className="text-sm text-ink-muted">Activity not found.</p>
      </SystemPageShell>
    );
  }

  return <SdlcDetailForm key={activity.id} activity={activity} onUpdate={updateActivity} />;
}

function SdlcDetailForm({
  activity,
  onUpdate,
}: {
  activity: SdlcActivity;
  onUpdate: (id: string, patch: Partial<SdlcActivity>) => Promise<void>;
}) {
  const [description, setDescription] = useState(activity.description);
  const [stage, setStage] = useState(activity.stage);
  const [status, setStatus] = useState(activity.status);
  const [assignedUnit, setAssignedUnit] = useState<Department>(activity.assignedUnit);
  const [assignedEmployee, setAssignedEmployee] = useState(activity.assignedEmployee ?? "");
  const [estimatedHours, setEstimatedHours] = useState(activity.estimatedHours);
  const [startDate, setStartDate] = useState(activity.startDate);
  const [deadline, setDeadline] = useState(activity.deadline);
  const [relatedMilestone, setRelatedMilestone] = useState(activity.relatedMilestone);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      await onUpdate(activity.id, {
        description,
        stage,
        status,
        assignedUnit,
        assignedEmployee: assignedEmployee.trim() || undefined,
        estimatedHours,
        startDate,
        deadline,
        relatedMilestone,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError("Couldn't save — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SystemPageShell>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">{activity.application}</p>
        <h1 className="mt-0.5 text-2xl font-semibold text-ink tracking-tight">{activity.activity}</h1>
      </div>

      <Card>
        <div className="space-y-5">
          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="input resize-none" />
          </Field>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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
            <Field label="Assigned Employee" icon={User}>
              <input
                value={assignedEmployee}
                onChange={(e) => setAssignedEmployee(e.target.value)}
                placeholder="Not yet assigned"
                className="input"
              />
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
            <Field label="Related Milestone" icon={Milestone}>
              <input value={relatedMilestone} onChange={(e) => setRelatedMilestone(e.target.value)} className="input" />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--status-good)]">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </span>
          )}
          {saveError && <span className="text-sm font-medium text-[var(--status-critical)]">{saveError}</span>}
        </div>
      </Card>

      <SourceSystemNotice>Prototype representation of an existing organizational system.</SourceSystemNotice>
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
