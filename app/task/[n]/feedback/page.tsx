import { notFound } from "next/navigation";
import { requireStage } from "@/lib/page-guard";
import { PageShell } from "@/components/PageShell";
import { stageForTaskPosition } from "@/lib/stage";
import { parseTaskPosition } from "@/lib/task-assignment";
import { ensureAiFeedback } from "@/lib/ai-feedback";
import { FeedbackAck } from "./FeedbackAck";
import { FeedbackRetry } from "./FeedbackRetry";

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const position = parseTaskPosition((await params).n);
  if (!position) notFound();

  const stage = stageForTaskPosition(position, "AI_FEEDBACK");
  const code = await requireStage(stage);
  const result = await ensureAiFeedback(code, position);

  if (result.status === "error") {
    return (
      <PageShell stage={stage}>
        <h1 className="text-xl font-semibold text-foreground">Geçici Bir Sorun Oluştu</h1>
        <p className="mt-3 text-sm leading-6 text-foreground">{result.message}</p>
        <p className="mt-2 text-xs text-muted">
          Sorun devam ederse lütfen araştırmacıya bildiriniz.
        </p>
        <FeedbackRetry />
      </PageShell>
    );
  }

  return (
    <PageShell stage={stage}>
      <h1 className="text-xl font-semibold text-foreground">Yapay Zekâ Geri Bildirimi</h1>
      <div className="mt-6 whitespace-pre-line rounded border border-border bg-white p-6 text-sm leading-6 text-foreground">
        {result.text}
      </div>
      <FeedbackAck position={position} />
    </PageShell>
  );
}
