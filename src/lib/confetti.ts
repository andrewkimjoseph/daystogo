import confetti from "canvas-confetti";
import { CONFETTI_COLORS } from "./palette";

/** Bursts from an element's top-center, falling back to the screen center. */
export function burstConfetti(el?: HTMLElement | null): void {
  if (typeof window === "undefined") return;

  let x = 0.5;
  let y = 0.4;
  if (el) {
    const r = el.getBoundingClientRect();
    x = (r.left + r.width / 2) / window.innerWidth;
    y = (r.top + r.height * 0.3) / window.innerHeight;
  }

  const shared = { origin: { x, y }, colors: [...CONFETTI_COLORS], disableForReducedMotion: true };

  confetti({ ...shared, particleCount: 70, spread: 70, startVelocity: 42, scalar: 1.1 });
  confetti({ ...shared, particleCount: 40, spread: 110, startVelocity: 28, scalar: 0.8, decay: 0.9 });
  window.setTimeout(() => {
    confetti({ ...shared, particleCount: 30, spread: 140, startVelocity: 20, scalar: 1.3 });
  }, 140);
}
