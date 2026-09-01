import { createElement } from "react";
import type { LucideIcon } from "lucide-react";
import type { Countdown } from "./db";
import { remainingMs } from "./countdownsRepo";
import { formatRemaining, progressPercent } from "./formatTime";
import { formatTargetLabel } from "./localTime";
import { categoryMeta } from "./categories";
import { INK, PALETTE } from "./palette";

const SIZE = 1080;
/** Supersample factor: all drawing stays in 1080-space, output is SIZE * SCALE px. */
const SCALE = 4;
const SEGMENTS = 16;

const DISPLAY = '"Archivo Black", "Arial Black", system-ui, sans-serif';
const SANS = '"Space Grotesk", ui-sans-serif, system-ui, sans-serif';

/** Rasterise a lucide icon component into an <img> we can draw on canvas. */
async function loadCategoryIcon(
  Icon: LucideIcon,
  color: string,
  px: number,
): Promise<HTMLImageElement | null> {
  try {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const markup = renderToStaticMarkup(
      createElement(Icon, {
        width: px,
        height: px,
        stroke: color,
        strokeWidth: 3,
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
      }),
    );
    const svg = markup.includes("xmlns")
      ? markup
      : markup.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    return await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
  } catch {
    return null;
  }
}

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
  offset = 7,
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
  const [logo, hourglass] = await Promise.all([loadImage("/logo.png"), loadImage("/hourglass.svg")]);

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
  const lapsed = remaining <= 0;
  const { text, dramatic } = formatRemaining(remaining, now, countdown.endsAt);
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

  // Hourglass, top right — keep the SVG's tall aspect (canvas drawImage
  // otherwise squashes 188×256 into a square).
  const hourglassH = 72;
  const natW = hourglass?.naturalWidth || 188;
  const natH = hourglass?.naturalHeight || 256;
  const hourglassW = hourglassH * (natW / natH);
  const badgeX = panelX + panelW - padX - hourglassW;
  const badgeY = panelY + 48;
  if (hourglass) {
    ctx.drawImage(hourglass, badgeX, badgeY, hourglassW, hourglassH);
  }


  // Category row.
  let y = panelY + 92;
  const iconPx = 28;
  const icon = await loadCategoryIcon(category.icon, muted, iconPx);
  if (icon) {
    ctx.drawImage(icon, left, y - iconPx + 4, iconPx, iconPx);
  } else {
    ctx.fillStyle = muted;
    ctx.fillRect(left, y - 18, 20, 20);
  }
  ctx.fillStyle = muted;
  ctx.font = `24px ${SANS}`;
  ctx.fillText(category.label.toUpperCase(), left + iconPx + 14, y);

  // Title.
  const maxTitleW = contentW - hourglassW - 40;
  const title = fitLines(ctx, countdown.title.toUpperCase(), maxTitleW, 3, 46, 34, DISPLAY);
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

  // Big remaining figure. Sizes are the web card's rem values scaled by the
  // canvas/card ratio (~2.4x): text-4xl (36px) -> 88, text-6xl (60px) -> 145.
  const stripH = 46;
  const stripY = panelY + panelH - 88;
  const clockStart = !lapsed && dramatic ? 145 : 88;
  const clockMin = !lapsed && dramatic ? 110 : 72;
  const clock = fitLines(ctx, lapsed ? "00:00:00" : text, contentW, 1, clockStart, clockMin, DISPLAY);
  const midY = (y + 24 + (stripY - 40)) / 2;
  ctx.fillStyle = lapsed ? PALETTE.cream : INK;
  ctx.font = `${clock.size}px ${DISPLAY}`;
  ctx.fillText(clock.lines[0]!, left, midY + clock.size * 0.36);

  // Created date — small and silent, sitting in the gap between the timer and
  // the progress strip.
  const createdAtMs = countdown.createdAt ?? Date.now();
  const createdDate = new Date(createdAtMs).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  ctx.fillStyle = muted;
  ctx.font = `22px ${SANS}`;
  ctx.fillText(`CREATED ON ${createdDate.toUpperCase()}`, left, stripY - 20);


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
  const footY = panelY + panelH + 30;
  const footH = 130;
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
