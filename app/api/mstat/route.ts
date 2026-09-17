import { NextRequest, NextResponse } from "next/server";
import { requireParticipant, handleStageMismatch, nextResponseAfter } from "@/lib/api-helpers";
import { transaction } from "@/lib/db";
import { advanceStage, assertStage } from "@/lib/stage";
import { mstatItems, mstatScaleMin, mstatScaleMax } from "@/config/mstat-items";
import { scoreMstat } from "@/lib/mstat-scoring";

export async function POST(req: NextRequest) {
  const code = await requireParticipant();
  if (code instanceof NextResponse) return code;

  const body = await req.json().catch(() => null);
  const responses: Record<number, number> = body?.responses ?? {};

  for (const item of mstatItems) {
    const value = responses[item.itemNumber];
    if (typeof value !== "number" || value < mstatScaleMin || value > mstatScaleMax) {
      return NextResponse.json(
        { error: "Lütfen tüm maddeleri yanıtlayınız." },
        { status: 400 }
      );
    }
  }

  try {
    await assertStage(code, "MSTAT");
    const { totalScore, averageScore } = scoreMstat(responses);
    await transaction((q) => [
      ...mstatItems.map((item) =>
        q(
          `INSERT INTO mstat_responses (participant_code, item_number, response_value) VALUES (?, ?, ?)`,
          code,
          item.itemNumber,
          responses[item.itemNumber]
        )
      ),
      q(
        `INSERT INTO mstat_scores (participant_code, total_score, average_score) VALUES (?, ?, ?)`,
        code,
        totalScore,
        averageScore
      ),
    ]);

    await advanceStage(code, "MSTAT");
    return nextResponseAfter("MSTAT");
  } catch (err) {
    return handleStageMismatch(err) ?? NextResponse.json({ error: "Beklenmeyen hata." }, { status: 500 });
  }
}
