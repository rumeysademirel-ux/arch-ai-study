import { NextResponse } from "next/server";
import { requireParticipant, handleStageMismatch, nextResponseAfter } from "@/lib/api-helpers";
import { advanceStage, assertStage } from "@/lib/stage";

export async function POST() {
  const code = await requireParticipant();
  if (code instanceof NextResponse) return code;

  try {
    await assertStage(code, "TASK_INTRO");
    await advanceStage(code, "TASK_INTRO");
    return nextResponseAfter("TASK_INTRO");
  } catch (err) {
    return handleStageMismatch(err) ?? NextResponse.json({ error: "Beklenmeyen hata." }, { status: 500 });
  }
}
