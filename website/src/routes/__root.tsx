import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "../styles.css?url";
import { SiteFooter } from "#/components/SiteFooter";
import { SITE_URL } from "#/lib/urls";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="brut max-w-md bg-card p-6 text-center">
        <h1 className="hero-gradient text-6xl uppercase">404</h1>
        <h2 className="mt-4 text-xl uppercase">Page not found</h2>
        <p className="mt-2 text-sm font-bold text-muted-foreground">
          That URL doesn&apos;t exist. Head back to the landing.
        </p>
        <a
          href="/"
          className="brut brut-press mt-6 inline-flex items-center justify-center rounded-none bg-primary px-4 py-3 text-sm font-bold text-primary-foreground uppercase"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(err);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="brut max-w-md bg-card p-6 text-center">
        <h1 className="text-xl uppercase">This page didn&apos;t load</h1>
        <p className="mt-2 text-sm font-bold text-muted-foreground">
          Something went wrong on our end. Try again or go home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="brut brut-press inline-flex items-center justify-center rounded-none bg-primary px-4 py-3 text-sm font-bold text-primary-foreground uppercase"
          >
            Try again
          </button>
          <a
            href="/"
            className="brut brut-press inline-flex items-center justify-center rounded-none bg-cream px-4 py-3 text-sm font-bold text-ink uppercase"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Days To Go — Playful Countdown Timers" },
      {
        name: "description",
        content:
          "Playful brutalist countdown timers, from 3 seconds to years out. Tick to the second. Confetti at zero. Put a clock on it.",
      },
      { property: "og:title", content: "Days To Go — Playful Countdown Timers" },
      {
        property: "og:description",
        content:
          "Playful brutalist countdown timers, from 3 seconds to years out. Tick to the second. Confetti at zero.",
      },
      { property: "og:site_name", content: "Days To Go" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;700&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "canonical", href: `${SITE_URL}/` },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Days To Go",
          url: SITE_URL,
          description: "Playful brutalist countdown timers, right in your browser.",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
