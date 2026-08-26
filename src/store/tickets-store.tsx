"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { Department } from "@/data/types";
import { TICKETS, type Ticket, type TicketStatus } from "@/data/tickets";
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
  assignedEmployeeId?: string;
}

interface TicketsContextValue {
  tickets: AssignedTicket[];
  loading: boolean;
  error: string | null;
  addTicket: (ticket: Omit<AssignedTicket, "id" | "resolvedDate">) => Promise<void>;
  updateTicketStatus: (id: string, status: TicketStatus) => Promise<void>;
  assignTicketToEmployee: (id: string, employeeId: string) => Promise<void>;
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

  const assignTicketToEmployee = useCallback(
    async (id: string, employeeId: string) => {
      const { error: updateError } = await supabase.from(TABLE).update({ assignedEmployeeId: employeeId }).eq("id", id);
      if (updateError) throw updateError;
      await refetch();
    },
    [refetch]
  );

  const value = useMemo(
    () => ({ tickets, loading, error, addTicket, updateTicketStatus, assignTicketToEmployee }),
    [tickets, loading, error, addTicket, updateTicketStatus, assignTicketToEmployee]
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
  return tickets.filter((t) => t.assignedUnit === unit && !t.assignedEmployeeId && t.status !== "Closed");
}
