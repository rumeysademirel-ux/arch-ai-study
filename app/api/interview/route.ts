import { NextRequest, NextResponse } from "next/server";
import { requireParticipant, handleStageMismatch, nextResponseAfter } from "@/lib/api-helpers";
import { transaction } from "@/lib/db";
import { advanceStage, assertStage } from "@/lib/stage";
import { interviewQuestions, INTERVIEW_ANSWER_MAX_CHARS } from "@/config/interview-questions";

export async function POST(req: NextRequest) {
  const code = await requireParticipant();
  if (code instanceof NextResponse) return code;

  const body = await req.json().catch(() => null);
  const raw: Record<string, unknown> = body?.answers ?? {};

  // Yanıtlamama hakkı (onam formu): boş bırakılan sorular için satır yazılmaz.
  const answered = interviewQuestions
    .map((q) => ({ number: q.number, text: String(raw[q.number] ?? "").trim() }))
    .filter((a) => a.text.length > 0);

  if (answered.some((a) => a.text.length > INTERVIEW_ANSWER_MAX_CHARS)) {
    return NextResponse.json(
      { error: `Her yanıt en fazla ${INTERVIEW_ANSWER_MAX_CHARS} karakter olabilir.` },
      { status: 400 }
    );
  }

  try {
    await assertStage(code, "INTERVIEW");
    if (answered.length > 0) {
      await transaction((q) =>
        answered.map((a) =>
          q(
            `INSERT INTO interview_responses (participant_code, question_number, answer_text)
             VALUES (?, ?, ?)`,
            code,
            a.number,
            a.text
          )
        )
      );
    }
    await advanceStage(code, "INTERVIEW");
    return nextResponseAfter("INTERVIEW");
  } catch (err) {
    return handleStageMismatch(err) ?? NextResponse.json({ error: "Beklenmeyen hata." }, { status: 500 });
  }
}
