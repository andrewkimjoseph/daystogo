import { useEffect, useState } from "react";

/**
 * True only after the client has hydrated. Use to gate anything that depends on
 * the viewer's clock or locale, which the server cannot know.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
