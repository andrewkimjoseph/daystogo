import { Hourglass } from "lucide-react";

export function HourglassLoader() {
  return (
    <div className="flex items-center justify-center py-16" role="status" aria-label="Loading">
      <div className="brut-thin animate-pop-in bg-card p-3">
        <Hourglass className="animate-hourglass-spin size-7 text-teal" strokeWidth={2.5} />
      </div>
    </div>
  );
}
