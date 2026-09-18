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
];

export const INK = "#111318";
