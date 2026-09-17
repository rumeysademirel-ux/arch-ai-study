import { NextRequest, NextResponse } from "next/server";
import { setParticipantCode } from "@/lib/session";
import { createParticipant, getCurrentStage, STAGE_PATH } from "@/lib/stage";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!code || code.length < 3 || code.length > 32) {
    return NextResponse.json(
      { error: "Katılımcı kodu 3-32 karakter arasında olmalıdır." },
      { status: 400 }
    );
  }

  await createParticipant(code);
  await setParticipantCode(code);

  const stage = (await getCurrentStage(code))!;
  return NextResponse.json({ next: STAGE_PATH[stage] });
}
