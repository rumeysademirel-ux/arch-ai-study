import { requireStage } from "@/lib/page-guard";
import { PageShell } from "@/components/PageShell";
import { DemographicsForm } from "./DemographicsForm";

export default async function DemographicsPage() {
  await requireStage("DEMOGRAPHICS");

  return (
    <PageShell stage="DEMOGRAPHICS">
      <h1 className="text-xl font-semibold text-foreground">Demografik Bilgi Formu</h1>
      <p className="mt-2 text-sm text-muted">
        Aşağıdaki bilgiler yalnızca istatistiksel analiz amacıyla kullanılacaktır.
      </p>
      <DemographicsForm />
    </PageShell>
  );
}
