"use client";

import { useEffect, useState } from "react";

export function TaskTimer({ durationMinutes }: { durationMinutes: number }) {
  const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <span className="text-xs text-muted" aria-live="off">
      Kalan süre: {minutes}:{seconds.toString().padStart(2, "0")}
    </span>
  );
}
