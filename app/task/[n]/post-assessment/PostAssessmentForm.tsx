"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postAssessmentQuestions, scaleMin, scaleMax } from "@/config/process-questions";
import { LikertScale } from "@/components/LikertScale";
import type { TaskPosition } from "@/config/counterbalancing";

export function PostAssessmentForm({ position }: { position: TaskPosition }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (Object.keys(answers).length < postAssessmentQuestions.length) {
      setError("Lütfen tüm maddeleri yanıtlayınız.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/assessment/${position}/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
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
      {postAssessmentQuestions.map((q) => (
        <LikertScale
          key={q.key}
          name={q.key}
          question={q.text}
          value={answers[q.key] ?? null}
          onChange={(v) => setAnswers((a) => ({ ...a, [q.key]: v }))}
          min={scaleMin}
          max={scaleMax}
          lowLabel={q.lowLabel}
          highLabel={q.highLabel}
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
        {position === 2 ? "Tamamla" : "Devam Et"}
      </button>
    </form>
  );
}
