import { NextResponse } from "next/server";
import { getParticipantCode } from "./session";
import { StageMismatchError, STAGE_PATH, nextStage, type Stage } from "./stage";

export async function requireParticipant(): Promise<string | NextResponse> {
  const code = await getParticipantCode();
  if (!code) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }
  return code;
}

export function handleStageMismatch(err: unknown): NextResponse | null {
  if (err instanceof StageMismatchError) {
    return NextResponse.json(
      {
        error: "Bu aşama zaten tamamlanmış veya sıradışı bir durum tespit edildi.",
        next: err.actual ? STAGE_PATH[err.actual] : "/",
      },
      { status: 409 }
    );
  }
  return null;
}

export function nextResponse(target: Stage) {
  return NextResponse.json({ next: STAGE_PATH[target] });
}

/** Convenience for the common case: advance from `from` and respond with the resulting path. */
export function nextResponseAfter(from: Stage) {
  return nextResponse(nextStage(from));
}
