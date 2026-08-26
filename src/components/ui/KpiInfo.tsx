"use client";

import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

export interface KpiExplainer {
  meaning: string;
  calculation: string;
  example: string;
}

export const KPI_EXPLAINERS: Record<string, KpiExplainer> = {
  utilization: {
    meaning: "Measures the percentage of an employee's available working capacity currently committed to work.",
    calculation: "Committed Work Hours ÷ Available Working Hours × 100",
    example: "32 committed hours ÷ 40 available hours = 80% utilization",
  },
  availableCapacity: {
    meaning: "Remaining capacity after accounting for assigned work.",
    calculation: "Available Working Hours − Committed Work Hours",
    example: "40 − 32 = 8 available hours",
  },
  atRisk: {
    meaning: "An employee is at risk of overload when committed work is high relative to available capacity, but hasn't crossed the overload line yet.",
    calculation: "Utilization between the healthy and overloaded thresholds (80–95%, illustrative)",
    example: "36 committed hours ÷ 40 available hours = 90% → At Risk",
  },
  overloaded: {
    meaning: "An employee is considered overloaded when committed work exceeds available working capacity.",
    calculation: "Committed Work Hours ÷ Available Working Hours × 100, above the overload threshold (illustrative: 95%)",
    example: "43 committed hours ÷ 40 available hours = 107.5% → Overloaded",
  },
  activeTasks: {
    meaning: "The count of projects, tickets and ad-hoc items currently assigned across the unit.",
    calculation: "Sum of open projects + tickets + ad-hoc items per employee",
    example: "3 employees with 2 tasks each = 6 active tasks",
  },
  openTickets: {
    meaning: "Tickets from the IT Ticket System assigned to this unit that are not yet resolved or closed.",
    calculation: "Count of synced tickets where Assigned Unit = this unit and Status is not Resolved/Closed",
    example: "5 open + 2 in progress = 7 open tickets",
  },
};

export function KpiInfo({ topic }: { topic: keyof typeof KPI_EXPLAINERS }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const explainer = KPI_EXPLAINERS[topic];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="What does this mean?"
        className="text-ink-muted hover:text-brand-600"
      >
        <Info className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-lg border border-border bg-surface p-4 text-left shadow-lg">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">What it means</p>
          <p className="mt-1 text-xs leading-relaxed text-ink">{explainer.meaning}</p>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">How it&rsquo;s calculated</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-secondary font-mono">{explainer.calculation}</p>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Example</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{explainer.example}</p>
        </div>
      )}
    </div>
  );
}
