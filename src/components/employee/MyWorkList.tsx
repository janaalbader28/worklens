"use client";

import type { Employee } from "@/data/types";
import { WorkItemRow, type WorkRow } from "@/components/work/WorkItemRow";
import { useTickets, type AssignedTicket } from "@/store/tickets-store";

export function MyWorkList({ employee, assignedTickets }: { employee: Employee; assignedTickets: AssignedTicket[] }) {
  const { updateTicketStatus } = useTickets();

  const rows: WorkRow[] = [
    ...employee.upcomingTickets.map((t) => ({
      key: `${employee.id}:${t.id}`,
      title: t.title,
      type: "Ticket" as const,
      priority: t.priority,
      deadline: t.deadline,
      estimatedHours: t.estimatedHours,
    })),
    ...employee.adhoc.map((a) => ({
      key: `${employee.id}:${a.id}`,
      title: a.name,
      type: "Ad-hoc" as const,
      priority: a.priority,
      deadline: a.deadline,
      estimatedHours: a.estimatedHours,
    })),
    ...assignedTickets.map((t) => ({
      key: `${employee.id}:${t.id}`,
      title: t.assignedEmployeeIds && t.assignedEmployeeIds.length > 1 ? `${t.title} (${t.id}) — shared` : `${t.title} (${t.id})`,
      type: "Ticket" as const,
      priority: t.priority,
      deadline: t.expectedResolutionDate,
      estimatedHours: t.estimatedHours,
      ticketId: t.id,
      ticketStatus: t.status,
    })),
  ];

  if (rows.length === 0) {
    return <p className="text-sm text-ink-muted py-4">No active assignments.</p>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <WorkItemRow
          key={row.key}
          row={row}
          currentUserName={employee.name}
          onUpdateTicketStatus={(id, status) => updateTicketStatus(id, status).catch(() => {})}
        />
      ))}
    </div>
  );
}
