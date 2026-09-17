import { NextRequest, NextResponse } from "next/server";
import { prepare } from "@/lib/db";
import { isValidGroup } from "@/config/counterbalancing";

/**
 * TEMPORARY development-only endpoint. Real group assignment happens
 * automatically at signup (round-robin, lib/stage.ts → createParticipant).
 * This lets a researcher force a test participant's assigned_group (1-4)
 * to exercise every counterbalancing sequence through the real UI without
 * creating 4+ throwaway accounts and hoping round-robin lands on the right
 * one. Not linked from any participant screen.
 *
 * Usage: POST /api/dev/group  { "code": "TESTCODE", "group": 3 }
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const group = Number(body?.group);

  if (!code || !isValidGroup(group)) {
    return NextResponse.json(
      { error: "Geçerli bir 'code' ve group (1-4) gerekli." },
      { status: 400 }
    );
  }

  const result = await prepare(`UPDATE participants SET assigned_group = ? WHERE code = ?`).run(
    group,
    code
  );

  if (result.changes === 0) {
    return NextResponse.json({ error: "Katılımcı bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, code, group });
}
