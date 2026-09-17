import { NextRequest, NextResponse } from "next/server";
import { requireParticipant, handleStageMismatch, nextResponse } from "@/lib/api-helpers";
import { prepare } from "@/lib/db";
import { advanceStage, assertStage } from "@/lib/stage";
import { demographicFields } from "@/config/demographics-fields";

export async function POST(req: NextRequest) {
  const code = await requireParticipant();
  if (code instanceof NextResponse) return code;

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Geçersiz form verisi." }, { status: 400 });
  }

  for (const field of demographicFields) {
    if (field.required && !String(body[field.key] ?? "").trim()) {
      return NextResponse.json(
        { error: `"${field.label}" alanı zorunludur.` },
        { status: 400 }
      );
    }
  }

  try {
    await assertStage(code, "DEMOGRAPHICS");
    await prepare(
      `INSERT INTO demographics
        (participant_code, age_range, gender, university, class_level,
         studio_count, ai_usage_frequency, ai_design_experience, ai_tools_used)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      code,
      body.ageRange ?? null,
      body.gender ?? null,
      body.university ?? null,
      body.classLevel ?? null,
      body.studioCount ?? null,
      body.aiUsageFrequency ?? null,
      body.aiDesignExperience ?? null,
      body.aiToolsUsed ?? null
    );
    await advanceStage(code, "DEMOGRAPHICS");
    return nextResponse("MSTAT");
  } catch (err) {
    return handleStageMismatch(err) ?? NextResponse.json({ error: "Beklenmeyen hata." }, { status: 500 });
  }
}
