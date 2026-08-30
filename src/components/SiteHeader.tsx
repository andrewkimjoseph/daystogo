import { Link, useRouterState } from "@tanstack/react-router";
import { Archive, Calendar as CalendarIcon, Home, Info, Plus } from "lucide-react";
import { MuteToggle } from "./MuteToggle";
import { AuthControls } from "./AuthControls";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onHome = pathname === "/";
  const onCreate = pathname.startsWith("/create-countdown");

  return (
    <header className="view-header border-b-4 border-ink bg-cream">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" viewTransition className="inline-flex min-w-0 items-center gap-2">
          <img src="/logo.png" alt="Days To Go" className="h-11 w-auto shrink-0 sm:h-16" />
        </Link>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          {!onCreate && (
            <Link
              to="/create-countdown"
              aria-label="New countdown"
              className="brut brut-press inline-flex h-10 items-center gap-1.5 rounded-none bg-primary px-2.5 text-xs font-bold text-primary-foreground uppercase sm:px-3 sm:text-sm"
            >
              <Plus className="h-4 w-4 shrink-0" strokeWidth={3} />
              <span className="hidden sm:inline">New</span>
            </Link>
          )}
          {onHome ? (
            <>
              <Link
                to="/archived"
                viewTransition
                aria-label="Archived countdowns"
                title="Archived"
                className="brut brut-press inline-flex h-10 items-center gap-1.5 rounded-none bg-cream px-2.5 text-xs font-bold text-ink uppercase sm:px-4 sm:text-sm"
              >
                <Archive className="h-4 w-4 shrink-0 sm:hidden" strokeWidth={3} />
                <span className="hidden sm:inline">Archive</span>
              </Link>
              <Link
                to="/calendar"
                viewTransition
                aria-label="Calendar"
                title="Calendar"
                className="brut brut-press inline-flex h-10 items-center justify-center rounded-none bg-cream px-2.5 text-xs font-bold text-ink uppercase sm:px-4 sm:text-sm"
              >
                <CalendarIcon className="h-4 w-4 sm:hidden" strokeWidth={3} />
                <span className="hidden sm:inline">Calendar</span>
              </Link>
              <Link
                to="/about"
                viewTransition
                aria-label="About"
                title="About"
                className="brut brut-press inline-flex h-10 items-center justify-center rounded-none bg-cream px-2.5 text-xs font-bold text-ink uppercase sm:px-4 sm:text-sm"
              >
                <Info className="h-4 w-4 sm:hidden" strokeWidth={3} />
                <span className="hidden sm:inline">About</span>
              </Link>
            </>
          ) : (
            <Link
              to="/"
              viewTransition
              aria-label="Home"
              title="Home"
              className="brut brut-press inline-flex h-10 items-center gap-1.5 rounded-none bg-cream px-2.5 text-xs font-bold text-ink uppercase sm:px-4 sm:text-sm"
            >
              <Home className="h-4 w-4 shrink-0 sm:hidden" strokeWidth={3} />
              <span className="hidden sm:inline">Home</span>
            </Link>
          )}
          <MuteToggle />
          <AuthControls />
        </div>
      </div>
    </header>
  );
}
