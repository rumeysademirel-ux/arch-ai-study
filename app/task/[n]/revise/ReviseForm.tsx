"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WordCounter } from "@/components/WordCounter";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";
import { SketchUpload } from "@/components/SketchUpload";
import { useDraft, clearDraft } from "@/lib/use-draft";
import { countWords } from "@/lib/word-count";
import type { TaskPosition } from "@/config/counterbalancing";

export function ReviseForm({ position }: { position: TaskPosition }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sketch, setSketch] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const draftKey = `draft-revised-idea-${position}`;
  const autosaveStatus = useDraft(draftKey, `${title}\n${description}`);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Revize fikir başlığı ve açıklaması zorunludur.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("title", title);
      form.set("description", description);
      if (sketch) form.set("sketch", sketch);

      const res = await fetch(`/api/idea/${position}/revised`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bir hata oluştu.");
        return;
      }
      clearDraft(draftKey);
      router.push(data.next);
    } catch {
      setError("Sunucuya bağlanılamadı, lütfen tekrar deneyiniz.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-5">
      <div className="flex justify-end">
        <AutosaveIndicator status={autosaveStatus} />
      </div>

      <div>
        <label htmlFor="rtitle" className="block text-sm font-medium text-foreground">
          Revize Fikir Başlığı
        </label>
        <input
          id="rtitle"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 w-full rounded border border-border px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="rdescription" className="block text-sm font-medium text-foreground">
            Revize Fikir Açıklaması
          </label>
          <WordCounter count={countWords(description)} />
        </div>
        <textarea
          id="rdescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={10}
          className="mt-1 w-full rounded border border-border px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        />
      </div>

      <SketchUpload label="Yeni Eskiz veya Diyagram" file={sketch} onChange={setSketch} />

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
        Revizyonu Kaydet ve Devam Et
      </button>
    </form>
  );
}
