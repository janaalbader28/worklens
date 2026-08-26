"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { Employee } from "@/data/types";
import { EMPLOYEES as SEED_EMPLOYEES } from "@/data/employees";
import { usePersistedState } from "@/store/use-persisted-state";

// Shared, root-level employee directory — the same bridge pattern as tickets-store.
// The HR System writes here (profile edits, new hires); WorkLens supervisor/employee
// pages read from here, so a new IT hire shows up in the employee login list and the
// supervisor's team views without a separate sync step.
const STORAGE_KEY = "worklens-demo:hr-employees";

interface EmployeesContextValue {
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  resetToSeed: () => void;
}

const EmployeesContext = createContext<EmployeesContextValue | null>(null);

export function EmployeesProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = usePersistedState<Employee[]>(STORAGE_KEY, SEED_EMPLOYEES);

  const addEmployee = useCallback(
    (employee: Employee) => {
      setEmployees((prev) => [employee, ...prev]);
    },
    [setEmployees]
  );

  const updateEmployee = useCallback(
    (id: string, patch: Partial<Employee>) => {
      setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    },
    [setEmployees]
  );

  const resetToSeed = useCallback(() => {
    setEmployees(SEED_EMPLOYEES);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore.
    }
  }, [setEmployees]);

  const value = useMemo(
    () => ({ employees, addEmployee, updateEmployee, resetToSeed }),
    [employees, addEmployee, updateEmployee, resetToSeed]
  );

  return <EmployeesContext.Provider value={value}>{children}</EmployeesContext.Provider>;
}

export function useEmployees() {
  const ctx = useContext(EmployeesContext);
  if (!ctx) throw new Error("useEmployees must be used within EmployeesProvider");
  return ctx;
}
