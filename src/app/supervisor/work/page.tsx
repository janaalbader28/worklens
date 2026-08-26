"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Crown, X, Award, CalendarClock, Clock, ChevronRight } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { PriorityBadge } from "@/components/ui/StatusBadge";
import { CapacityBar } from "@/components/ui/ProgressBar";
import { AiTag } from "@/components/ui/AiTag";
import { FLOW_PROJECTS } from "@/data/flow";
import type { AssignedTicket } from "@/store/tickets-store";
import { useTickets } from "@/store/tickets-store";
import { useSupervisorSession } from "@/store/session-store";
import { useEmployees } from "@/store/employees-store";
import { ticketsForUnit } from "@/store/tickets-store";
import { rankCandidatesForTicket, type TicketCandidate } from "@/lib/ticketMatch";
import type { Employee } from "@/data/types";

export default function SupervisorWorkPage() {
  const { unit } = useSupervisorSession();
  const { tickets, assignTicketToEmployee } = useTickets();
  const { employees } = useEmployees();
  const [assigning, setAssigning] = useState<Record<string, string>>({});
  const [openTicket, setOpenTicket] = useState<AssignedTicket | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);

  const unitTickets = useMemo(() => ticketsForUnit(tickets, unit), [tickets, unit]);
  const queue = unitTickets.filter((t) => !t.assignedEmployeeId && t.status !== "Closed" && t.status !== "Resolved");
  const assigned = unitTickets.filter((t) => t.assignedEmployeeId);
  const unitEmployees = employees.filter((e) => e.department === unit);
  const unitFlowWork = FLOW_PROJECTS.filter((p) => p.assignedUnit === unit);

  const candidatesByTicket = useMemo(() => {
    const map = new Map<string, TicketCandidate[]>();
    queue.forEach((t) => map.set(t.id, rankCandidatesForTicket(unitEmployees, t, 3)));
    return map;
  }, [queue, unitEmployees]);

  async function handleAssign(ticketId: string, employeeId: string) {
    setAssignError(null);
    try {
      await assignTicketToEmployee(ticketId, employeeId);
      setAssigning((prev) => ({ ...prev, [ticketId]: "" }));
      setOpenTicket(null);
    } catch {
      setAssignError("Couldn't assign this ticket — check your connection and try again.");
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Tasks</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Incoming work for {unit}. Tickets arrive from the IT Ticket System assigned to your unit only — decide who
          on your team should handle each one.
        </p>
      </div>

      {assignError && (
        <p className="rounded-lg border border-[var(--status-critical-border)] bg-[var(--status-critical-bg)] px-4 py-3 text-sm text-[var(--status-critical)]">
          {assignError}
        </p>
      )}

      <Card>
        <CardHeader
          title="Unassigned Tickets"
          subtitle={`${queue.length} ticket${queue.length === 1 ? "" : "s"} waiting for an owner · click a ticket for suggested candidates`}
        />
        {queue.length === 0 ? (
          <p className="text-sm text-ink-muted py-4">No unassigned tickets for {unit} right now.</p>
        ) : (
          <ul className="divide-y divide-border">
            {queue.map((t) => {
              const candidates = candidatesByTicket.get(t.id) ?? [];
              const top = candidates[0];
              return (
                <li
                  key={t.id}
                  onClick={() => setOpenTicket(t)}
                  onKeyDown={(e) => e.key === "Enter" && setOpenTicket(t)}
                  tabIndex={0}
                  role="button"
                  className="flex flex-wrap items-center justify-between gap-3 py-3.5 cursor-pointer rounded-lg px-2 -mx-2 hover:bg-brand-50/40 focus:bg-brand-50/40 outline-none transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">
                      {t.title} <span className="text-xs font-normal text-ink-muted">({t.id})</span>
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Raised {t.raisedDate} · {t.estimatedHours}h estimated · SLA {t.slaHours}h
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <PriorityBadge priority={t.priority} />
                    {top && (
                      <span
                        title={`Suggested: ${top.employee.name} (${top.skillMatch}% skill match)`}
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${
                          top.skillMatch > 0
                            ? "border-[var(--status-good-border)] bg-[var(--status-good-bg)] text-[var(--status-good)]"
                            : "border-border-strong bg-brand-50/60 text-ink-secondary"
                        }`}
                      >
                        <Crown className="h-3 w-3" />
                        {top.employee.name.split(" ")[0]}
                      </span>
                    )}
                    <select
                      value={assigning[t.id] ?? ""}
                      onChange={(e) => setAssigning((prev) => ({ ...prev, [t.id]: e.target.value }))}
                      className="input max-w-[200px]"
                    >
                      <option value="">Assign to…</option>
                      {unitEmployees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                    <button
                      disabled={!assigning[t.id]}
                      onClick={() => handleAssign(t.id, assigning[t.id])}
                      className="rounded-lg bg-brand-800 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
                    >
                      Assign
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {assigned.length > 0 && (
        <Card>
          <CardHeader title="Recently Assigned" subtitle="Tickets already routed to a team member inside WorkLens" />
          <ul className="divide-y divide-border">
            {assigned.map((t) => {
              const owner = employees.find((e) => e.id === t.assignedEmployeeId);
              return (
                <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {t.title} <span className="text-xs font-normal text-ink-muted">({t.id})</span>
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5">Assigned to {owner?.name ?? "Unknown"}</p>
                  </div>
                  <PriorityBadge priority={t.priority} />
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Card>
        <CardHeader title="FLOW Work for This Unit" subtitle="Reference from the FLOW source system · click a record for details" />
        {unitFlowWork.length === 0 ? (
          <p className="text-sm text-ink-muted py-4">No FLOW work currently assigned to {unit}.</p>
        ) : (
          <ul className="divide-y divide-border">
            {unitFlowWork.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/systems/flow/${p.id}`}
                  className="group flex items-center justify-between gap-3 py-3 -mx-2 px-2 rounded-lg hover:bg-brand-50/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink group-hover:text-brand-700 group-hover:underline underline-offset-2">
                      {p.project} <span className="text-xs font-normal text-ink-muted no-underline">— {p.task}</span>
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5">Deadline {p.deadline}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge priority={p.priority} />
                    <ChevronRight className="h-4 w-4 text-ink-muted" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {openTicket && (
        <TicketDetailModal
          ticket={openTicket}
          candidates={candidatesByTicket.get(openTicket.id) ?? []}
          onAssign={(employeeId) => handleAssign(openTicket.id, employeeId)}
          onClose={() => setOpenTicket(null)}
        />
      )}
    </div>
  );
}

function TicketDetailModal({
  ticket,
  candidates,
  onAssign,
  onClose,
}: {
  ticket: AssignedTicket;
  candidates: TicketCandidate[];
  onAssign: (employeeId: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-8" onClick={onClose}>
      <div
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-1">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{ticket.id}</p>
            <h2 className="mt-0.5 text-lg font-semibold text-ink">{ticket.title}</h2>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mb-4">
          <PriorityBadge priority={ticket.priority} />
        </div>

        <p className="text-sm text-ink-secondary leading-relaxed">{ticket.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-border bg-brand-50/40 p-3.5 text-xs sm:grid-cols-4">
          <Detail label="Raised" value={ticket.raisedDate} />
          <Detail label="Estimated" value={`${ticket.estimatedHours}h`} />
          <Detail label="SLA" value={`${ticket.slaHours}h`} />
          <Detail label="Expected By" value={ticket.expectedResolutionDate} />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-ink">Top {candidates.length} Suggested Employees</h3>
            <AiTag label="AI-assisted recommendation" />
          </div>

          {candidates.length === 0 ? (
            <p className="text-sm text-ink-muted py-4">No employees available in this unit to suggest.</p>
          ) : (
            <div className="space-y-3">
              {candidates.map((c, idx) => (
                <CandidateCard key={c.employee.id} candidate={c} best={idx === 0} onAssign={() => onAssign(c.employee.id)} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-lg border border-border bg-brand-50/40 px-3.5 py-3">
          <CalendarClock className="h-4 w-4 mt-0.5 shrink-0 text-brand-600" />
          <p className="text-xs leading-relaxed text-ink-secondary">
            Suggestions are generated from skill keywords found in the ticket text and each employee&rsquo;s current
            capacity. <span className="font-medium text-ink">Assignment remains a human decision.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function CandidateCard({ candidate, best, onAssign }: { candidate: TicketCandidate; best: boolean; onAssign: () => void }) {
  const e: Employee = candidate.employee;
  return (
    <div className={`rounded-lg border p-3.5 ${best ? "border-2 border-brand-600 shadow-sm" : "border-border"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 shrink-0 rounded-full bg-brand-800 text-white text-xs font-semibold flex items-center justify-center">
            {e.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium text-ink">{e.name}</p>
            <p className="truncate text-xs text-ink-muted">{e.title}</p>
          </div>
        </div>
        {best && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-800 px-2.5 py-1 text-[11px] font-semibold text-white">
            <Award className="h-3 w-3" />
            Best Match
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
        <div>
          <p className="text-ink-muted">Skill Match</p>
          <p className="tabular font-semibold text-ink">{candidate.skillMatch}%</p>
        </div>
        <div>
          <p className="text-ink-muted">Available</p>
          <p className="tabular font-semibold text-ink">{candidate.availableCapacity}%</p>
        </div>
        <div>
          <p className="text-ink-muted">If Assigned</p>
          <p className="tabular font-semibold text-ink">{candidate.projectedCapacity}%</p>
        </div>
      </div>

      <div className="mt-2.5">
        <CapacityBar value={candidate.projectedCapacity} showLabel={false} />
      </div>

      <ul className="mt-3 space-y-1">
        {candidate.reasons.map((reason) => (
          <li key={reason} className="flex items-start gap-1.5 text-xs text-ink-secondary">
            <Clock className="h-3 w-3 mt-0.5 shrink-0 text-ink-muted" />
            {reason}
          </li>
        ))}
      </ul>

      <button
        onClick={onAssign}
        className="mt-3.5 w-full rounded-lg bg-brand-800 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
      >
        Assign to {e.name.split(" ")[0]}
      </button>
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
