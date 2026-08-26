"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { SdlcActivity } from "@/data/sdlc";
import { SDLC_ACTIVITIES } from "@/data/sdlc";
import { usePersistedState } from "@/store/use-persisted-state";

// Simulates the SDLC system's own copy of development activity data, held
// independently of WorkLens — same pattern as the HR system's editable store.

const STORAGE_KEY = "worklens-demo:sdlc-activities";

interface SdlcContextValue {
  activities: SdlcActivity[];
  updateActivity: (id: string, patch: Partial<SdlcActivity>) => void;
  addActivity: (activity: SdlcActivity) => void;
}

const SdlcContext = createContext<SdlcContextValue | null>(null);

export function SdlcProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = usePersistedState<SdlcActivity[]>(STORAGE_KEY, SDLC_ACTIVITIES);

  const updateActivity = useCallback(
    (id: string, patch: Partial<SdlcActivity>) => {
      setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    },
    [setActivities]
  );

  const addActivity = useCallback(
    (activity: SdlcActivity) => {
      setActivities((prev) => [activity, ...prev]);
    },
    [setActivities]
  );

  const value = useMemo(
    () => ({ activities, updateActivity, addActivity }),
    [activities, updateActivity, addActivity]
  );

  return <SdlcContext.Provider value={value}>{children}</SdlcContext.Provider>;
}

export function useSdlcActivities() {
  const ctx = useContext(SdlcContext);
  if (!ctx) throw new Error("useSdlcActivities must be used within SdlcProvider");
  return ctx;
}
