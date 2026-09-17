import { ProgressBar } from "./ProgressBar";
import type { Stage } from "@/lib/stage";

export function PageShell({
  stage,
  children,
}: {
  stage: Stage;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <ProgressBar stage={stage} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
