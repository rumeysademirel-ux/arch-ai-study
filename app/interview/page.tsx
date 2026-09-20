import { requireStage } from "@/lib/page-guard";
import { PageShell } from "@/components/PageShell";
import { InterviewForm } from "./InterviewForm";

export default async function InterviewPage() {
  await requireStage("INTERVIEW");

  return (
    <PageShell stage="INTERVIEW">
      <h1 className="text-xl font-semibold text-foreground">Çalışma Sonrası Görüşme</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        İki görevde aldığınız geri bildirim deneyimlerini karşılaştırmanızı isteyen kısa açık uçlu
        sorular yer almaktadır. Yanıtlamak istemediğiniz bir soruyu boş bırakabilirsiniz.
      </p>
      <InterviewForm />
    </PageShell>
  );
}
