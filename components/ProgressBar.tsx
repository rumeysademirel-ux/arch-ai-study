import { STAGE_ORDER, stageIndex, type Stage } from "@/lib/stage";

// Text-free progress indicator, as required by the design language.
export function ProgressBar({ stage }: { stage: Stage }) {
  const total = STAGE_ORDER.length;
  const current = stageIndex(stage) + 1;
  const percent = Math.round((current / total) * 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1 w-full bg-border"
    >
      <div
        className="h-1 bg-accent transition-[width] duration-200"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
