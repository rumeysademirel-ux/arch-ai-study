"use client";

interface LikertScaleProps {
  name: string;
  question: string;
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
}

export function LikertScale({
  name,
  question,
  value,
  onChange,
  min = 1,
  max = 7,
  lowLabel,
  highLabel,
}: LikertScaleProps) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-foreground">{question}</legend>
      <div className="flex items-center gap-2">
        {lowLabel && <span className="text-xs text-muted w-24">{lowLabel}</span>}
        <div className="flex flex-1 justify-between gap-1">
          {options.map((option) => {
            const id = `${name}-${option}`;
            return (
              <label
                key={option}
                htmlFor={id}
                className="flex flex-col items-center gap-1 text-xs text-muted cursor-pointer"
              >
                <input
                  id={id}
                  type="radio"
                  name={name}
                  value={option}
                  checked={value === option}
                  onChange={() => onChange(option)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                {option}
              </label>
            );
          })}
        </div>
        {highLabel && <span className="text-xs text-muted w-24 text-right">{highLabel}</span>}
      </div>
    </fieldset>
  );
}
