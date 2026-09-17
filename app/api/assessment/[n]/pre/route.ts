import { NextRequest, NextResponse } from "next/server";
import { requireParticipant, handleStageMismatch, nextResponseAfter } from "@/lib/api-helpers";
import { prepare } from "@/lib/db";
import { advanceStage, assertStage, stageForTaskPosition } from "@/lib/stage";
import { parseTaskPosition, resolveTaskAssignment } from "@/lib/task-assignment";
import { preAssessmentQuestions, scaleMin, scaleMax } from "@/config/process-questions";

export async function POST(req: NextRequest, { params }: { params: Promise<{ n: string }> }) {
  const code = await requireParticipant();
  if (code instanceof NextResponse) return code;

  const position = parseTaskPosition((await params).n);
  if (!position) {
    return NextResponse.json({ error: "Geçersiz görev numarası." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const answers: Record<string, number> = body?.answers ?? {};

  for (const q of preAssessmentQuestions) {
    const v = answers[q.key];
    if (typeof v !== "number" || v < scaleMin || v > scaleMax) {
      return NextResponse.json(
        { error: "Lütfen tüm ölçek maddelerini yanıtlayınız." },
        { status: 400 }
      );
    }
  }

  const stage = stageForTaskPosition(position, "PRE_ASSESSMENT");
  const { task } = await resolveTaskAssignment(code, position);

  try {
    await assertStage(code, stage);
    await prepare(
      `INSERT INTO pre_assessments
        (participant_code, task_key, clarity, decision_difficulty, guidance_needed)
       VALUES (?, ?, ?, ?, ?)`
    ).run(
      code,
      task.taskKey,
      answers.clarity,
      answers.decisionDifficulty,
      answers.guidanceNeeded
    );

    // AI feedback is generated lazily when the AI_FEEDBACK page loads
    // (lib/ai-feedback.ts) so a slow/failed AI call never blocks saving
    // the participant's process assessment.
    await advanceStage(code, stage);
    return nextResponseAfter(stage);
  } catch (err) {
    return handleStageMismatch(err) ?? NextResponse.json({ error: "Beklenmeyen hata." }, { status: 500 });
  }
}
