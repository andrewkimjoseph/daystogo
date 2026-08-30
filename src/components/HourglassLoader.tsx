export function HourglassLoader() {
  return (
    <div
      className="flex min-h-40 w-full items-center justify-center py-16"
      role="status"
      aria-label="Loading"
    >
      <div className="brut-thin animate-pop-in bg-card p-3">
        <span className="animate-hourglass-spin block text-3xl leading-none" aria-hidden="true">
          ⏳
        </span>
      </div>
    </div>
  );
}
