import { Link } from "@tanstack/react-router";
import pkg from "../../package.json";

const APP_VERSION = pkg.version;

export function SiteFooter() {
  return (
    <footer className="view-page mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
      <div className="brut-thin flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-cream px-4 py-3 text-[11px] font-bold uppercase text-muted-foreground sm:text-xs">
        <span>© {new Date().getFullYear()} Days To Go</span>
        <span aria-hidden className="text-ink/30">
          ·
        </span>
        <span title={`Days To Go ${APP_VERSION}`}>{APP_VERSION}</span>
        <Link to="/about" viewTransition className="underline hover:text-ink">
          About
        </Link>
        <Link to="/privacy" viewTransition className="underline hover:text-ink">
          Privacy
        </Link>
        <Link to="/terms" viewTransition className="underline hover:text-ink">
          Terms
        </Link>
      </div>
    </footer>
  );
}
