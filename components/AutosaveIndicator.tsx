type AutosaveStatus = "idle" | "saving" | "saved";

export function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
  const label =
    status === "saving" ? "Kaydediliyor…" : status === "saved" ? "Kaydedildi" : "";

  return (
    <span className="text-xs text-muted h-4 inline-block" aria-live="polite">
      {label}
    </span>
  );
}
