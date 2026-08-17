import logoUrl from "@/assets/logo.png";
import type { Countdown } from "./db";
import { remainingMs } from "./countdownsRepo";
import { formatRemaining, progressPercent } from "./formatTime";
import { formatTargetLabel } from "./localTime";
import { categoryMeta } from "./categories";
import { INK, PALETTE, tagTextColor } from "./palette";

const SIZE = 1080;
/** Supersample factor: all drawing stays in 1080-space, output is SIZE * SCALE px. */
const SCALE = 2;
const SEGMENTS = 16;

const DISPLAY = '"Archivo Black", "Arial Black", system-ui, sans-serif';
const SANS = '"Space Grotesk", ui-sans-serif, system-ui, sans-serif';

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Greedy wrap that shrinks the font until the text fits `maxLines`. */
function fitLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  startSize: number,
  minSize: number,
  font: string,
): { lines: string[]; size: number } {
  for (let size = startSize; size >= minSize; size -= 4) {
    ctx.font = `${size}px ${font}`;
    const lines: string[] = [];
    let line = "";
    for (const word of text.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width <= maxWidth || !line) {
        line = next;
      } else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    const tooWide = lines.some((l) => ctx.measureText(l).width > maxWidth);
    if (lines.length <= maxLines && !tooWide) return { lines, size };
  }
  ctx.font = `${minSize}px ${font}`;
  return { lines: [text], size: minSize };
}

function drawDots(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = "rgba(66, 106, 133, 0.22)";
  const step = 40;
  for (let y = step / 2; y < SIZE; y += step) {
    for (let x = step / 2; x < SIZE; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Hard offset shadow + ink border box, the app's brutalist panel. */
function drawPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string | CanvasGradient,
  border = 8,
  offset = 14,
) {
  ctx.fillStyle = INK;
  ctx.fillRect(x + offset, y + offset, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.lineWidth = border;
  ctx.strokeStyle = INK;
  ctx.strokeRect(x + border / 2, y + border / 2, w - border, h - border);
}

export async function renderCountdownShareImage(
  countdown: Countdown,
  now = Date.now(),
): Promise<Blob> {
  if (typeof document === "undefined") throw new Error("Share images render in the browser only.");

  await document.fonts?.ready?.catch?.(() => undefined);
  const logo = await loadImage(logoUrl);

  const canvas = document.createElement("canvas");
  canvas.width = SIZE * SCALE;
  canvas.height = SIZE * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable in this browser.");
  // Draw everything at 1x coordinates, rasterised at SCALE for crisp type and edges.
  ctx.scale(SCALE, SCALE);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";


  const remaining = remainingMs(countdown, now);
  const lapsed = countdown.status === "lapsed" || remaining <= 0;
  const { text } = formatRemaining(remaining);
  const pct = lapsed ? 100 : progressPercent(countdown.startedAt, countdown.endsAt, remaining);
  const filled = Math.round((pct / 100) * SEGMENTS);
  const tagColor = lapsed ? PALETTE.red : countdown.colorTag;
  const ink = lapsed ? PALETTE.cream : INK;
  const muted = lapsed ? PALETTE.cream : PALETTE.slate;
  const category = categoryMeta(countdown.category);

  drawDots(ctx);

  const M = 72;
  const panelX = M;
  const panelY = M;
  const panelW = SIZE - M * 2;
  const panelH = SIZE - M * 2 - 96;

  let fill: string | CanvasGradient = "#FBF9F3";
  if (lapsed) {
    const g = ctx.createLinearGradient(panelX, panelY, panelX + panelW, panelY + panelH);
    g.addColorStop(0, PALETTE.mauve);
    g.addColorStop(1, PALETTE.red);
    fill = g;
  }
  drawPanel(ctx, panelX, panelY, panelW, panelH, fill);

  const padX = 56;
  const left = panelX + padX;
  const contentW = panelW - padX * 2;
  ctx.textBaseline = "alphabetic";

  // Badge, top right.
  const badge = lapsed ? "LAPSED!" : "RUNNING";
  ctx.font = `26px ${SANS}`;
  const badgeW = ctx.measureText(badge).width + 44;
  const badgeH = 58;
  const badgeX = panelX + panelW - padX - badgeW;
  const badgeY = panelY + 56;
  drawPanel(ctx, badgeX, badgeY, badgeW, badgeH, tagColor, 5, 8);
  ctx.fillStyle = tagTextColor(tagColor);
  ctx.font = `26px ${SANS}`;
  ctx.fillText(badge, badgeX + 22, badgeY + badgeH / 2 + 9);

  // Category row.
  let y = panelY + 92;
  ctx.fillStyle = muted;
  ctx.fillRect(left, y - 16, 18, 18);
  ctx.font = `24px ${SANS}`;
  ctx.fillText(category.label.toUpperCase(), left + 30, y);

  // Title.
  const maxTitleW = contentW - badgeW - 40;
  const title = fitLines(ctx, countdown.title.toUpperCase(), maxTitleW, 3, 76, 40, DISPLAY);
  y += 40;
  ctx.fillStyle = ink;
  for (const line of title.lines) {
    y += title.size * 1.02;
    ctx.font = `${title.size}px ${DISPLAY}`;
    ctx.fillText(line, left, y);
  }

  // End moment.
  if (countdown.targetAt !== undefined) {
    y += 52;
    ctx.fillStyle = muted;
    ctx.font = `28px ${SANS}`;
    ctx.fillText(formatTargetLabel(countdown.targetAt).toUpperCase(), left, y);

  }

  // Big remaining figure, optically centred in the space left between label and strip.
  const stripH = 46;
  const stripY = panelY + panelH - 88;
  const clock = fitLines(ctx, lapsed ? "00:00:00" : text, contentW, 1, 150, 60, DISPLAY);
  const midY = (y + 24 + (stripY - 40)) / 2;
  ctx.fillStyle = lapsed ? PALETTE.cream : INK;
  ctx.font = `${clock.size}px ${DISPLAY}`;
  ctx.fillText(clock.lines[0]!, left, midY + clock.size * 0.36);


  // Progress segments.
  const gap = 8;
  const segW = (contentW - gap * (SEGMENTS - 1)) / SEGMENTS;
  for (let i = 0; i < SEGMENTS; i += 1) {
    const x = left + i * (segW + gap);
    ctx.fillStyle = i < filled ? (lapsed ? PALETTE.cream : tagColor) : "transparent";
    if (i < filled) ctx.fillRect(x, stripY, segW, stripH);
    ctx.lineWidth = 5;
    ctx.strokeStyle = lapsed ? PALETTE.cream : INK;
    ctx.strokeRect(x + 2.5, stripY + 2.5, segW - 5, stripH - 5);
  }

  // Footer: logo + URL.
  const footY = panelY + panelH + 18;
  const footH = 96;
  if (logo) {
    const w = (logo.width / logo.height) * footH;
    ctx.drawImage(logo, M, footY, w, footH);
  }
  ctx.fillStyle = PALETTE.slate;
  ctx.font = `28px ${SANS}`;
  ctx.textAlign = "right";
  ctx.fillText("APP.DAYSTOGO.XYZ", SIZE - M, footY + footH / 2 + 10);
  ctx.textAlign = "left";


  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not encode the image.");
  return blob;
}

export function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "countdown"
  );
}

function timestampSuffix(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export async function downloadCountdownImage(countdown: Countdown, now = Date.now()) {
  const blob = await renderCountdownShareImage(countdown, now);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `days-to-go-${slugify(countdown.title)}-${timestampSuffix()}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
