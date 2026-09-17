import { NextRequest, NextResponse } from "next/server";
import { requireParticipant, handleStageMismatch, nextResponseAfter } from "@/lib/api-helpers";
import { prepare } from "@/lib/db";
import { advanceStage, assertStage, stageForTaskPosition } from "@/lib/stage";
import { parseTaskPosition, resolveTaskAssignment } from "@/lib/task-assignment";
import { countWords } from "@/lib/word-count";
import { processUpload } from "@/lib/save-upload";

export async function POST(req: NextRequest, { params }: { params: Promise<{ n: string }> }) {
  const code = await requireParticipant();
  if (code instanceof NextResponse) return code;

  const position = parseTaskPosition((await params).n);
  if (!position) {
    return NextResponse.json({ error: "Geçersiz görev numarası." }, { status: 400 });
  }

  const form = await req.formData().catch(() => null);
  const title = String(form?.get("title") ?? "").trim();
  const description = String(form?.get("description") ?? "").trim();
  const sketch = form?.get("sketch");

  if (!title || !description) {
    return NextResponse.json(
      { error: "Fikir başlığı ve açıklaması zorunludur." },
      { status: 400 }
    );
  }

  const stage = stageForTaskPosition(position, "INITIAL_IDEA");
  const { task } = await resolveTaskAssignment(code, position);

  try {
    await assertStage(code, stage);

    let sketchFilename: string | null = null;
    let sketchMime: string | null = null;
    let sketchData: Buffer | null = null;
    if (sketch instanceof File && sketch.size > 0) {
      const upload = await processUpload(sketch, code, `initial-${position}`);
      if (!upload.ok) {
        return NextResponse.json({ error: upload.error }, { status: 400 });
      }
      sketchFilename = upload.filename;
      sketchMime = upload.mime;
      sketchData = upload.data;
    }

    await prepare(
      `INSERT INTO initial_ideas
        (participant_code, task_key, title, description, word_count, sketch_filename, sketch_mime, sketch_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      code,
      task.taskKey,
      title,
      description,
      countWords(description),
      sketchFilename,
      sketchMime,
      sketchData
    );

    await advanceStage(code, stage);
    return nextResponseAfter(stage);
  } catch (err) {
    return handleStageMismatch(err) ?? NextResponse.json({ error: "Beklenmeyen hata." }, { status: 500 });
  }
}
