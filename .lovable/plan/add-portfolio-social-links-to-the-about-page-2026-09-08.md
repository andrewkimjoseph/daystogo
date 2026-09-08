# Add portfolio social links to the About page

## Goal
Surface the personal social links from the referenced portfolio project on the Days To Go About page, alongside the existing X link.

## Source of truth
Cross-project snapshot of `SWE Kimanzi Porfolio` (`src/data/social.ts`) defines:
- GitHub: https://github.com/andrewkimjoseph
- LinkedIn: https://www.linkedin.com/in/andrew-kim-joseph/
- X: https://x.com/andrewkimjoseph
- Email: andrewkimjoseph@gmail.com

## Plan
1. Create `src/lib/socials.ts` exporting the personal social links above.
2. Replace the single X button in `src/routes/about.tsx` "Built by" section with a row of brutalist icon buttons: GitHub, LinkedIn, X, and Email. Keep the existing teal primary button style and shadow treatment.
3. Use Lucide icons (`Github`, `Linkedin`, `Mail`) and an inline X logo SVG for consistency with the current X button.
4. Add `aria-label`, `target="_blank"`, and `rel="noreferrer"` to each link.
5. Update JSON-LD `sameAs` to include all personal social URLs.
6. Run typecheck to verify imports and JSX.

## Out of scope
- Project/company links (Canvassing, Celina, Pax, Rez) are not added unless requested.
- No changes to Privacy/Terms sections or footer.
