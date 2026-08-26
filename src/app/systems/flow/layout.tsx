"use client";

import type { ReactNode } from "react";
import { FlowProvider, useFlowProjects } from "./flow-store";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

function Gate({ children }: { children: ReactNode }) {
  const { loading, error } = useFlowProjects();
  if (loading || error) return <LoadingScreen error={error} />;
  return <>{children}</>;
}

export default function FlowLayout({ children }: LayoutProps<"/systems/flow">) {
  return (
    <FlowProvider>
      <Gate>{children}</Gate>
    </FlowProvider>
  );
}
