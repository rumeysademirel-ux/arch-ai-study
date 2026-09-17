"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bir hata oluştu, lütfen tekrar deneyiniz.");
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
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-foreground">
          Katılımcı Kodu
        </label>
        <input
          id="code"
          name="code"
          type="text"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mt-1 w-full rounded border border-border px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          required
        />
      </div>
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
