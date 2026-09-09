import { PALETTE } from "@/lib/palette";

/** Sticker-style 4-point sparkle, mirroring the logo accents. */
export function Sparkle({
  color = PALETTE.teal,
  className,
  size = 32,
}: {
  color?: string;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M50 0C54 30 70 46 100 50 70 54 54 70 50 100 46 70 30 54 0 50 30 46 46 30 50 0Z"
        fill={color}
        stroke="#111318"
        strokeWidth="5"
      />
    </svg>
  );
}
