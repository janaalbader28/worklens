"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, Building2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { SUPERVISOR } from "@/data/employees";
import { setStoredUnit } from "@/store/session-store";

const DEMO_UNIT = "IT Service Support" as const;
const DEMO_EMAIL = "supervisor@worklens.demo";
const DEMO_PASSWORD = "demo123";

export default function SupervisorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);

  function handleLogin() {
    setStoredUnit(DEMO_UNIT);
    router.push("/supervisor");
  }

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <header className="px-6 py-5">
        <Link href="/worklens" className="inline-flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Logo size={30} textClassName="text-xl" className="justify-center" />
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">Supervisor Login</h1>
            <p className="mt-2 text-sm text-ink-secondary">No real authentication is required for this prototype.</p>
          </div>

          <form
            className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="flex items-center gap-3 rounded-lg border border-brand-100 bg-brand-50 px-3.5 py-3">
              <div className="h-9 w-9 shrink-0 rounded-full bg-brand-800 text-white text-xs font-semibold flex items-center justify-center">
                {SUPERVISOR.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium text-ink">{SUPERVISOR.name}</p>
                <p className="flex items-center gap-1 text-xs text-ink-muted">
                  <Building2 className="h-3 w-3" />
                  {DEMO_UNIT}
                </p>
              </div>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-secondary">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  style={{ paddingLeft: "2.25rem" }}
                  type="email"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-secondary">Password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  style={{ paddingLeft: "2.25rem" }}
                  type="password"
                />
              </div>
            </label>

            <button
              type="submit"
              className="w-full rounded-lg bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              Login
            </button>

            <p className="text-center text-xs text-ink-muted">
              Demo account: {DEMO_EMAIL}
              <br />
              Password: {DEMO_PASSWORD}
            </p>
          </form>
        </div>
      </main>

      <footer className="px-6 py-4 border-t border-border">
        <p className="text-xs text-ink-muted text-center">Prototype | Simulated Organizational Data</p>
      </footer>
    </div>
  );
}
