"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Check } from "lucide-react";

export function RoleSwitcher({ role }: { role: "supervisor" | "employee" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-brand-50 transition-colors"
      >
        {role === "supervisor" ? "Supervisor" : "Employee"}
        <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-lg border border-border bg-surface shadow-lg py-1.5 z-50">
          <p className="px-3 pt-1 pb-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
            Switch role
          </p>
          <Link
            href="/supervisor"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-sm text-ink hover:bg-brand-50"
          >
            Supervisor
            {role === "supervisor" && <Check className="h-4 w-4 text-brand-600" />}
          </Link>
          <Link
            href="/employee"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-sm text-ink hover:bg-brand-50"
          >
            Employee
            {role === "employee" && <Check className="h-4 w-4 text-brand-600" />}
          </Link>
        </div>
      )}
    </div>
  );
}
