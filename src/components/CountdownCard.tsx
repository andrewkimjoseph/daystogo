import { useCallback, useEffect, useRef, useState } from "react";
import { Archive, ArchiveRestore, Check, Download, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import logoUrl from "@/assets/logo.png";
import type { Countdown } from "@/lib/db";
import { countdownsRepo, remainingMs } from "@/lib/countdownsRepo";
import { formatRemaining, progressPercent } from "@/lib/formatTime";
import { formatTargetLabel } from "@/lib/localTime";
import { downloadCountdownImage } from "@/lib/shareImage";

import { burstConfetti } from "@/lib/confetti";
import { playSound } from "@/lib/soundManager";
import { COLOR_TAGS, INK, PALETTE, tagTextColor } from "@/lib/palette";
import { CATEGORIES, categoryMeta, type CountdownCategory } from "@/lib/categories";
import { Sparkle } from "./Sparkle";


const SEGMENTS = 16;

/** Ids already celebrated this session — survives effect teardown/re-runs. */
const celebrated = new Set<string>();

export function CountdownCard({
  countdown,
  now,
  onChanged,
  variant = "active",
}: {
  countdown: Countdown;
  now: number;
  onChanged: () => void;
  variant?: "active" | "archived";
}) {
  const isArchived = variant === "archived";
  const cardRef = useRef<HTMLElement | null>(null);
  const controlsRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingArchive, setConfirmingArchive] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(countdown.title);
  const [saving, setSaving] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const commitTitle = useCallback(async () => {
    const trimmed = draftTitle.trim().toUpperCase();
    if (trimmed && trimmed !== countdown.title) {
      await countdownsRepo.updateTags(countdown.id, { title: trimmed });
      setDraftTitle(trimmed);
      onChanged();
    } else if (!trimmed) {
      setDraftTitle(countdown.title);
    }
  }, [draftTitle, countdown.title, countdown.id, onChanged]);

  const commitTitleRef = useRef(commitTitle);
  useEffect(() => {
    commitTitleRef.current = commitTitle;
  }, [commitTitle]);


  // Keep the draft title in sync with the stored title whenever the editor opens.
  useEffect(() => {
    if (editing) setDraftTitle(countdown.title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  // Close the tag editor when clicking anywhere outside it, committing the name.
  useEffect(() => {
    if (!editing) return;
    const onPointerDown = async (e: PointerEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      if (controlsRef.current?.contains(e.target as Node)) return;
      await commitTitleRef.current();
      setEditing(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [editing]);

  // Hide controls on touch when the user taps outside the card.
  useEffect(() => {
    const onDocPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      if (!cardRef.current) return;
      if (!cardRef.current.contains(e.target as Node)) {
        void commitTitleRef.current();
        setRevealed(false);
        setEditing(false);
        setConfirmingDelete(false);
        setConfirmingArchive(false);
      }
    };
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, []);


  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setRevealed(true);
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    // If a control is focused, blur it so the CSS focus-within reveal doesn't
    // keep the controls visible after the mouse leaves.
    if (cardRef.current?.contains(document.activeElement)) {
      (document.activeElement as HTMLElement | null)?.blur();
    }
    void commitTitle();
    setEditing(false);
    setConfirmingDelete(false);
    setConfirmingArchive(false);
    setRevealed(false);
  };

  const handleCardTouchStart = (e: React.TouchEvent) => {
    if (controlsRef.current?.contains(e.target as Node)) return;
    if (panelRef.current?.contains(e.target as Node)) return;
    setRevealed((v) => !v);
  };


  const remaining = remainingMs(countdown, now);
  const lapsed = countdown.status === "lapsed" || (countdown.status === "running" && remaining <= 0);
  const { text, dramatic } = formatRemaining(remaining);
  const pct = lapsed ? 100 : progressPercent(countdown.startedAt, countdown.endsAt, remaining);
  const filled = Math.round((pct / 100) * SEGMENTS);
  const urgent = !lapsed && countdown.status === "running" && remaining <= 60_000;

  // Lapse detection + one-time celebration, driven by the shared tick.
  // Celebrate synchronously and guard with a module-level set: the DB writes
  // below re-render this card, which would otherwise cancel the effect midway.
  useEffect(() => {
    if (!lapsed) return;
    if (!countdown.hasCelebrated && !celebrated.has(countdown.id)) {
      celebrated.add(countdown.id);
      burstConfetti(cardRef.current);
      playSound("lapsed");
      void countdownsRepo.markCelebrated(countdown.id);
    }
    if (countdown.status !== "lapsed") {
      void countdownsRepo.markLapsed(countdown.id);
    }
    onChanged();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lapsed, countdown.id, countdown.status, countdown.hasCelebrated]);


  const tagColor = lapsed ? PALETTE.red : countdown.colorTag;
  const badge = lapsed ? "🎉 Lapsed!" : "Running";
  const category = categoryMeta(countdown.category);
  const CategoryIcon = category.icon;

  return (
    <article
      ref={cardRef}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onTouchStart={handleCardTouchStart}
      className={`countdown-card brut animate-pop-in relative flex flex-col gap-3 bg-card p-4 sm:gap-4 sm:p-5 ${editing && !lapsed ? "z-20" : "z-0"}`}
      style={lapsed ? { backgroundImage: `linear-gradient(140deg, ${PALETTE.mauve}, ${PALETTE.red})` } : undefined}
    >
      {lapsed && (
        <>
          <Sparkle color={PALETTE.teal} size={30} className="animate-wiggle absolute -top-4 -left-4" />
          <Sparkle color={PALETTE.cream} size={22} className="absolute -top-3 -right-3" />
        </>
      )}

      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase"
            style={{ color: lapsed ? PALETTE.cream : "var(--muted-foreground)" }}
          >
            <CategoryIcon className="h-3 w-3 shrink-0" strokeWidth={3} />
            <span className="truncate">{category.label}</span>
          </p>
          <h2
            className="text-base leading-tight break-words uppercase sm:text-lg"
            style={lapsed ? { color: PALETTE.cream } : undefined}
          >
            {countdown.title}
          </h2>
          {countdown.targetAt !== undefined && !lapsed && (
            <p
              className="mt-1 text-xs font-bold uppercase"
              style={{ color: lapsed ? PALETTE.cream : "var(--muted-foreground)" }}
            >
              {formatTargetLabel(countdown.targetAt)}
            </p>
          )}
        </div>
        <span
          className="brut-thin shrink-0 rounded-none px-3 py-1 text-xs font-bold whitespace-nowrap uppercase"
          style={{ backgroundColor: tagColor, color: tagTextColor(tagColor) }}
        >
          {badge}
        </span>
      </header>



      <p
        className={`tick-numerals ${dramatic ? "text-4xl sm:text-6xl" : "text-3xl sm:text-4xl"} ${urgent ? "animate-pulse-hard" : ""}`}
        style={{ color: lapsed ? PALETTE.cream : urgent ? PALETTE.red : "var(--ink)" }}
      >
        {text}
      </p>

      <div
        aria-hidden={!(editing && revealed) || lapsed}
        className={`grid transition-[grid-template-rows,opacity,margin] duration-[420ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none ${
          editing && revealed && !lapsed
            ? "grid-rows-[1fr] opacity-100"
            : "pointer-events-none -mb-3 grid-rows-[0fr] opacity-0 sm:-mb-4"
        }`}
      >
        <div className="overflow-hidden">
        <div
          ref={panelRef}
          className={`brut-thin relative z-10 flex flex-col gap-3 bg-cream p-3 transition-transform duration-[420ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none ${
            editing && revealed && !lapsed ? "translate-y-0" : "-translate-y-1"
          }`}
        >


          <div>
            <label htmlFor={`title-${countdown.id}`} className="mb-2 block text-[10px] font-bold uppercase">
              Name
            </label>
            <input
              id={`title-${countdown.id}`}
              type="text"
              value={draftTitle}
              // Keep the raw keystrokes in state — uppercasing here would reset
              // the caret to the end on every mid-word edit. CSS handles the look.
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={commitTitle}
              maxLength={120}
              className="brut-thin w-full rounded-none border-ink bg-card px-2 py-1.5 text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-ink"
              placeholder="COUNTDOWN NAME"
            />
          </div>
          <div>
            <span className="mb-2 block text-[10px] font-bold uppercase">Colour tag</span>
            <div className="flex flex-wrap gap-2">
              {COLOR_TAGS.map((c) => (
                <span key={c.hex} className="group relative inline-flex">
                  <button
                    type="button"
                    title={c.label}
                    aria-label={c.label}
                    aria-pressed={countdown.colorTag === c.hex}
                    onClick={async () => {
                      await countdownsRepo.updateTags(countdown.id, { colorTag: c.hex });
                      onChanged();
                    }}
                    className="brut-thin brut-press h-10 w-10 rounded-none sm:h-8 sm:w-8"
                    style={{
                      backgroundColor: c.hex,
                      boxShadow:
                        countdown.colorTag === c.hex ? "0 0 0 3px var(--ink) inset" : undefined,
                    }}
                  />
                  <span className="brut-thin pointer-events-none absolute -top-7 left-1/2 z-20 -translate-x-1/2 bg-ink px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap text-cream uppercase opacity-0 transition-opacity group-hover:opacity-100">
                    {c.label}
                  </span>
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-2 block text-[10px] font-bold uppercase">Category</span>
            <div className="grid grid-cols-4 gap-1">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const on = categoryMeta(countdown.category).key === c.key;
                return (
                  <span key={c.key} className="group relative inline-flex">
                    <button
                      type="button"
                      title={c.label}
                      aria-label={c.label}
                      aria-pressed={on}
                      onClick={async () => {
                        await countdownsRepo.updateTags(countdown.id, {
                          category: c.key as CountdownCategory,
                        });
                        onChanged();
                      }}
                      className="brut-thin brut-press flex h-11 w-full items-center justify-center rounded-none sm:h-9"
                      style={
                        on
                          ? { backgroundColor: PALETTE.mauve, color: PALETTE.cream }
                          : { backgroundColor: "var(--card)" }
                      }
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                    <span className="brut-thin pointer-events-none absolute -top-7 left-1/2 z-20 -translate-x-1/2 bg-ink px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap text-cream uppercase opacity-0 transition-opacity group-hover:opacity-100">
                      {c.label}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase text-muted-foreground">
            Only the name, colour and category can change — the clock keeps running.
          </p>
          </div>
        </div>
      </div>



      <div className="mt-auto flex gap-[3px]" aria-label={`${Math.round(pct)}% elapsed`}>
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <span
            key={i}
            className="h-4 flex-1 border-2 border-ink"
            style={{ backgroundColor: i < filled ? (lapsed ? PALETTE.cream : tagColor) : "transparent" }}
          />
        ))}
      </div>

      <div
        aria-hidden={!revealed}
        className={`controls-reveal grid transition-[grid-template-rows,opacity,margin] duration-[420ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none ${
          revealed
            ? "grid-rows-[1fr] opacity-100"
            : "pointer-events-none -mb-3 grid-rows-[0fr] opacity-0 sm:-mb-4"
        }`}
      >
        <div className="overflow-hidden px-1 pb-1">
          <div
            ref={controlsRef}
            onPointerDown={(e) => e.stopPropagation()}
            className="pt-1"
          >
            {confirmingDelete ? (
              <div className="brut-thin flex flex-wrap items-center justify-between gap-2 bg-destructive p-2">
                <span className="text-sm font-bold text-destructive-foreground uppercase">
                  Nuke this countdown?
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await countdownsRepo.remove(countdown.id);
                      onChanged();
                    }}
                    aria-label="Confirm delete"
                    title="Do it"
                    className="brut-thin brut-pop flex h-9 w-9 items-center justify-center rounded-none bg-card"
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    aria-label="Cancel delete"
                    title="Nope"
                    className="brut-thin brut-pop flex h-9 w-9 items-center justify-center rounded-none bg-cream"
                  >
                    <X className="h-4 w-4" strokeWidth={3} />
                  </button>
                </div>
              </div>
            ) : confirmingArchive ? (
              <div className="brut-thin flex flex-wrap items-center justify-between gap-2 p-2" style={{ backgroundColor: PALETTE.mauve }}>
                <span className="text-sm font-bold uppercase" style={{ color: PALETTE.cream }}>
                  Box it up?
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await countdownsRepo.archive(countdown.id);
                      toast.success("Moved to the archive");
                      setConfirmingArchive(false);
                      onChanged();
                    }}
                    aria-label="Confirm archive"
                    title="Do it"
                    className="brut-thin brut-pop flex h-9 w-9 items-center justify-center rounded-none bg-card"
                  >
                    <Check className="h-4 w-4" strokeWidth={3} style={{ color: INK }} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingArchive(false)}
                    aria-label="Cancel archive"
                    title="Nope"
                    className="brut-thin brut-pop flex h-9 w-9 items-center justify-center rounded-none bg-cream"
                  >
                    <X className="h-4 w-4" strokeWidth={3} style={{ color: INK }} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-nowrap gap-2">
                {!lapsed && (
                  <button
                    type="button"
                    onClick={() => setEditing((v) => !v)}
                    aria-expanded={editing}
                    className="brut-thin brut-pop flex min-h-11 flex-1 items-center justify-center gap-2 rounded-none bg-primary px-3 py-2 text-sm font-bold text-primary-foreground uppercase"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={3} /> {editing ? "Done" : "Edit tags"}
                  </button>
                )}

                <button
                  type="button"
                  disabled={saving}
                  onClick={async () => {
                    setSaving(true);
                    try {
                      await downloadCountdownImage(countdown, now);
                      toast.success("Share image downloaded");
                    } catch {
                      toast.error("Couldn't make the image. Try again.");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  aria-label="Download countdown as PNG"
                  title="Download as PNG"
                  className="brut-thin brut-pop flex h-11 w-11 shrink-0 items-center justify-center rounded-none bg-cream disabled:opacity-60"
                >
                  <Download className="h-4 w-4" strokeWidth={3} />
                </button>

                {lapsed && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (isArchived) {
                        await countdownsRepo.unarchive(countdown.id);
                        toast.success("Back on the board");
                        onChanged();
                      } else {
                        setConfirmingArchive(true);
                      }
                    }}
                    aria-label={isArchived ? "Restore countdown" : "Archive countdown"}
                    title={isArchived ? "Restore" : "Archive"}
                    className="brut-thin brut-pop flex h-11 w-11 shrink-0 items-center justify-center rounded-none bg-cream"
                  >
                    {isArchived ? (
                      <ArchiveRestore className="h-4 w-4" strokeWidth={3} />
                    ) : (
                      <Archive className="h-4 w-4" strokeWidth={3} />
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  aria-label="Delete countdown"
                  className="brut-thin brut-pop flex h-11 w-11 shrink-0 items-center justify-center rounded-none bg-card"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={3} />
                </button>

              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p
          className="text-[10px] font-bold uppercase"
          style={{ color: lapsed ? PALETTE.cream : "var(--muted-foreground)" }}
        >
          {new Date(countdown.createdAt).toLocaleString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </p>
        <img
          src={logoUrl}
          alt="Days To Go"
          className="h-10 w-auto opacity-80"
        />
      </div>
    </article>
  );
}
