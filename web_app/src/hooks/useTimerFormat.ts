import { useCallback, useEffect, useState } from "react";
import type { TimerFormat } from "@/lib/formatTime";

const KEY = "dtg-timer-format";
const EVENT = "dtg-timer-format-change";

/** Shared, device-remembered timer format (full breakdown vs. plain days). */
export function useTimerFormat() {
  const [format, setFormatState] = useState<TimerFormat>("full");

  useEffect(() => {
    const read = () => setFormatState(localStorage.getItem(KEY) === "days" ? "days" : "full");
    read();
    window.addEventListener(EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);

  const setFormat = useCallback((next: TimerFormat) => {
    localStorage.setItem(KEY, next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const toggle = useCallback(() => {
    setFormat(localStorage.getItem(KEY) === "days" ? "full" : "days");
  }, [setFormat]);

  return { format, setFormat, toggle };
}
