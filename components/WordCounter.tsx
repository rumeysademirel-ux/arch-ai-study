export function WordCounter({ count }: { count: number }) {
  return (
    <span className="text-xs text-muted" aria-live="polite">
      {count} kelime
    </span>
  );
}
