"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { FlowProject } from "@/data/flow";
import { FLOW_PROJECTS } from "@/data/flow";
import { usePersistedState } from "@/store/use-persisted-state";

// Simulates FLOW's own copy of project/task data, held independently of WorkLens —
// same pattern as the HR system's editable store.

const STORAGE_KEY = "worklens-demo:flow-projects";

interface FlowContextValue {
  projects: FlowProject[];
  updateProject: (id: string, patch: Partial<FlowProject>) => void;
  addProject: (project: FlowProject) => void;
}

const FlowContext = createContext<FlowContextValue | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = usePersistedState<FlowProject[]>(STORAGE_KEY, FLOW_PROJECTS);

  const updateProject = useCallback(
    (id: string, patch: Partial<FlowProject>) => {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    },
    [setProjects]
  );

  const addProject = useCallback(
    (project: FlowProject) => {
      setProjects((prev) => [project, ...prev]);
    },
    [setProjects]
  );

  const value = useMemo(() => ({ projects, updateProject, addProject }), [projects, updateProject, addProject]);

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlowProjects() {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error("useFlowProjects must be used within FlowProvider");
  return ctx;
}
