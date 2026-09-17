import { requireStage } from "@/lib/page-guard";
import { PageShell } from "@/components/PageShell";
import { MstatForm } from "./MstatForm";

export default async function MstatPage() {
  await requireStage("MSTAT");

  return (
    <PageShell stage="MSTAT">
      <h1 className="text-xl font-semibold text-foreground">Belirsizlik Toleransı Ölçeği</h1>
      <p className="mt-2 text-sm text-muted">
        Aşağıdaki ifadelere ne ölçüde katıldığınızı belirtiniz.
      </p>
      <MstatForm />
    </PageShell>
  );
}
