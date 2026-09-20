import Link from "next/link";
import { notFound } from "next/navigation";
import { getParticipantDetail } from "@/lib/admin-data";
import { interviewQuestions } from "@/config/interview-questions";

// bkz. app/admin/page.tsx — aynı statik önbellekleme riski burada da geçerli.
export const dynamic = "force-dynamic";

function prettyJson(raw: string | null): string | null {
  if (!raw) return null;
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export default async function ParticipantDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const detail = await getParticipantDetail(code);
  if (!detail) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/admin" className="text-sm text-accent hover:underline">
        ← Tüm Katılımcılar
      </Link>

      <h1 className="mt-2 text-xl font-semibold text-foreground">{detail.code}</h1>
      <p className="mt-1 text-sm text-muted">
        Grup {detail.assignedGroup} · Aşama: {detail.currentStage} · Oluşturulma:{" "}
        {detail.createdAt}
      </p>

      <Section title="Demografik Bilgiler">
        {detail.demographics ? (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {Object.entries(detail.demographics).map(([key, value]) => (
              <div key={key} className="contents">
                <dt className="text-muted">{key}</dt>
                <dd className="text-foreground">{value ?? "—"}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <Empty />
        )}
      </Section>

      <Section title="MSTAT-II">
        {detail.mstatScore ? (
          <p className="text-sm text-foreground">
            Toplam: {detail.mstatScore.totalScore} · Ortalama:{" "}
            {detail.mstatScore.averageScore.toFixed(2)}
          </p>
        ) : (
          <Empty />
        )}
      </Section>

      {detail.tasks.map((t) => (
        <section key={t.taskKey} className="mt-8">
          <h2 className="text-base font-semibold text-foreground">
            {t.position ? `${t.position}. Görev` : "Görev"} — {t.taskTitle}
          </h2>
          <p className="mt-1 text-xs text-muted">
            task_key: {t.taskKey} · koşul: {t.condition ?? "—"} · başlangıç: {t.startedAt ?? "—"}{" "}
            · bitiş: {t.endedAt ?? "—"}
          </p>

          <Section title="İlk Fikir">
            {t.initialIdea ? (
              <div className="text-sm">
                <p className="font-medium text-foreground">{t.initialIdea.title}</p>
                <p className="mt-1 whitespace-pre-line text-foreground">
                  {t.initialIdea.description}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {t.initialIdea.wordCount} kelime · eskiz:{" "}
                  {t.initialIdea.sketchFilename ? (
                    <a
                      href={`/api/admin/sketch/initial/${detail.code}/${t.taskKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      {t.initialIdea.sketchFilename}
                    </a>
                  ) : (
                    "yok"
                  )}{" "}
                  · {t.initialIdea.submittedAt}
                </p>
              </div>
            ) : (
              <Empty />
            )}
          </Section>

          <Section title="Süreç Değerlendirmesi (Geri Bildirim Öncesi)">
            {t.preAssessment ? (
              <ul className="text-sm text-foreground">
                <li>Yön netliği: {t.preAssessment.clarity}</li>
                <li>Karar verme güçlüğü: {t.preAssessment.decisionDifficulty}</li>
                <li>İhtiyaç duyulan yönlendirme: {t.preAssessment.guidanceNeeded}</li>
              </ul>
            ) : (
              <Empty />
            )}
          </Section>

          <Section title="AI Geri Bildirimi">
            {t.aiFeedback ? (
              <div className="space-y-2 text-sm">
                <p className="text-foreground">
                  <span className="text-muted">Koşul:</span> {t.aiFeedback.condition} ·{" "}
                  <span className="text-muted">Model:</span> {t.aiFeedback.model}
                </p>
                <details>
                  <summary className="cursor-pointer text-accent">
                    Gönderilen prompt&apos;u göster
                  </summary>
                  <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded bg-[#f4f4f2] p-3 text-xs">
                    {t.aiFeedback.promptSent}
                  </pre>
                </details>
                <p className="whitespace-pre-line text-foreground">{t.aiFeedback.feedbackText}</p>
                <p className="text-xs text-muted">
                  Gösterim: {t.aiFeedback.shownAt} · Onay: {t.aiFeedback.ackAt ?? "—"} · Okuma
                  süresi: {t.aiFeedback.readingDurationSeconds ?? "—"} sn
                </p>
                {t.aiFeedback.condition === "adaptive" && (
                  <details>
                    <summary className="cursor-pointer text-accent">
                      Fuzzy motor verilerini göster
                    </summary>
                    <div className="mt-1 space-y-2">
                      <p className="text-xs text-foreground">
                        Çıktı (0–100): <strong>{t.aiFeedback.fuzzyOutput}</strong>
                      </p>
                      <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-[#f4f4f2] p-3 text-xs">
                        {"// girdiler\n" + (prettyJson(t.aiFeedback.fuzzyInputs) ?? "—") +
                          "\n\n// üyelik dereceleri\n" +
                          (prettyJson(t.aiFeedback.fuzzyMembership) ?? "—") +
                          "\n\n// etkinleşen kurallar\n" +
                          (prettyJson(t.aiFeedback.fuzzyRules) ?? "—")}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            ) : (
              <Empty />
            )}
          </Section>

          <Section title="Revize Fikir">
            {t.revisedIdea ? (
              <div className="text-sm">
                <p className="font-medium text-foreground">{t.revisedIdea.title}</p>
                <p className="mt-1 whitespace-pre-line text-foreground">
                  {t.revisedIdea.description}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {t.revisedIdea.wordCount} kelime · eskiz:{" "}
                  {t.revisedIdea.sketchFilename ? (
                    <a
                      href={`/api/admin/sketch/revised/${detail.code}/${t.taskKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      {t.revisedIdea.sketchFilename}
                    </a>
                  ) : (
                    "yok"
                  )}{" "}
                  · {t.revisedIdea.submittedAt}
                </p>
              </div>
            ) : (
              <Empty />
            )}
          </Section>

          <Section title="Süreç Değerlendirmesi (Geri Bildirim Sonrası)">
            {t.postAssessment ? (
              <ul className="grid grid-cols-2 gap-x-6 text-sm text-foreground">
                <li>Yön netliği: {t.postAssessment.clarity}</li>
                <li>Karar verme güçlüğü: {t.postAssessment.decisionDifficulty}</li>
                <li>Yönlendirme ihtiyacı: {t.postAssessment.guidanceNeeded}</li>
                <li>Yapılandırma düzeyi: {t.postAssessment.structureLevel}</li>
                <li>İhtiyaca uygunluk: {t.postAssessment.fitToNeed}</li>
                <li>Karar alanı bırakma: {t.postAssessment.thinkingSpace}</li>
                <li>Kullanım düzeyi: {t.postAssessment.usageLevel}</li>
              </ul>
            ) : (
              <Empty />
            )}
          </Section>
        </section>
      ))}

      <section className="mt-8">
        <h2 className="text-base font-semibold text-foreground">Çalışma Sonrası Görüşme</h2>
        <Section title="Açık Uçlu Yanıtlar (49-53)">
          {detail.interview.length > 0 ? (
            <dl className="space-y-3 text-sm">
              {interviewQuestions.map((q) => {
                const answer = detail.interview.find((i) => i.questionNumber === q.number)?.answer;
                return (
                  <div key={q.number}>
                    <dt className="text-muted">
                      {q.number}. {q.text}
                    </dt>
                    <dd className="mt-1 whitespace-pre-line text-foreground">{answer ?? "—"}</dd>
                  </div>
                );
              })}
            </dl>
          ) : (
            <Empty />
          )}
        </Section>
      </section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4 rounded border border-border bg-white p-4">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Empty() {
  return <p className="text-sm text-muted">Henüz veri yok.</p>;
}
