/**
 * Sound files live in /public/sounds/. Drop replacement files in at the same
 * names (countdown-start.mp3/.ogg, countdown-lapsed.mp3/.ogg) — no code change.
 */
const SOUNDS = {
  start: ["/sounds/countdown-start.mp3", "/sounds/countdown-start.ogg"],
  lapsed: ["/sounds/countdown-lapsed.mp3", "/sounds/countdown-lapsed.ogg"],
} as const;

export type SoundName = keyof typeof SOUNDS;

const MUTE_KEY = "daystogo:muted";
const listeners = new Set<(muted: boolean) => void>();
let muted = false;

export function initSound(): void {
  if (typeof window === "undefined") return;
  muted = window.localStorage.getItem(MUTE_KEY) === "1";
  notify();
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(next: boolean): void {
  muted = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
  }
  notify();
}

export function subscribeMuted(fn: (muted: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => fn(muted));
}

/** Only ever called from a user gesture or an already-interacted tab. */
export function playSound(name: SoundName): void {
  if (muted || typeof window === "undefined") return;
  const audio = new Audio();
  const [mp3, ogg] = SOUNDS[name];
  audio.src = audio.canPlayType("audio/mpeg") ? mp3 : ogg;
  audio.volume = 0.6;
  void audio.play().catch(() => {
    /* autoplay blocked — stay silent */
  });
}
