export function HourglassLoader() {
  return (
    <div
      className="flex min-h-40 w-full flex-1 items-center justify-center py-8"
      role="status"
      aria-label="Loading"
    >
      <div className="brut-thin animate-pop-in bg-card p-3">
        <img src="/loader.svg" alt="" className="h-20 w-20" aria-hidden="true" />
      </div>
    </div>
  );
}
