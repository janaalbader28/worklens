"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useSupervisorSession } from "@/store/session-store";
import { useEmployees } from "@/store/employees-store";
import { useTickets } from "@/store/tickets-store";
import { computeUnitSummary } from "@/lib/unit-summary";
import { DEMO_TODAY, parseLooseDate } from "@/lib/date";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type ItemKind = "Project" | "Ticket" | "Ad-hoc" | "Leave";

const ITEM_STYLES: Record<ItemKind, string> = {
  Project: "bg-brand-50 border-brand-100 text-brand-800",
  Ticket: "bg-[var(--status-warning-bg)] border-[var(--status-warning-border)] text-[var(--status-warning)]",
  "Ad-hoc": "bg-brand-50/60 border-border-strong text-ink-secondary",
  Leave: "border-accent-violet/30 bg-accent-violet-bg text-accent-violet",
};

const LEGEND: { kind: ItemKind; label: string }[] = [
  { kind: "Project", label: "Project deadline" },
  { kind: "Ticket", label: "Ticket deadline" },
  { kind: "Ad-hoc", label: "Ad-hoc deadline" },
  { kind: "Leave", label: "Leave / unavailability" },
];

interface DayItem {
  key: string;
  label: string;
  sublabel: string;
  kind: ItemKind;
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function SupervisorCalendarPage() {
  const { unit } = useSupervisorSession();
  const { employees } = useEmployees();
  const { tickets } = useTickets();
  const summary = useMemo(() => computeUnitSummary(unit, employees, tickets), [unit, employees, tickets]);
  const unitEmployees = summary.employees;

  const [cursor, setCursor] = useState(() => new Date(DEMO_TODAY.getFullYear(), DEMO_TODAY.getMonth(), 1));

  const itemsByDay = useMemo(() => {
    const map = new Map<string, DayItem[]>();
    const push = (key: string, item: DayItem) => {
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    };
    const pushOnDate = (dateStr: string, item: DayItem) => {
      const d = parseLooseDate(dateStr);
      if (!d) return;
      push(dayKey(d), item);
    };

    unitEmployees.forEach((e) => {
      const first = e.name.split(" ")[0];
      e.upcomingProjects.forEach((p) =>
        pushOnDate(p.deadline, { key: `p-${p.id}-${e.id}`, label: p.name, sublabel: first, kind: "Project" })
      );
      e.upcomingTickets.forEach((t) =>
        pushOnDate(t.deadline, { key: `t-${t.id}-${e.id}`, label: t.title, sublabel: first, kind: "Ticket" })
      );
      e.adhoc.forEach((a) => {
        if (a.deadline === "Ongoing") return;
        pushOnDate(a.deadline, { key: `a-${a.id}-${e.id}`, label: a.name, sublabel: first, kind: "Ad-hoc" });
      });
      e.leaveEvents.forEach((l) => {
        const start = parseLooseDate(l.start);
        const end = parseLooseDate(l.end);
        if (!start || !end) return;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          push(dayKey(d), { key: `l-${l.id}-${e.id}-${dayKey(d)}`, label: l.type, sublabel: first, kind: "Leave" });
        }
      });
    });
    return map;
  }, [unitEmployees]);

  const weeks = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const startOffset = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [cursor]);

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const isCurrentMonth = cursor.getFullYear() === DEMO_TODAY.getFullYear() && cursor.getMonth() === DEMO_TODAY.getMonth();

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Calendar</h1>
        <p className="mt-1 text-sm text-ink-muted">{unit} · deadlines and leave, day by day.</p>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">{monthLabel}</h2>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
              className="rounded-lg border border-border-strong p-1.5 text-ink-secondary hover:bg-brand-50"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCursor(new Date(DEMO_TODAY.getFullYear(), DEMO_TODAY.getMonth(), 1))}
              disabled={isCurrentMonth}
              className="rounded-lg border border-border-strong px-3 py-1.5 text-xs font-medium text-ink-secondary hover:bg-brand-50 disabled:opacity-50"
            >
              Today
            </button>
            <button
              onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
              className="rounded-lg border border-border-strong p-1.5 text-ink-secondary hover:bg-brand-50"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border text-xs">
          {WEEKDAYS.map((d) => (
            <div key={d} className="bg-brand-50/60 px-2 py-1.5 text-center font-medium uppercase tracking-wide text-ink-secondary">
              {d}
            </div>
          ))}
          {weeks.flatMap((week, wi) =>
            week.map((date, di) => {
              const key = date ? dayKey(date) : `blank-${wi}-${di}`;
              const items = date ? itemsByDay.get(key) ?? [] : [];
              const isToday = date ? date.toDateString() === DEMO_TODAY.toDateString() : false;
              const visible = items.slice(0, 3);
              return (
                <div key={key} className={`min-h-[104px] bg-surface p-1.5 ${date ? "" : "bg-brand-50/20"}`}>
                  {date && (
                    <>
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs tabular ${
                          isToday ? "bg-brand-800 font-semibold text-white" : "text-ink-secondary"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      <div className="mt-1 space-y-1">
                        {visible.map((item) => (
                          <div
                            key={item.key}
                            title={`${item.label} — ${item.sublabel}`}
                            className={`truncate rounded border px-1.5 py-0.5 text-[10px] font-medium ${ITEM_STYLES[item.kind]}`}
                          >
                            {item.label}
                          </div>
                        ))}
                        {items.length > 3 && <p className="px-1 text-[10px] text-ink-muted">+{items.length - 3} more</p>}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-3 text-xs text-ink-muted">
          {LEGEND.map(({ kind, label }) => (
            <span key={kind} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded border ${ITEM_STYLES[kind]}`} />
              {label}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
