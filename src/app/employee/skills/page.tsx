"use client";

import { useState } from "react";
import { Info, CheckCircle2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { SkillLevelBar } from "@/components/ui/ProgressBar";
import { useEmployeeSession } from "@/store/session-store";
import { useEmployees } from "@/store/employees-store";

export default function MySkillsPage() {
  const { employeeId } = useEmployeeSession();
  const { employees } = useEmployees();
  const me = employees.find((e) => e.id === employeeId) ?? employees.find((e) => e.id === "sara-al-qahtani")!;
  const [showRequest, setShowRequest] = useState(false);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">My Skills</h1>
        <p className="mt-1 text-sm text-ink-muted">From your HR employee master profile.</p>
      </div>

      <Card>
        <CardHeader title="Skills" subtitle="Levels are set by HR and your supervisor" />
        <div className="space-y-4">
          {me.skills.map((s) => (
            <div key={s.name} className="flex items-center justify-between gap-4">
              <span className="text-sm text-ink w-40 shrink-0">{s.name}</span>
              <SkillLevelBar level={s.level} />
            </div>
          ))}
        </div>
        {me.knowledgeAreas.length > 0 && (
          <div className="mt-5 pt-4 border-t border-border">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary mb-2">Knowledge Areas</p>
            <div className="flex flex-wrap gap-1.5">
              {me.knowledgeAreas.map((k) => (
                <span key={k} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-800">
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-border">
          {sent ? (
            <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--status-good)]">
              <CheckCircle2 className="h-4 w-4" />
              Skill update request sent to HR and your supervisor.
            </p>
          ) : showRequest ? (
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">
                What would you like updated?
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="e.g. Add Tableau — Intermediate; update Python to Advanced"
                className="input resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRequest(false)}
                  className="rounded-lg border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-brand-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!note.trim()) return;
                    setSent(true);
                  }}
                  className="rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Request Skill Update
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-ink-secondary">Need to update your skills?</p>
              <button
                onClick={() => setShowRequest(true)}
                className="rounded-lg border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-brand-50"
              >
                Request Skill Update
              </button>
            </div>
          )}
        </div>
      </Card>

      <Card className="border-brand-100 bg-brand-50/50">
        <CardHeader title="Potential Project Match" subtitle="How your skills could be matched to upcoming work" />
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-ink">HR Analytics Dashboard</p>
            <p className="text-xs text-ink-muted mt-0.5">Based on your current recorded skills and projected capacity</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-semibold text-brand-700 tabular">92%</p>
            <p className="text-xs text-ink-muted">Skill Match</p>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-ink-muted" />
          <p className="text-xs leading-relaxed text-ink-muted">
            This match is based on existing skills and projected capacity — it&rsquo;s a demonstration, not a live
            recommendation engine.
          </p>
        </div>
      </Card>
    </div>
  );
}
