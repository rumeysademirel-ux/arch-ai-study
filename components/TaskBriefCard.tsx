import type { TaskBrief } from "@/config/tasks";

// Görev tanımı ekranında tam boy, ilk fikir ekranında yan panelde (compact)
// aynı içeriği gösterir.
export function TaskBriefCard({ task, compact = false }: { task: TaskBrief; compact?: boolean }) {
  const Heading = compact ? "h2" : "h1";
  return (
    <div className={`rounded border border-border bg-white ${compact ? "p-4" : "p-6"}`}>
      <Heading
        className={`font-semibold text-foreground ${compact ? "text-base" : "text-xl"}`}
      >
        {task.title}
      </Heading>

      <div className={`space-y-4 text-sm text-foreground ${compact ? "mt-3" : "mt-5"}`}>
        <section>
          <h2 className="font-medium text-muted">Tasarım Problemi</h2>
          <p className="mt-1 leading-6">{task.problem}</p>
        </section>
        <section>
          <h2 className="font-medium text-muted">Hedef Kullanıcı</h2>
          <p className="mt-1 leading-6">{task.targetUser}</p>
        </section>
        <section>
          <h2 className="font-medium text-muted">Temel İhtiyaçlar</h2>
          <ul className="mt-1 list-disc pl-5 leading-6">
            {task.keyNeeds.map((need, i) => (
              <li key={i}>{need}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-medium text-muted">Sınırlılıklar</h2>
          <ul className="mt-1 list-disc pl-5 leading-6">
            {task.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-medium text-muted">Beklenen Çıktı</h2>
          <p className="mt-1 leading-6">{task.expectedOutput}</p>
        </section>
      </div>
    </div>
  );
}
