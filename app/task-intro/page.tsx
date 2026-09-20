import { requireStage } from "@/lib/page-guard";
import { PageShell } from "@/components/PageShell";
import { StageContinueButton } from "@/components/StageContinueButton";
import { taskIntro } from "@/config/task-intro-text";

export default async function TaskIntroPage() {
  await requireStage("TASK_INTRO");

  return (
    <PageShell stage="TASK_INTRO">
      <h1 className="text-xl font-semibold text-foreground">{taskIntro.title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-6 text-foreground">
        {taskIntro.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <StageContinueButton endpoint="/api/task-intro/continue" label={taskIntro.continueLabel} />
    </PageShell>
  );
}
