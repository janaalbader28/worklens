"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { usePersistedState } from "./use-persisted-state";

const STORAGE_KEY = "worklens-demo:handover-requests";

export interface HandoverRequest {
  id: string;
  employeeId: string;
  note: string;
  startDate: string;
  endDate: string;
  affectedWork: string[];
  status: "Pending Supervisor Review" | "Reviewed";
  submittedAt: string;
}

interface HandoverRequestsContextValue {
  requests: HandoverRequest[];
  submitRequest: (input: Omit<HandoverRequest, "id" | "status" | "submittedAt">) => void;
  markReviewed: (id: string) => void;
}

const HandoverRequestsContext = createContext<HandoverRequestsContextValue | null>(null);

export function HandoverRequestsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = usePersistedState<HandoverRequest[]>(STORAGE_KEY, []);

  const submitRequest = useCallback((input: Omit<HandoverRequest, "id" | "status" | "submittedAt">) => {
    setRequests((prev) => [
      { ...input, id: `HR-${Date.now().toString(36)}`, status: "Pending Supervisor Review", submittedAt: "Just now" },
      ...prev,
    ]);
  }, [setRequests]);

  const markReviewed = useCallback((id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Reviewed" } : r)));
  }, [setRequests]);

  const value = useMemo(() => ({ requests, submitRequest, markReviewed }), [requests, submitRequest, markReviewed]);

  return <HandoverRequestsContext.Provider value={value}>{children}</HandoverRequestsContext.Provider>;
}

export function useHandoverRequests() {
  const ctx = useContext(HandoverRequestsContext);
  if (!ctx) throw new Error("useHandoverRequests must be used within HandoverRequestsProvider");
  return ctx;
}
