import { redirect } from "next/navigation";
import { getParticipantCode } from "@/lib/session";
import { getCurrentStage, STAGE_PATH } from "@/lib/stage";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const code = await getParticipantCode();
  if (code) {
    const stage = await getCurrentStage(code);
    if (stage) {
      redirect(STAGE_PATH[stage]);
    }
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-6">
      <h1 className="text-xl font-semibold text-foreground">Araştırmaya Hoş Geldiniz</h1>
      <p className="mt-2 text-sm text-muted">
        Devam etmek için size verilen anonim katılımcı kodunu giriniz.
      </p>
      <LoginForm />
    </main>
  );
}
