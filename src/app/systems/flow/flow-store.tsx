"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { FlowProject } from "@/data/flow";
import { FLOW_PROJECTS } from "@/data/flow";
import { supabase } from "@/lib/supabase";
import { useSupabaseTable } from "@/store/use-supabase-table";

// FLOW's own project/task data — shared via Supabase so a project logged here shows
// up for every device, the same as HR and the IT Ticket System.
const TABLE = "flow_projects";

interface FlowContextValue {
  projects: FlowProject[];
  loading: boolean;
  error: string | null;
  updateProject: (id: string, patch: Partial<FlowProject>) => Promise<void>;
  addProject: (project: FlowProject) => Promise<void>;
}

const FlowContext = createContext<FlowContextValue | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const { rows: projects, loading, error, refetch } = useSupabaseTable<FlowProject>(TABLE, FLOW_PROJECTS);

  const updateProject = useCallback(
    async (id: string, patch: Partial<FlowProject>) => {
      const { error: updateError } = await supabase.from(TABLE).update(patch).eq("id", id);
      if (updateError) throw updateError;
      await refetch();
    },
    [refetch]
  );

  const addProject = useCallback(
    async (project: FlowProject) => {
      const { error: insertError } = await supabase.from(TABLE).insert(project);
      if (insertError) throw insertError;
      await refetch();
    },
    [refetch]
  );

  const value = useMemo(
    () => ({ projects, loading, error, updateProject, addProject }),
    [projects, loading, error, updateProject, addProject]
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlowProjects() {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error("useFlowProjects must be used within FlowProvider");
  return ctx;
}
