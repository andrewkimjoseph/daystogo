export const PALETTE = {
  cream: "#EFEADD",
  teal: "#2E9EAC",
  mauve: "#A24962",
  red: "#CD2744",
  slate: "#426A85",
} as const;

export const COLOR_TAGS: { hex: string; label: string }[] = [
  { hex: PALETTE.teal, label: "Teal" },
  { hex: PALETTE.mauve, label: "Mauve" },
  { hex: PALETTE.red, label: "Red" },
  { hex: PALETTE.slate, label: "Slate" },
  { hex: PALETTE.cream, label: "Cream" },
];

export const CONFETTI_COLORS = [
  PALETTE.teal,
  PALETTE.mauve,
  PALETTE.red,
  PALETTE.slate,
  PALETTE.cream,
];

export const INK = "#111318";

/** Cream tag needs dark text; the rest are dark enough for cream text. */
export function tagTextColor(hex: string): string {
  return hex.toUpperCase() === PALETTE.cream ? INK : PALETTE.cream;
}
