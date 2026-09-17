"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TaskPosition } from "@/config/counterbalancing";

export function StartTaskButton({
  position,
  durationMinutes,
}: {
  position: TaskPosition;
  durationMinutes: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onStart() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/task/${position}/start`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bir hata oluştu.");
        return;
      }
      router.push(data.next);
    } catch {
      setError("Sunucuya bağlanılamadı, lütfen tekrar deneyiniz.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6">
      <p className="text-xs text-muted">Bu görev için yaklaşık {durationMinutes} dakikanız var.</p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
      <button
        onClick={onStart}
        disabled={submitting}
        className="mt-3 w-full rounded bg-accent px-4 py-2 text-sm font-medium text-accent-contrast disabled:opacity-50"
      >
        Göreve Başla
      </button>
    </div>
  );
}
