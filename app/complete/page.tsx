import { requireStage } from "@/lib/page-guard";

export default async function CompletePage() {
  await requireStage("COMPLETE");

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
      <h1 className="text-xl font-semibold text-foreground">Teşekkür Ederiz</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Çalışmayı tamamladınız. Katkınız için teşekkür ederiz. Lütfen araştırmacıya
        haber veriniz.
      </p>
      <a
        href="/api/logout"
        className="mt-8 rounded border border-border bg-white px-4 py-2 text-sm text-foreground hover:border-accent"
      >
        Sonraki Katılımcı İçin Devam Et
      </a>
    </main>
  );
}
