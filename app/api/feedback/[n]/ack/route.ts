import { NextRequest, NextResponse } from "next/server";
import { requireParticipant, handleStageMismatch, nextResponseAfter } from "@/lib/api-helpers";
import { prepare } from "@/lib/db";
import { advanceStage, assertStage, stageForTaskPosition } from "@/lib/stage";
import { parseTaskPosition, resolveTaskAssignment } from "@/lib/task-assignment";

export async function POST(req: NextRequest, { params }: { params: Promise<{ n: string }> }) {
  const code = await requireParticipant();
  if (code instanceof NextResponse) return code;

  const position = parseTaskPosition((await params).n);
  if (!position) {
    return NextResponse.json({ error: "Geçersiz görev numarası." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const readingDurationSeconds =
    typeof body?.readingDurationSeconds === "number" ? body.readingDurationSeconds : null;

  const stage = stageForTaskPosition(position, "AI_FEEDBACK");
  const { task } = await resolveTaskAssignment(code, position);

  try {
    await assertStage(code, stage);
    await prepare(
      `UPDATE ai_feedback_events
       SET ack_at = now(), reading_duration_seconds = ?
       WHERE participant_code = ? AND task_key = ?`
    ).run(readingDurationSeconds, code, task.taskKey);

    await advanceStage(code, stage);
    return nextResponseAfter(stage);
  } catch (err) {
    return handleStageMismatch(err) ?? NextResponse.json({ error: "Beklenmeyen hata." }, { status: 500 });
  }
}
