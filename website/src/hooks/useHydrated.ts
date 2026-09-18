import { useEffect, useLayoutEffect, useState } from "react";

export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useIsomorphicLayoutEffect(() => setHydrated(true), []);
  return hydrated;
}
