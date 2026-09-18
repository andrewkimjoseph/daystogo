import pkg from "../../package.json";

const APP_VERSION = pkg.version;
const SITE_URL = "https://daystogo.xyz";

const linkClass = "underline hover:text-ink";

export function SiteFooter() {
  return (
    <footer className="view-page mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
      <div className="brut-thin flex flex-col items-center gap-2 bg-cream px-4 py-3 text-[11px] font-bold uppercase text-muted-foreground sm:text-xs">
        <p className="flex flex-wrap items-center justify-center gap-x-3">
          <span>© {new Date().getFullYear()} Days To Go</span>
          <span aria-hidden className="text-ink/30">
            ·
          </span>
          <span title={`Days To Go ${APP_VERSION}`}>{APP_VERSION}</span>
        </p>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1" aria-label="Footer">
          <a href={SITE_URL} target="_blank" rel="noreferrer" className={linkClass}>
            Website
          </a>
          <a href={`${SITE_URL}/about`} target="_blank" rel="noreferrer" className={linkClass}>
            About
          </a>
          <a href={`${SITE_URL}/privacy`} target="_blank" rel="noreferrer" className={linkClass}>
            Privacy
          </a>
          <a href={`${SITE_URL}/terms`} target="_blank" rel="noreferrer" className={linkClass}>
            Terms
          </a>
        </nav>
      </div>
    </footer>
  );
}
