import { Link, useRouterState } from "@tanstack/react-router";
import logoAsset from "@/assets/logo.svg.asset.json";
import { MuteToggle } from "./MuteToggle";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onAbout = pathname.startsWith("/about");
  const onCreate = pathname.startsWith("/create-countdown");

  return (
    <header className="view-header border-b-4 border-ink bg-cream">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" viewTransition className="inline-flex min-w-0 items-center gap-2">
          <img src={logoAsset.url} alt="Days To Go" className="h-11 w-auto shrink-0 sm:h-16" />
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {!onCreate && (
            <Link
              to="/create-countdown"
              viewTransition
              className="brut brut-press hidden rounded-none bg-primary px-3 py-2 text-sm font-bold text-primary-foreground uppercase sm:inline-flex"
            >
              New
            </Link>
          )}
          <Link
            to={onAbout ? "/" : "/about"}
            viewTransition
            className="brut brut-press rounded-none bg-cream px-3 py-2 text-xs font-bold text-ink uppercase sm:px-4 sm:text-sm"
          >
            {onAbout ? "Home" : "About"}
          </Link>
          <MuteToggle />
        </div>
      </div>
    </header>
  );
}
