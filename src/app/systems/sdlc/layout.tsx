"use client";

import type { ReactNode } from "react";
import { SdlcProvider, useSdlcActivities } from "./sdlc-store";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

function Gate({ children }: { children: ReactNode }) {
  const { loading, error } = useSdlcActivities();
  if (loading || error) return <LoadingScreen error={error} />;
  return <>{children}</>;
}

export default function SdlcLayout({ children }: LayoutProps<"/systems/sdlc">) {
  return (
    <SdlcProvider>
      <Gate>{children}</Gate>
    </SdlcProvider>
  );
}
