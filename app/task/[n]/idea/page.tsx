import { notFound } from "next/navigation";
import { requireStage } from "@/lib/page-guard";
import { PageShell, ReferenceLayout } from "@/components/PageShell";
import { TaskBriefCard } from "@/components/TaskBriefCard";
import { stageForTaskPosition } from "@/lib/stage";
import { parseTaskPosition, resolveTaskAssignment } from "@/lib/task-assignment";
import { IdeaForm } from "./IdeaForm";

export default async function InitialIdeaPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const position = parseTaskPosition((await params).n);
  if (!position) notFound();

  const stage = stageForTaskPosition(position, "INITIAL_IDEA");
  const code = await requireStage(stage);
  const { task } = await resolveTaskAssignment(code, position);

  return (
    <PageShell stage={stage} wide>
      <ReferenceLayout reference={<TaskBriefCard task={task} compact />}>
        <h1 className="text-xl font-semibold text-foreground">İlk Kavramsal Fikriniz</h1>
        <p className="mt-2 text-sm text-muted">
          Fikrinizi kaydettikten sonra bu metni değiştiremezsiniz; revizyon bir sonraki
          aşamada ayrı bir alanda yapılacaktır.
        </p>
        <IdeaForm position={position} durationMinutes={task.durationMinutes} />
      </ReferenceLayout>
    </PageShell>
  );
}
