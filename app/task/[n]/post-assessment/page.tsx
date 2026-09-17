import { notFound } from "next/navigation";
import { requireStage } from "@/lib/page-guard";
import { PageShell } from "@/components/PageShell";
import { stageForTaskPosition } from "@/lib/stage";
import { parseTaskPosition } from "@/lib/task-assignment";
import { PostAssessmentForm } from "./PostAssessmentForm";

export default async function PostAssessmentPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const position = parseTaskPosition((await params).n);
  if (!position) notFound();

  const stage = stageForTaskPosition(position, "POST_ASSESSMENT");
  await requireStage(stage);

  return (
    <PageShell stage={stage}>
      <h1 className="text-xl font-semibold text-foreground">Geri Bildirim Sonrası Değerlendirme</h1>
      <p className="mt-2 text-sm text-muted">
        Aldığınız geri bildirim ve revizyon süreciyle ilgili aşağıdaki ifadeleri değerlendiriniz.
      </p>
      <PostAssessmentForm position={position} />
    </PageShell>
  );
}
