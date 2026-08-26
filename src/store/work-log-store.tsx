"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { WorkflowStatus } from "@/data/types";
import { usePersistedState } from "./use-persisted-state";

// Overlays employee-controlled workflow status, notes and supervisor messages onto the
// otherwise-static work items (projects/tickets/ad-hoc) each employee record carries.
// Keyed by "<employeeId>:<itemId>" so items from different employees never collide.

const STORAGE_KEY = "worklens-demo:work-log";

export interface WorkLogEntry {
  workflowStatus?: WorkflowStatus;
  notes: { text: string; at: string }[];
  messages: { text: string; at: string }[];
}

const EMPTY_ENTRY: WorkLogEntry = { notes: [], messages: [] };

interface WorkLogContextValue {
  getEntry: (key: string) => WorkLogEntry;
  setWorkflowStatus: (key: string, status: WorkflowStatus) => void;
  addNote: (key: string, text: string) => void;
  addMessage: (key: string, text: string) => void;
}

const WorkLogContext = createContext<WorkLogContextValue | null>(null);

export function WorkLogProvider({ children }: { children: ReactNode }) {
  const [log, setLog] = usePersistedState<Record<string, WorkLogEntry>>(STORAGE_KEY, {});

  const getEntry = useCallback((key: string) => log[key] ?? EMPTY_ENTRY, [log]);

  const setWorkflowStatus = useCallback((key: string, status: WorkflowStatus) => {
    setLog((prev) => ({ ...prev, [key]: { ...(prev[key] ?? EMPTY_ENTRY), workflowStatus: status } }));
  }, [setLog]);

  const addNote = useCallback((key: string, text: string) => {
    setLog((prev) => {
      const entry = prev[key] ?? EMPTY_ENTRY;
      return { ...prev, [key]: { ...entry, notes: [...entry.notes, { text, at: "Just now" }] } };
    });
  }, [setLog]);

  const addMessage = useCallback((key: string, text: string) => {
    setLog((prev) => {
      const entry = prev[key] ?? EMPTY_ENTRY;
      return { ...prev, [key]: { ...entry, messages: [...entry.messages, { text, at: "Just now" }] } };
    });
  }, [setLog]);

  const value = useMemo(
    () => ({ getEntry, setWorkflowStatus, addNote, addMessage }),
    [getEntry, setWorkflowStatus, addNote, addMessage]
  );

  return <WorkLogContext.Provider value={value}>{children}</WorkLogContext.Provider>;
}

export function useWorkLog() {
  const ctx = useContext(WorkLogContext);
  if (!ctx) throw new Error("useWorkLog must be used within WorkLogProvider");
  return ctx;
}
