"use client";

import type { ReactNode } from "react";
import { AppShell } from "./AppShell";
import { useEmployeeSession } from "@/store/session-store";
import { useEmployees } from "@/store/employees-store";

export function EmployeeAppShell({ children }: { children: ReactNode }) {
  const { employeeId } = useEmployeeSession();
  const { employees } = useEmployees();
  const employee = employees.find((e) => e.id === employeeId) ?? employees.find((e) => e.id === "sara-al-qahtani")!;

  return (
    <AppShell role="employee" personaName={employee.name} personaTitle={employee.title}>
      {children}
    </AppShell>
  );
}
