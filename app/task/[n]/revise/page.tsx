import { notFound } from "next/navigation";
import { requireStage } from "@/lib/page-guard";
import { PageShell, ReferenceLayout } from "@/components/PageShell";
import { prepare } from "@/lib/db";
import { stageForTaskPosition } from "@/lib/stage";
import { parseTaskPosition, resolveTaskAssignment } from "@/lib/task-assignment";
import { ReviseForm } from "./ReviseForm";

export default async function RevisePage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const position = parseTaskPosition((await params).n);
  if (!position) notFound();

  const stage = stageForTaskPosition(position, "REVISED_IDEA");
  const code = await requireStage(stage);
  const { task } = await resolveTaskAssignment(code, position);

  const initialIdea = (await prepare(
    `SELECT title, description FROM initial_ideas WHERE participant_code = ? AND task_key = ?`
  ).get(code, task.taskKey)) as { title: string; description: string };

  const feedback = (await prepare(
    `SELECT feedback_text FROM ai_feedback_events WHERE participant_code = ? AND task_key = ?`
  ).get(code, task.taskKey)) as { feedback_text: string } | undefined;

  const reference = (
    <>
      {feedback && (
        <section className="rounded border border-border bg-white p-4">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
            Yapay Zekâ Geri Bildirimi
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground">
            {feedback.feedback_text}
          </p>
        </section>
      )}
      <section className="rounded border border-border bg-white p-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
          İlk Fikriniz (salt okunur)
        </h2>
        <p className="mt-2 text-sm font-medium text-foreground">{initialIdea.title}</p>
        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-foreground">
          {initialIdea.description}
        </p>
      </section>
    </>
  );

  return (
    <PageShell stage={stage} wide>
      <ReferenceLayout reference={reference}>
        <h1 className="text-xl font-semibold text-foreground">Fikrinizi Revize Edin</h1>
        <ReviseForm position={position} />
      </ReferenceLayout>
    </PageShell>
  );
}
