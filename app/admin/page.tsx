import Link from "next/link";
import { listParticipants } from "@/lib/admin-data";

const STAGE_LABELS: Record<string, string> = {
  DEMOGRAPHICS: "Demografik",
  MSTAT: "MSTAT-II",
  TASK1_BRIEF: "Görev 1 — Brief",
  TASK1_INITIAL_IDEA: "Görev 1 — İlk Fikir",
  TASK1_PRE_ASSESSMENT: "Görev 1 — Süreç Değ. (ön)",
  TASK1_AI_FEEDBACK: "Görev 1 — AI Geri Bildirimi",
  TASK1_REVISED_IDEA: "Görev 1 — Revizyon",
  TASK1_POST_ASSESSMENT: "Görev 1 — Süreç Değ. (son)",
  BREAK: "Mola",
  TASK2_BRIEF: "Görev 2 — Brief",
  TASK2_INITIAL_IDEA: "Görev 2 — İlk Fikir",
  TASK2_PRE_ASSESSMENT: "Görev 2 — Süreç Değ. (ön)",
  TASK2_AI_FEEDBACK: "Görev 2 — AI Geri Bildirimi",
  TASK2_REVISED_IDEA: "Görev 2 — Revizyon",
  TASK2_POST_ASSESSMENT: "Görev 2 — Süreç Değ. (son)",
  COMPLETE: "Tamamlandı",
};

export default async function AdminPage() {
  const participants = await listParticipants();
  const completedCount = participants.filter((p) => p.completed).length;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold text-foreground">Araştırmacı Paneli</h1>
        <div className="flex gap-3">
          <a
            href="/api/admin/export?format=csv"
            className="rounded border border-border bg-white px-3 py-1.5 text-sm text-foreground hover:border-accent"
          >
            CSV indir
          </a>
          <a
            href="/api/admin/export?format=json"
            className="rounded border border-border bg-white px-3 py-1.5 text-sm text-foreground hover:border-accent"
          >
            JSON indir
          </a>
        </div>
      </div>

      <p className="mt-2 text-sm text-muted">
        {participants.length} katılımcı — {completedCount} tamamladı.
      </p>

      <div className="mt-6 overflow-x-auto rounded border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-2">Kod</th>
              <th className="px-4 py-2">Grup</th>
              <th className="px-4 py-2">Aşama</th>
              <th className="px-4 py-2">Oluşturulma</th>
              <th className="px-4 py-2">Son Güncelleme</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.code} className="border-b border-border last:border-0">
                <td className="px-4 py-2 font-medium text-foreground">{p.code}</td>
                <td className="px-4 py-2 text-muted">{p.assignedGroup}</td>
                <td className="px-4 py-2 text-foreground">
                  {p.completed ? (
                    <span className="text-accent">Tamamlandı</span>
                  ) : (
                    STAGE_LABELS[p.currentStage] ?? p.currentStage
                  )}
                </td>
                <td className="px-4 py-2 text-muted">{p.createdAt}</td>
                <td className="px-4 py-2 text-muted">{p.updatedAt}</td>
                <td className="px-4 py-2">
                  <Link href={`/admin/${p.code}`} className="text-accent hover:underline">
                    Detay
                  </Link>
                </td>
              </tr>
            ))}
            {participants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted">
                  Henüz katılımcı yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
