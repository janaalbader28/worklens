import { SupervisorSessionProvider } from "@/store/session-store";
import { AppShell } from "@/components/layout/AppShell";

export default function SupervisorLayout({ children }: LayoutProps<"/supervisor">) {
  return (
    <SupervisorSessionProvider>
      <AppShell role="supervisor">{children}</AppShell>
    </SupervisorSessionProvider>
  );
}
