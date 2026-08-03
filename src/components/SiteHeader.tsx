import { Link, useRouterState } from "@tanstack/react-router";
import logoAsset from "@/assets/logo.svg.asset.json";
import { MuteToggle } from "./MuteToggle";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onAbout = pathname.startsWith("/about");

  return (
    <header className="border-b-4 border-ink bg-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2">
          <img src={logoAsset.url} alt="Days To Go" className="h-14 w-auto sm:h-16" />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to={onAbout ? "/" : "/about"}
            className="brut brut-press hidden rounded-none bg-cream px-4 py-2 text-sm font-bold uppercase text-ink sm:inline-flex"
          >
            {onAbout ? "Home" : "About"}
          </Link>
          <MuteToggle />
        </div>
      </div>
    </header>
  );
}
