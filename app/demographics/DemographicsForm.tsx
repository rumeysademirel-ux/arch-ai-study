"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { demographicFields } from "@/config/demographics-fields";

export function DemographicsForm() {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/demographics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      {demographicFields.map((field) => (
        <div key={field.key}>
          <label htmlFor={field.key} className="block text-sm font-medium text-foreground">
            {field.label} {field.required && <span className="text-danger">*</span>}
          </label>
          {field.type === "select" ? (
            <select
              id={field.key}
              value={values[field.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
              required={field.required}
              className="mt-1 w-full rounded border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            >
              <option value="" disabled>
                Seçiniz
              </option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.key}
              type="text"
              value={values[field.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
              required={field.required}
              className="mt-1 w-full rounded border border-border px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          )}
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
        Devam Et
      </button>
    </form>
  );
}
