# Move the ID lower in the downloadable image

Match the card: the "ID / …" line sits at the very bottom of the white panel, near the bottom edge, left of the colour corner — instead of right under the progress strip.

## Technical
- `web_app/src/lib/shareImage.ts`: change the ID baseline from `stripY + stripH + 40` to about `panelY + panelH - 44` (bottom padding matching the side inset), keeping the same size, colour, shrink-to-fit, and the `contentW - flash` width so it never touches the colour corner.
- Nothing else in the image moves.
