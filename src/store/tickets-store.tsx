"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { Department } from "@/data/types";
import { TICKETS, type Ticket, type TicketStatus, type TicketPriority } from "@/data/tickets";
import { supabase } from "@/lib/supabase";
import { useSupabaseTable } from "@/store/use-supabase-table";
import { DEMO_TODAY_LABEL } from "@/lib/date";

// The one genuinely shared, cross-system store in this prototype: it's written to by
// the IT Ticket System pages and read by WorkLens (Work queue, employee ticket lists),
// which is exactly the "existing systems are the source, WorkLens consumes it" story —
// a ticket created in the IT Ticket System becomes visible workload in WorkLens without
// a page reload. Assignment to a specific employee happens only on the WorkLens side.
// Backed by Supabase so this is true across devices, not just across pages in one tab.
const TABLE = "tickets";

export interface AssignedTicket extends Ticket {
  /** Up to 2 employees — a ticket can be co-managed by two people. Status, priority
   * and skills stay single fields on the ticket itself (shared, not per-assignee), so
   * either assignee changing them reflects for both immediately. */
  assignedEmployeeIds?: string[];
}

const MAX_ASSIGNEES = 2;

interface TicketsContextValue {
  tickets: AssignedTicket[];
  loading: boolean;
  error: string | null;
  addTicket: (ticket: Omit<AssignedTicket, "id" | "resolvedDate">) => Promise<void>;
  updateTicketStatus: (id: string, status: TicketStatus) => Promise<void>;
  updateTicketPriority: (id: string, priority: TicketPriority) => Promise<void>;
  updateTicketSkills: (id: string, relatedSkills: string[]) => Promise<void>;
  /** Sets the ticket's sole assignee, replacing any existing assignee(s). */
  assignTicketToEmployee: (id: string, employeeId: string) => Promise<void>;
  /** Sets the ticket's full assignee list directly (up to 2) — used to add/remove a
   * co-assignee without disturbing the other one. */
  setTicketAssignees: (id: string, employeeIds: string[]) => Promise<void>;
}

const TicketsContext = createContext<TicketsContextValue | null>(null);

function nextIncidentId(existing: AssignedTicket[]): string {
  const numbers = existing
    .map((t) => Number(t.id.replace("INC-", "")))
    .filter((n) => !Number.isNaN(n));
  const next = (numbers.length ? Math.max(...numbers) : 1041) + 1;
  return `INC-${next}`;
}

export function TicketsProvider({ children }: { children: ReactNode }) {
  const { rows: tickets, loading, error, refetch } = useSupabaseTable<AssignedTicket>(TABLE, TICKETS);

  const addTicket = useCallback(
    async (input: Omit<AssignedTicket, "id" | "resolvedDate">) => {
      const created: AssignedTicket = { ...input, id: nextIncidentId(tickets), resolvedDate: null };
      const { error: insertError } = await supabase.from(TABLE).insert(created);
      if (insertError) throw insertError;
      await refetch();
    },
    [tickets, refetch]
  );

  const updateTicketStatus = useCallback(
    async (id: string, status: TicketStatus) => {
      const current = tickets.find((t) => t.id === id);
      const patch: Partial<AssignedTicket> = {
        status,
        resolvedDate:
          status === "Resolved" || status === "Closed" ? (current?.resolvedDate ?? DEMO_TODAY_LABEL) : current?.resolvedDate,
      };
      const { error: updateError } = await supabase.from(TABLE).update(patch).eq("id", id);
      if (updateError) throw updateError;
      await refetch();
    },
    [tickets, refetch]
  );

  const updateTicketPriority = useCallback(
    async (id: string, priority: TicketPriority) => {
      const { error: updateError } = await supabase.from(TABLE).update({ priority }).eq("id", id);
      if (updateError) throw updateError;
      await refetch();
    },
    [refetch]
  );

  const updateTicketSkills = useCallback(
    async (id: string, relatedSkills: string[]) => {
      const { error: updateError } = await supabase.from(TABLE).update({ relatedSkills }).eq("id", id);
      if (updateError) throw updateError;
      await refetch();
    },
    [refetch]
  );

  const assignTicketToEmployee = useCallback(
    async (id: string, employeeId: string) => {
      const { error: updateError } = await supabase.from(TABLE).update({ assignedEmployeeIds: [employeeId] }).eq("id", id);
      if (updateError) throw updateError;
      await refetch();
    },
    [refetch]
  );

  const setTicketAssignees = useCallback(
    async (id: string, employeeIds: string[]) => {
      const deduped = Array.from(new Set(employeeIds)).slice(0, MAX_ASSIGNEES);
      const { error: updateError } = await supabase.from(TABLE).update({ assignedEmployeeIds: deduped }).eq("id", id);
      if (updateError) throw updateError;
      await refetch();
    },
    [refetch]
  );

  const value = useMemo(
    () => ({
      tickets,
      loading,
      error,
      addTicket,
      updateTicketStatus,
      updateTicketPriority,
      updateTicketSkills,
      assignTicketToEmployee,
      setTicketAssignees,
    }),
    [tickets, loading, error, addTicket, updateTicketStatus, updateTicketPriority, updateTicketSkills, assignTicketToEmployee, setTicketAssignees]
  );

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>;
}

export function useTickets() {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error("useTickets must be used within TicketsProvider");
  return ctx;
}

export function ticketsForUnit(tickets: AssignedTicket[], unit: Department) {
  return tickets.filter((t) => t.assignedUnit === unit);
}

export function unassignedTicketsForUnit(tickets: AssignedTicket[], unit: Department) {
  return tickets.filter((t) => t.assignedUnit === unit && (t.assignedEmployeeIds ?? []).length === 0 && t.status !== "Closed");
}
