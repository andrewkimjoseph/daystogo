import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { initSound, isMuted, setMuted, subscribeMuted } from "@/lib/soundManager";

export function MuteToggle() {
  const [muted, setLocal] = useState(false);

  useEffect(() => {
    initSound();
    setLocal(isMuted());
    return subscribeMuted(setLocal);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
      className="brut-thin brut-press flex h-11 w-11 shrink-0 items-center justify-center rounded-none bg-card"
      style={{ backgroundColor: muted ? undefined : "var(--teal)" }}
    >
      {muted ? (
        <VolumeX className="h-5 w-5" strokeWidth={2.75} />
      ) : (
        <Volume2 className="h-5 w-5 text-primary-foreground" strokeWidth={2.75} />
      )}
    </button>
  );
}
