"use client";

import { useEffect } from "react";
import { ReactNode } from "react";
import { getAppInsights } from "@/lib/appinsights";

export function ApplicationInsightsProvider({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    const ai = getAppInsights();

    return () => {
      if (ai) {
        ai.unload(true);
      }
    };
  }, []);

  return <>{children}</>;
}
