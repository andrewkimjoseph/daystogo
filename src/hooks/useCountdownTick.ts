import { useEffect, useState } from "react";

const listeners = new Set<(now: number) => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function start() {
  if (timer) return;
  timer = setInterval(() => {
    const now = Date.now();
    listeners.forEach((fn) => fn(now));
  }, 250);
}

function stop() {
  if (timer && listeners.size === 0) {
    clearInterval(timer);
    timer = null;
  }
}

/**
 * One shared interval drives every card — never one timer per countdown.
 * Cards re-render at most 4x/sec; formatting decides what actually changes.
 */
export function useCountdownTick(): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const fn = (t: number) => setNow(t);
    listeners.add(fn);
    start();
    return () => {
      listeners.delete(fn);
      stop();
    };
  }, []);

  return now;
}
