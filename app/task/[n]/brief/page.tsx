import { notFound } from "next/navigation";
import { requireStage } from "@/lib/page-guard";
import { PageShell } from "@/components/PageShell";
import { stageForTaskPosition } from "@/lib/stage";
import { parseTaskPosition, resolveTaskAssignment } from "@/lib/task-assignment";
import { StartTaskButton } from "./StartTaskButton";

export default async function TaskBriefPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const position = parseTaskPosition((await params).n);
  if (!position) notFound();

  const stage = stageForTaskPosition(position, "BRIEF");
  const code = await requireStage(stage);
  const { task } = await resolveTaskAssignment(code, position);

  return (
    <PageShell stage={stage}>
      <div className="rounded border border-border bg-white p-6">
        <h1 className="text-xl font-semibold text-foreground">{task.title}</h1>

        <div className="mt-5 space-y-4 text-sm text-foreground">
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

      <StartTaskButton position={position} durationMinutes={task.durationMinutes} />
    </PageShell>
  );
}
