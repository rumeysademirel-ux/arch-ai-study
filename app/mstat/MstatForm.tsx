"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mstatItems, mstatScaleLabels, mstatScaleMin, mstatScaleMax } from "@/config/mstat-items";
import { LikertScale } from "@/components/LikertScale";

export function MstatForm() {
  const router = useRouter();
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (Object.keys(responses).length < mstatItems.length) {
      setError("Lütfen tüm maddeleri yanıtlayınız.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/mstat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
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
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      {mstatItems.map((item) => (
        <LikertScale
          key={item.itemNumber}
          name={`mstat-${item.itemNumber}`}
          question={item.text}
          value={responses[item.itemNumber] ?? null}
          onChange={(v) =>
            setResponses((r) => ({ ...r, [item.itemNumber]: v }))
          }
          min={mstatScaleMin}
          max={mstatScaleMax}
          lowLabel={mstatScaleLabels[0]}
          highLabel={mstatScaleLabels[mstatScaleLabels.length - 1]}
        />
      ))}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded bg-accent px-4 py-2 text-sm font-medium text-accent-contrast disabled:opacity-50"
      >
        Devam Et
      </button>
    </form>
  );
}
