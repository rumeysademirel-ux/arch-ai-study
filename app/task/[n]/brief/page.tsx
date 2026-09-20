import { notFound } from "next/navigation";
import { requireStage } from "@/lib/page-guard";
import { PageShell } from "@/components/PageShell";
import { stageForTaskPosition } from "@/lib/stage";
import { parseTaskPosition, resolveTaskAssignment } from "@/lib/task-assignment";
import { TaskBriefCard } from "@/components/TaskBriefCard";
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
      <TaskBriefCard task={task} />

      <StartTaskButton position={position} durationMinutes={task.durationMinutes} />
    </PageShell>
  );
}
