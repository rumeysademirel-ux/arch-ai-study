"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { interviewQuestions, INTERVIEW_ANSWER_MAX_CHARS } from "@/config/interview-questions";

export function InterviewForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/interview", {
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
    <form onSubmit={onSubmit} className="mt-6 space-y-6">
      {interviewQuestions.map((q, i) => (
        <div key={q.number}>
          <label
            htmlFor={`interview-${q.number}`}
            className="block text-sm font-medium leading-6 text-foreground"
          >
            {i + 1}. {q.text}
          </label>
          <textarea
            id={`interview-${q.number}`}
            value={answers[q.number] ?? ""}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.number]: e.target.value }))}
            rows={5}
            maxLength={INTERVIEW_ANSWER_MAX_CHARS}
            className="mt-2 w-full rounded border border-border px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </div>
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
        Yanıtları Kaydet ve Bitir
      </button>
    </form>
  );
}
