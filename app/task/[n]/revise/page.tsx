import { notFound } from "next/navigation";
import { requireStage } from "@/lib/page-guard";
import { PageShell } from "@/components/PageShell";
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

  return (
    <PageShell stage={stage}>
      <h1 className="text-xl font-semibold text-foreground">Fikrinizi Revize Edin</h1>

      <section className="mt-6 rounded border border-border bg-white p-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
          İlk Fikriniz (salt okunur)
        </h2>
        <p className="mt-2 text-sm font-medium text-foreground">{initialIdea.title}</p>
        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-foreground">
          {initialIdea.description}
        </p>
      </section>

      <ReviseForm position={position} />
    </PageShell>
  );
}
