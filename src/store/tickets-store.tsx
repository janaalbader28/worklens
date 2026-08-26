"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { Department } from "@/data/types";
import { TICKETS, type Ticket, type TicketStatus } from "@/data/tickets";
import { usePersistedState } from "./use-persisted-state";
import { DEMO_TODAY_LABEL } from "@/lib/date";

// The one genuinely shared, cross-system store in this prototype: it's written to by
// the IT Ticket System pages and read by WorkLens (Work queue, employee ticket lists),
// which is exactly the "existing systems are the source, WorkLens consumes it" story —
// a ticket created in the IT Ticket System becomes visible workload in WorkLens without
// a page reload. Assignment to a specific employee happens only on the WorkLens side.

// v2: seed tickets gained a `relatedSkills` field — bumped so browsers with tickets
// cached from before that change pick up the refreshed seed data.
const STORAGE_KEY = "worklens-demo:tickets:v2";

export interface AssignedTicket extends Ticket {
  assignedEmployeeId?: string;
}

interface TicketsContextValue {
  tickets: AssignedTicket[];
  addTicket: (ticket: Omit<AssignedTicket, "id" | "resolvedDate">) => AssignedTicket;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  assignTicketToEmployee: (id: string, employeeId: string) => void;
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
  const [tickets, setTickets] = usePersistedState<AssignedTicket[]>(STORAGE_KEY, TICKETS);

  const addTicket = useCallback((input: Omit<AssignedTicket, "id" | "resolvedDate">) => {
    let created!: AssignedTicket;
    setTickets((prev) => {
      created = { ...input, id: nextIncidentId(prev), resolvedDate: null };
      return [created, ...prev];
    });
    return created!;
  }, [setTickets]);

  const updateTicketStatus = useCallback((id: string, status: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              resolvedDate:
                status === "Resolved" || status === "Closed" ? (t.resolvedDate ?? DEMO_TODAY_LABEL) : t.resolvedDate,
            }
          : t
      )
    );
  }, [setTickets]);

  const assignTicketToEmployee = useCallback((id: string, employeeId: string) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, assignedEmployeeId: employeeId } : t)));
  }, [setTickets]);

  const value = useMemo(
    () => ({ tickets, addTicket, updateTicketStatus, assignTicketToEmployee }),
    [tickets, addTicket, updateTicketStatus, assignTicketToEmployee]
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
