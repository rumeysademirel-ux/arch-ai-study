import { NextRequest, NextResponse } from "next/server";
import { requireParticipant, handleStageMismatch, nextResponseAfter } from "@/lib/api-helpers";
import { prepare } from "@/lib/db";
import { advanceStage, assertStage, stageForTaskPosition } from "@/lib/stage";
import { parseTaskPosition, resolveTaskAssignment } from "@/lib/task-assignment";
import { postAssessmentQuestions, scaleMin, scaleMax } from "@/config/process-questions";

export async function POST(req: NextRequest, { params }: { params: Promise<{ n: string }> }) {
  const code = await requireParticipant();
  if (code instanceof NextResponse) return code;

  const position = parseTaskPosition((await params).n);
  if (!position) {
    return NextResponse.json({ error: "Geçersiz görev numarası." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const answers: Record<string, number> = body?.answers ?? {};

  for (const q of postAssessmentQuestions) {
    const v = answers[q.key];
    if (typeof v !== "number" || v < scaleMin || v > scaleMax) {
      return NextResponse.json(
        { error: "Lütfen tüm ölçek maddelerini yanıtlayınız." },
        { status: 400 }
      );
    }
  }

  const stage = stageForTaskPosition(position, "POST_ASSESSMENT");
  const { task } = await resolveTaskAssignment(code, position);

  try {
    await assertStage(code, stage);
    await prepare(
      `INSERT INTO post_assessments
        (participant_code, task_key, clarity, decision_difficulty, guidance_needed,
         structure_level, fit_to_need, thinking_space, usage_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      code,
      task.taskKey,
      answers.clarity,
      answers.decisionDifficulty,
      answers.guidanceNeeded,
      answers.structureLevel,
      answers.fitToNeed,
      answers.thinkingSpace,
      answers.usageLevel
    );

    await advanceStage(code, stage);
    return nextResponseAfter(stage);
  } catch (err) {
    return handleStageMismatch(err) ?? NextResponse.json({ error: "Beklenmeyen hata." }, { status: 500 });
  }
}
