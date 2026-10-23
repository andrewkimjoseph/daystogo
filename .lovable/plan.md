# Copy the countdown ID on the expanded page

Add a small copy button right after the `ID / …` line at the bottom of the expanded countdown card.

## What you'll see
- A small copy icon next to the ID, in the same quiet muted colour.
- Clicking it copies the exact ID (in its original lowercase form, e.g. `9e8348c8-b4a2-…`) and shows a "ID copied" toast.
- The icon briefly turns into a check mark after copying.
- If copying fails, a "Couldn't copy the ID" toast appears.
- Only shown when the ID is shown (signed in). Nothing else on the page changes.

## Technical details
- `web_app/src/routes/countdowns.$countdownId.tsx`: in the footer, wrap the ID line in a flex row and add an icon button (lucide `Copy` / `Check`, strokeWidth 3, aria-label "Copy countdown ID") using `navigator.clipboard.writeText(countdown.id)` with sonner toasts; reset to the copy icon after ~1.5s.
- Verify in the browser that the button appears and the clipboard receives the lowercase ID.
