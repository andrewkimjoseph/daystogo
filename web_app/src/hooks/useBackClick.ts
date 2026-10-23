import type { MouseEvent } from "react";
import { useRouter } from "@tanstack/react-router";

/** Click handler for "back" links: returns to the previous in-app page when there is one, otherwise lets the link go to its fallback. */
export function useBackClick() {
  const router = useRouter();
  return (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (!router.history.canGoBack()) return;
    e.preventDefault();
    router.history.back();
  };
}
