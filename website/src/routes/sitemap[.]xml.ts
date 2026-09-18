import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_URL } from "#/lib/urls";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          `  <url>`,
          `    <loc>${SITE_URL}/</loc>`,
          `    <changefreq>weekly</changefreq>`,
          `    <priority>1.0</priority>`,
          `  </url>`,
          `  <url>`,
          `    <loc>${SITE_URL}/about</loc>`,
          `    <changefreq>yearly</changefreq>`,
          `    <priority>0.5</priority>`,
          `  </url>`,
          `  <url>`,
          `    <loc>${SITE_URL}/calendar</loc>`,
          `    <changefreq>weekly</changefreq>`,
          `    <priority>0.7</priority>`,
          `  </url>`,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
