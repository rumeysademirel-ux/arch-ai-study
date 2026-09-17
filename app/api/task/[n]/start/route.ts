import { NextResponse } from "next/server";
import { requireParticipant, handleStageMismatch, nextResponseAfter } from "@/lib/api-helpers";
import { prepare } from "@/lib/db";
import { advanceStage, assertStage, stageForTaskPosition } from "@/lib/stage";
import { parseTaskPosition, resolveTaskAssignment } from "@/lib/task-assignment";

export async function POST(req: Request, { params }: { params: Promise<{ n: string }> }) {
  const code = await requireParticipant();
  if (code instanceof NextResponse) return code;

  const position = parseTaskPosition((await params).n);
  if (!position) {
    return NextResponse.json({ error: "Geçersiz görev numarası." }, { status: 400 });
  }

  const stage = stageForTaskPosition(position, "BRIEF");
  const { task } = await resolveTaskAssignment(code, position);

  try {
    await assertStage(code, stage);
    await prepare(
      `INSERT INTO task_sessions (participant_code, task_key) VALUES (?, ?)
       ON CONFLICT (participant_code, task_key) DO NOTHING`
    ).run(code, task.taskKey);
    await advanceStage(code, stage);
    return nextResponseAfter(stage);
  } catch (err) {
    return handleStageMismatch(err) ?? NextResponse.json({ error: "Beklenmeyen hata." }, { status: 500 });
  }
}
