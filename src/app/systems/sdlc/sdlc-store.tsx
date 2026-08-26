"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { SdlcActivity } from "@/data/sdlc";
import { SDLC_ACTIVITIES } from "@/data/sdlc";
import { supabase } from "@/lib/supabase";
import { useSupabaseTable } from "@/store/use-supabase-table";

// SDLC's own development activity data — shared via Supabase, same pattern as FLOW.
const TABLE = "sdlc_activities";

interface SdlcContextValue {
  activities: SdlcActivity[];
  loading: boolean;
  error: string | null;
  updateActivity: (id: string, patch: Partial<SdlcActivity>) => Promise<void>;
  addActivity: (activity: SdlcActivity) => Promise<void>;
}

const SdlcContext = createContext<SdlcContextValue | null>(null);

export function SdlcProvider({ children }: { children: ReactNode }) {
  const { rows: activities, loading, error, refetch } = useSupabaseTable<SdlcActivity>(TABLE, SDLC_ACTIVITIES);

  const updateActivity = useCallback(
    async (id: string, patch: Partial<SdlcActivity>) => {
      const { error: updateError } = await supabase.from(TABLE).update(patch).eq("id", id);
      if (updateError) throw updateError;
      await refetch();
    },
    [refetch]
  );

  const addActivity = useCallback(
    async (activity: SdlcActivity) => {
      const { error: insertError } = await supabase.from(TABLE).insert(activity);
      if (insertError) throw insertError;
      await refetch();
    },
    [refetch]
  );

  const value = useMemo(
    () => ({ activities, loading, error, updateActivity, addActivity }),
    [activities, loading, error, updateActivity, addActivity]
  );

  return <SdlcContext.Provider value={value}>{children}</SdlcContext.Provider>;
}

export function useSdlcActivities() {
  const ctx = useContext(SdlcContext);
  if (!ctx) throw new Error("useSdlcActivities must be used within SdlcProvider");
  return ctx;
}
