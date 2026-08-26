"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Plus, X } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { SourceSystemNotice } from "@/components/systems/SourceSystemHeader";
import { SystemPageShell } from "@/components/systems/SystemPageShell";
import { DEPARTMENTS } from "@/data/config";
import type { Department, Skill, SkillLevel } from "@/data/types";
import { getEmployeeEmail, getSupervisorName, type AvailabilityStatus } from "@/lib/hr";
import { useEmployees } from "@/store/employees-store";

const ADD_SKILL_LEVELS: Exclude<SkillLevel, "Expert">[] = ["Beginner", "Intermediate", "Advanced"];
const AVAILABILITY_OPTIONS: Exclude<AvailabilityStatus, "Limited">[] = ["Available", "Unavailable"];

export default function HrEmployeeProfilePage() {
  const params = useParams<{ id: string }>();
  const { employees, updateEmployee } = useEmployees();
  const employee = employees.find((e) => e.id === params.id);

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState<Department>(DEPARTMENTS[0]);
  const [supervisorName, setSupervisorName] = useState("");
  const [email, setEmail] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(40);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [availability, setAvailability] = useState<Exclude<AvailabilityStatus, "Limited">>("Available");
  const [saved, setSaved] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<Exclude<SkillLevel, "Expert">>("Beginner");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!employee) return;
    setTitle(employee.title);
    setDepartment(employee.department);
    setSupervisorName(getSupervisorName(employee));
    setEmail(getEmployeeEmail(employee));
    setWeeklyHours(employee.weeklyHours);
    setSkills(employee.skills);
    setAvailability(employee.availabilityOverride ?? "Available");
    setSaved(false);
  }, [employee]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!employee) {
    return (
      <SystemPageShell>
        <p className="text-sm text-ink-muted">Employee not found in the HR system.</p>
      </SystemPageShell>
    );
  }

  const initials = employee.name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  function addSkill() {
    const name = newSkillName.trim();
    if (!name) return;
    if (skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setNewSkillName("");
      setShowAddSkill(false);
      return;
    }
    setSkills((prev) => [...prev, { name, level: newSkillLevel }]);
    setNewSkillName("");
    setNewSkillLevel("Beginner");
    setShowAddSkill(false);
  }

  function removeSkill(name: string) {
    setSkills((prev) => prev.filter((s) => s.name !== name));
  }

  function handleSave() {
    updateEmployee(employee!.id, {
      title,
      department,
      supervisorNameOverride: supervisorName,
      email,
      weeklyHours,
      skills,
      availabilityOverride: availability,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  }

  return (
    <SystemPageShell>
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 shrink-0 rounded-full bg-brand-800 text-white text-lg font-semibold flex items-center justify-center">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">{employee.name}</h1>
          <p className="text-sm text-ink-secondary">{employee.employeeIdNumber}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Employee Profile" subtitle="Editable HR master data" />
          <div className="space-y-4">
            <Field label="Employee ID">
              <input value={employee.employeeIdNumber} disabled className="input opacity-60" />
            </Field>
            <Field label="Position">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
            </Field>
            <Field label="Department">
              <select value={department} onChange={(e) => setDepartment(e.target.value as Department)} className="input">
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Supervisor">
              <input value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} className="input" />
            </Field>
            <Field label="Contact">
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
            </Field>
            <Field label="Working Hours / Week">
              <input
                type="number"
                min={1}
                max={60}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value) || 0)}
                className="input"
              />
            </Field>
            <Field label="Availability">
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as typeof availability)}
                className="input"
              >
                {AVAILABILITY_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-ink">Skills</h3>
              <p className="mt-0.5 text-xs text-ink-muted">Editable HR master data</p>
            </div>
            <button
              onClick={() => setShowAddSkill((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-brand-50"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Add Skill
            </button>
          </div>

          {showAddSkill && (
            <div className="mb-4 rounded-lg border border-border-strong bg-brand-50/50 p-3.5 space-y-3">
              <Field label="Skill Name">
                <input
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Tableau"
                  className="input"
                  autoFocus
                />
              </Field>
              <Field label="Skill Level">
                <select value={newSkillLevel} onChange={(e) => setNewSkillLevel(e.target.value as typeof newSkillLevel)} className="input">
                  {ADD_SKILL_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddSkill(false)}
                  className="rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-brand-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addSkill}
                  className="rounded-lg bg-brand-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                >
                  Add Skill
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 pl-3 pr-1.5 py-1 text-xs font-medium text-brand-800"
              >
                {s.name}
                <span className="text-brand-500">·</span>
                {s.level}
                <button
                  onClick={() => removeSkill(s.name)}
                  className="ml-0.5 rounded-full p-0.5 text-brand-500 hover:bg-brand-100 hover:text-brand-800"
                  aria-label={`Remove ${s.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {skills.length === 0 && <p className="text-sm text-ink-muted">No skills on record.</p>}
          </div>

          {employee.knowledgeAreas.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary mb-2">Knowledge Areas</p>
              <div className="flex flex-wrap gap-1.5">
                {employee.knowledgeAreas.map((k) => (
                  <span key={k} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-800">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          Save Changes
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--status-good)]">
            <CheckCircle2 className="h-4 w-4" />
            Saved to HR System
          </span>
        )}
      </div>

      <SourceSystemNotice>
        The HR system is the source of employee information — WorkLens reflects these changes immediately.
      </SourceSystemNotice>
    </SystemPageShell>
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
