import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const PRELOAD_RELOAD_KEY = "daystogo:chunk-reload";

function installOneShotPreloadReload() {
  if (typeof window === "undefined") return;
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    try {
      if (sessionStorage.getItem(PRELOAD_RELOAD_KEY)) return;
      sessionStorage.setItem(PRELOAD_RELOAD_KEY, "1");
    } catch {
      return;
    }
    window.location.reload();
  });
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  installOneShotPreloadReload();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    defaultPreloadStaleTime: 5 * 60_000,
    defaultViewTransition: true,
  });

  return router;
};
