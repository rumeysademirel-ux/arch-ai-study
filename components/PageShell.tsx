import { ProgressBar } from "./ProgressBar";
import type { Stage } from "@/lib/stage";

export function PageShell({
  stage,
  wide = false,
  children,
}: {
  stage: Stage;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <ProgressBar stage={stage} />
      <main
        className={`mx-auto w-full flex-1 px-6 py-10 ${wide ? "max-w-6xl" : "max-w-2xl"}`}
      >
        {children}
      </main>
    </div>
  );
}

// Yazma ekranlarında referans metnin (görev tanımı, yapay zekâ geri bildirimi)
// yazı alanının yanında kalması için iki sütunlu yerleşim: geniş ekranda
// referans solda ve sabit (sticky), dar ekranda formun üstünde.
export function ReferenceLayout({
  reference,
  children,
}: {
  reference: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <aside className="space-y-4 lg:col-span-2 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
        {reference}
      </aside>
      <div className="lg:col-span-3">{children}</div>
    </div>
  );
}
