import { notFound } from "next/navigation";
import { requireStage } from "@/lib/page-guard";
import { PageShell } from "@/components/PageShell";
import { stageForTaskPosition } from "@/lib/stage";
import { parseTaskPosition } from "@/lib/task-assignment";
import { PreAssessmentForm } from "./PreAssessmentForm";

export default async function PreAssessmentPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const position = parseTaskPosition((await params).n);
  if (!position) notFound();

  const stage = stageForTaskPosition(position, "PRE_ASSESSMENT");
  await requireStage(stage);

  return (
    <PageShell stage={stage}>
      <h1 className="text-xl font-semibold text-foreground">Süreç Değerlendirmesi</h1>
      <p className="mt-2 text-sm text-muted">
        Şu anki tasarım sürecinizle ilgili aşağıdaki ifadeleri değerlendiriniz.
      </p>
      <PreAssessmentForm position={position} />
    </PageShell>
  );
}
