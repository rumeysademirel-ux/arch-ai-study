"use client";

import { useEffect, useRef, useState } from "react";

type AutosaveStatus = "idle" | "saving" | "saved";

/**
 * Debounced localStorage draft persistence, purely for the autosave
 * indicator UI. The authoritative save happens on final form submit —
 * this never talks to the server, so it cannot violate immutability.
 */
export function useDraft(storageKey: string, value: string) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setStatus("saving");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      window.localStorage.setItem(storageKey, value);
      setStatus("saved");
    }, 600);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return status;
}

export function loadDraft(storageKey: string): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(storageKey) ?? "";
}

export function clearDraft(storageKey: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey);
}
