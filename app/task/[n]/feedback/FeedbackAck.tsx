"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TaskPosition } from "@/config/counterbalancing";

export function FeedbackAck({ position }: { position: TaskPosition }) {
  const router = useRouter();
  const shownAtRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    shownAtRef.current = Date.now();
  }, []);

  async function onAck() {
    setSubmitting(true);
    setError(null);
    const readingDurationSeconds = (Date.now() - (shownAtRef.current ?? Date.now())) / 1000;
    try {
      const res = await fetch(`/api/feedback/${position}/ack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readingDurationSeconds }),
      });
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
      {error && (
        <p role="alert" className="mb-2 text-sm text-danger">
          {error}
        </p>
      )}
      <button
        onClick={onAck}
        disabled={submitting}
        className="w-full rounded bg-accent px-4 py-2 text-sm font-medium text-accent-contrast disabled:opacity-50"
      >
        Geri bildirimi okudum ve revizyona geçmek istiyorum
      </button>
    </div>
  );
}
