import { useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "@clerk/tanstack-react-start";
import { useQueryClient } from "@tanstack/react-query";
import { COUNTDOWNS_QUERY_KEY } from "@/lib/countdownsRepo";
import { setUsesCloud } from "@/lib/syncMode";
import { LocalImport } from "./LocalImport";
import { HourglassLoader } from "./HourglassLoader";

export function AuthGate({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const queryClient = useQueryClient();
  const prevSignedIn = useRef<boolean | undefined>(undefined);

  setUsesCloud(!!isSignedIn);

  useEffect(() => {
    if (!isLoaded) return;
    if (prevSignedIn.current !== undefined && prevSignedIn.current !== isSignedIn) {
      void queryClient.invalidateQueries({ queryKey: COUNTDOWNS_QUERY_KEY });
    }
    prevSignedIn.current = isSignedIn;
  }, [isLoaded, isSignedIn, queryClient]);

  if (!isLoaded) return <HourglassLoader />;
  if (isSignedIn) return <LocalImport>{children}</LocalImport>;
  return children;
}
