"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function StageContinueButton({ endpoint, label }: { endpoint: string; label: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onContinue() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { method: "POST" });
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
        onClick={onContinue}
        disabled={submitting}
        className="w-full rounded bg-accent px-4 py-2 text-sm font-medium text-accent-contrast disabled:opacity-50"
      >
        {label}
      </button>
    </div>
  );
}
