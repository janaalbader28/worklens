"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { WorkflowStatus } from "@/data/types";
import { supabase } from "@/lib/supabase";
import { useSupabaseTable } from "@/store/use-supabase-table";

// Overlays employee-controlled workflow status, notes and supervisor messages onto the
// otherwise-static work items (projects/tickets/ad-hoc) each employee record carries.
// Keyed by "<employeeId>:<itemId>" so items from different employees never collide;
// that composite key maps directly to work_log_entries' (employeeId, itemId) primary key.

const TABLE = "work_log_entries";

interface WorkLogRow {
  employeeId: string;
  itemId: string;
  workflowStatus?: WorkflowStatus;
  notes: { text: string; at: string }[];
  messages: { text: string; at: string }[];
}

export interface WorkLogEntry {
  workflowStatus?: WorkflowStatus;
  notes: { text: string; at: string }[];
  messages: { text: string; at: string }[];
}

const EMPTY_ENTRY: WorkLogEntry = { notes: [], messages: [] };

function splitKey(key: string): { employeeId: string; itemId: string } {
  const idx = key.indexOf(":");
  return { employeeId: key.slice(0, idx), itemId: key.slice(idx + 1) };
}

interface WorkLogContextValue {
  loading: boolean;
  error: string | null;
  getEntry: (key: string) => WorkLogEntry;
  setWorkflowStatus: (key: string, status: WorkflowStatus) => Promise<void>;
  addNote: (key: string, text: string) => Promise<void>;
  addMessage: (key: string, text: string) => Promise<void>;
}

const WorkLogContext = createContext<WorkLogContextValue | null>(null);

export function WorkLogProvider({ children }: { children: ReactNode }) {
  const { rows, loading, error, refetch } = useSupabaseTable<WorkLogRow>(TABLE, []);

  const getEntry = useCallback(
    (key: string): WorkLogEntry => {
      const { employeeId, itemId } = splitKey(key);
      const row = rows.find((r) => r.employeeId === employeeId && r.itemId === itemId);
      return row ? { workflowStatus: row.workflowStatus, notes: row.notes, messages: row.messages } : EMPTY_ENTRY;
    },
    [rows]
  );

  const upsertEntry = useCallback(
    async (key: string, patch: Partial<Omit<WorkLogRow, "employeeId" | "itemId">>) => {
      const { employeeId, itemId } = splitKey(key);
      const current = getEntry(key);
      const row: WorkLogRow = { employeeId, itemId, ...current, ...patch };
      const { error: upsertError } = await supabase.from(TABLE).upsert(row, { onConflict: "employeeId,itemId" });
      if (upsertError) throw upsertError;
      await refetch();
    },
    [getEntry, refetch]
  );

  const setWorkflowStatus = useCallback(
    (key: string, status: WorkflowStatus) => upsertEntry(key, { workflowStatus: status }),
    [upsertEntry]
  );

  const addNote = useCallback(
    (key: string, text: string) => {
      const entry = getEntry(key);
      return upsertEntry(key, { notes: [...entry.notes, { text, at: "Just now" }] });
    },
    [getEntry, upsertEntry]
  );

  const addMessage = useCallback(
    (key: string, text: string) => {
      const entry = getEntry(key);
      return upsertEntry(key, { messages: [...entry.messages, { text, at: "Just now" }] });
    },
    [getEntry, upsertEntry]
  );

  const value = useMemo(
    () => ({ loading, error, getEntry, setWorkflowStatus, addNote, addMessage }),
    [loading, error, getEntry, setWorkflowStatus, addNote, addMessage]
  );

  return <WorkLogContext.Provider value={value}>{children}</WorkLogContext.Provider>;
}

export function useWorkLog() {
  const ctx = useContext(WorkLogContext);
  if (!ctx) throw new Error("useWorkLog must be used within WorkLogProvider");
  return ctx;
}
