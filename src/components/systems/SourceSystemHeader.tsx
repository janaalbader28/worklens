"use client";

import { useState, type ReactNode } from "react";
import { RefreshCw, Loader2, Check } from "lucide-react";
import type { SourceSystem } from "@/data/systems";

const ACCENT_BAR: Record<SourceSystem["accent"], string> = {
  blue: "bg-brand-600",
  amber: "bg-[var(--status-warning)]",
  teal: "bg-accent-teal",
  violet: "bg-accent-violet",
};

export function SourceSystemHeader({
  system,
  actions,
}: {
  system: Pick<SourceSystem, "name" | "subtitle" | "lastSync" | "accent">;
  actions?: ReactNode;
}) {
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "done">("idle");

  function handleSync() {
    setSyncState("syncing");
    window.setTimeout(() => {
      setSyncState("done");
      window.setTimeout(() => setSyncState("idle"), 1600);
    }, 900);
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className={`h-1 w-full ${ACCENT_BAR[system.accent]}`} />
        <div className="px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">External System</p>
              <h1 className="mt-0.5 text-2xl font-semibold text-ink tracking-tight">{system.name}</h1>
              <p className="mt-0.5 text-sm text-ink-secondary">{system.subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--status-good-border)] bg-[var(--status-good-bg)] px-2.5 py-1 text-xs font-medium text-[var(--status-good)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-good)]" />
                Connected
              </span>
              <button
                onClick={handleSync}
                disabled={syncState !== "idle"}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-ink hover:bg-brand-50 disabled:opacity-70"
              >
                {syncState === "syncing" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {syncState === "done" && <Check className="h-3.5 w-3.5 text-[var(--status-good)]" />}
                {syncState === "idle" && <RefreshCw className="h-3.5 w-3.5" />}
                {syncState === "syncing" ? "Syncing…" : syncState === "done" ? "Synced" : "Sync"}
              </button>
              {actions}
            </div>
          </div>

          <p className="mt-4 text-right text-xs text-ink-muted">Last synchronized: {system.lastSync}</p>
        </div>
      </div>
    </div>
  );
}

export function SourceSystemNotice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-border-strong bg-brand-50/60 px-4 py-2.5 text-xs text-ink-muted">
      {children}
    </p>
  );
}
