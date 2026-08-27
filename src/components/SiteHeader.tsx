import { Link, useRouterState } from "@tanstack/react-router";
import { Archive, Plus } from "lucide-react";
import logoUrl from "@/assets/logo.png";
import { MuteToggle } from "./MuteToggle";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onAbout = pathname.startsWith("/about");
  const onCreate = pathname.startsWith("/create-countdown");
  const onCalendar = pathname.startsWith("/calendar");

  return (
    <header className="view-header border-b-4 border-ink bg-cream">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" viewTransition className="inline-flex min-w-0 items-center gap-2">
          <img src={logoUrl} alt="Days To Go" className="h-11 w-auto shrink-0 sm:h-16" />
        </Link>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          {!onCreate && (
            <Link
              to="/create-countdown"
              aria-label="New countdown"
              className="brut brut-press inline-flex h-10 items-center gap-1.5 rounded-none bg-primary px-2.5 text-xs font-bold text-primary-foreground uppercase sm:h-auto sm:px-3 sm:py-2 sm:text-sm"
            >
              <Plus className="h-4 w-4 shrink-0" strokeWidth={3} />
              <span className="hidden sm:inline">New</span>
            </Link>
          )}
          <Link
            to={onCalendar ? "/" : "/calendar"}
            viewTransition
            className="brut brut-press rounded-none bg-cream px-2.5 py-2 text-xs font-bold text-ink uppercase sm:px-4 sm:text-sm"
          >
            {onCalendar ? "Home" : "Calendar"}
          </Link>
          <Link
            to={onAbout ? "/" : "/about"}
            viewTransition
            className="brut brut-press rounded-none bg-cream px-2.5 py-2 text-xs font-bold text-ink uppercase sm:px-4 sm:text-sm"
          >
            {onAbout ? "Home" : "About"}
          </Link>
          <MuteToggle />
        </div>
      </div>
    </header>
  );
}
