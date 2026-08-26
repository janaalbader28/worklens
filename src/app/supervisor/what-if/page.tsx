import { WhatIfSimulator } from "@/components/whatif/WhatIfSimulator";

export default function WhatIfPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Capacity Scenario Simulator</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Simulate the impact of new work before making an allocation decision.
        </p>
      </div>
      <WhatIfSimulator />
    </div>
  );
}
