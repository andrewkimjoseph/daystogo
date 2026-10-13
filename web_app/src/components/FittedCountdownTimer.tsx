import { useEffect, useRef, useState } from "react";

/** Fit the expanded readout, measuring a stable digit pattern instead of every tick. */
export function FittedCountdownTimer({ text, lapsed }: { text: string; lapsed: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState<number>();
  const pattern = text.replace(/\d/g, "8");

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    let disposed = false;
    const fit = () => {
      if (disposed) return;
      const width = container.clientWidth;
      const measuredWidth = measure.getBoundingClientRect().width;
      if (width > 0 && measuredWidth > 0) {
        // Leave a little room for glyph overhang and fractional layout rounding.
        setFontSize(Math.floor(((width - 4) / measuredWidth) * 100 * 10) / 10);
      }
    };
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    fit();
    void document.fonts.ready.then(fit);
    document.fonts.addEventListener("loadingdone", fit);
    return () => {
      disposed = true;
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", fit);
    };
  }, [pattern]);

  return (
    <div ref={containerRef} className="expanded-timer my-auto relative w-full min-w-0 overflow-hidden [container-type:inline-size]">
      <span ref={measureRef} aria-hidden="true" className="expanded-timer-measure tick-numerals pointer-events-none absolute invisible whitespace-nowrap">
        {pattern}
      </span>
      <p
        className={`expanded-timer-readout tick-numerals whitespace-nowrap ${lapsed ? "text-cream" : "text-ink"}`}
        style={fontSize === undefined ? undefined : { fontSize }}
      >
        {text}
      </p>
    </div>
  );
}