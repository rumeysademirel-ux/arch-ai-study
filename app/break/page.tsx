import { requireStage } from "@/lib/page-guard";
import { PageShell } from "@/components/PageShell";
import { BreakContinueButton } from "./BreakContinueButton";

export default async function BreakPage() {
  await requireStage("BREAK");

  return (
    <PageShell stage="BREAK">
      <h1 className="text-xl font-semibold text-foreground">Kısa Mola</h1>
      <p className="mt-3 text-sm leading-6 text-foreground">
        İlk göreviniz tamamlandı. Devam etmeden önce birkaç dakika mola verebilirsiniz.
        Hazır olduğunuzda ikinci göreve geçebilirsiniz.
      </p>
      <BreakContinueButton />
    </PageShell>
  );
}
