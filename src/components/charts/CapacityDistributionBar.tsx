const COLORS: Record<string, string> = {
  healthy: "var(--status-good)",
  atRisk: "var(--status-warning)",
  overloaded: "var(--status-serious)",
};

export function CapacityDistributionBar({
  data,
}: {
  data: { key: string; label: string; value: number }[];
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {data.map((d, i) => (
          <div
            key={d.key}
            className={i > 0 ? "border-l-2 border-surface" : ""}
            style={{
              width: `${(d.value / total) * 100}%`,
              background: COLORS[d.key],
            }}
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {data.map((d) => (
          <div key={d.key} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: COLORS[d.key] }} />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-ink tabular">{d.value}</p>
              <p className="text-xs text-ink-muted">{d.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
