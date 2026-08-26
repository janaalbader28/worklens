import Link from "next/link";
import { Workflow, Ticket, Users, GitBranch, ArrowRight, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { SOURCE_SYSTEMS, type SourceSystem } from "@/data/systems";

const SYSTEM_ICONS: Record<SourceSystem["key"], typeof Workflow> = {
  hr: Users,
  tickets: Ticket,
  flow: Workflow,
  sdlc: GitBranch,
};

const ACCENT_ICON_BG: Record<SourceSystem["accent"], string> = {
  blue: "bg-brand-50 text-brand-600",
  amber: "bg-[var(--status-warning-bg)] text-[var(--status-warning)]",
  teal: "bg-accent-teal-bg text-accent-teal",
  violet: "bg-accent-violet-bg text-accent-violet",
};

const ACCENT_TOP_BAR: Record<SourceSystem["accent"], string> = {
  blue: "bg-brand-600",
  amber: "bg-[var(--status-warning)]",
  teal: "bg-accent-teal",
  violet: "bg-accent-violet",
};

export default function EnterpriseSystemsGateway() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-6xl">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-ink">Enterprise Systems</h1>
            <p className="mt-3 text-base text-ink-secondary max-w-xl mx-auto leading-relaxed">
              Explore the systems that provide the data behind workforce capacity planning.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {SOURCE_SYSTEMS.map((system) => {
              const Icon = SYSTEM_ICONS[system.key];
              return (
                <div
                  key={system.key}
                  className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
                >
                  <div className={`h-1 w-full ${ACCENT_TOP_BAR[system.accent]}`} />
                  <div className="flex flex-1 flex-col p-5">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${ACCENT_ICON_BG[system.accent]}`}>
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    </div>
                    <h2 className="mt-3 text-base font-semibold text-ink">{system.name}</h2>
                    <p className="text-xs text-ink-muted">{system.subtitle}</p>

                    <ul className="mt-3 space-y-1">
                      {system.dataProvided.map((item) => (
                        <li key={item} className="flex items-center gap-1.5 text-xs text-ink-secondary">
                          <CheckCircle2 className="h-3 w-3 shrink-0 text-ink-muted" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-4 flex items-center gap-1.5 text-xs font-medium text-[var(--status-good)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-good)]" />
                      Connected
                    </div>

                    <Link
                      href={system.href}
                      className="group mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-brand-50"
                    >
                      {system.openLabel}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* WorkLens entry */}
          <Link
            href="/worklens"
            className="group relative mt-10 block overflow-hidden rounded-2xl bg-brand-950 p-8 text-center shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background: "radial-gradient(40rem 20rem at 50% 0%, rgba(124,111,240,0.28) 0%, transparent 60%)",
              }}
            />
            <div className="relative">
              <Logo size={30} textClassName="text-2xl" className="justify-center" dark />
              <p className="mt-2 text-sm text-white/70">One view of people, work and capacity.</p>
              <span className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-900 shadow-sm">
                Open WorkLens
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        </div>
      </main>

      <footer className="px-6 py-4 border-t border-border">
        <p className="text-xs text-ink-muted text-center">Prototype | Simulated Organizational Data</p>
      </footer>
    </div>
  );
}
