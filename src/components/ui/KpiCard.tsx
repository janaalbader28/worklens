import type { ReactNode } from "react";
import { Card } from "./Card";
import { KpiInfo, type KPI_EXPLAINERS } from "./KpiInfo";

export function KpiCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
  info,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "good" | "warning" | "serious";
  icon?: ReactNode;
  info?: keyof typeof KPI_EXPLAINERS;
}) {
  const toneStyles: Record<string, string> = {
    neutral: "text-ink",
    good: "text-[var(--status-good)]",
    warning: "text-[var(--status-warning)]",
    serious: "text-[var(--status-serious)]",
  };
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-secondary uppercase tracking-wide">{label}</span>
        <span className="flex items-center gap-1.5 text-ink-muted">
          {icon}
          {info && <KpiInfo topic={info} />}
        </span>
      </div>
      <span className={`text-3xl font-semibold tabular ${toneStyles[tone]}`}>{value}</span>
      {hint && <span className="text-xs text-ink-muted">{hint}</span>}
    </Card>
  );
}
