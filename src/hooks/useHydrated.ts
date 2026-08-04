import { useEffect, useLayoutEffect, useState } from "react";

/** useLayoutEffect in the browser, useEffect on the server (where it's a no-op). */
export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * True only after the client has hydrated. Use to gate anything that depends on
 * the viewer's clock or locale, which the server cannot know.
 *
 * The flip runs in a layout effect so the real content paints in the same frame
 * as hydration — otherwise the placeholder is visible for a frame and flickers.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useIsomorphicLayoutEffect(() => setHydrated(true), []);
  return hydrated;
}
