import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { generateFeedback, AI_MODEL_ID } from "@/lib/ai-client";

export const dynamic = "force-dynamic";

// Araştırmacı için yapay zekâ bağlantı testi (Basic Auth altında,
// middleware.ts "/api/admin/:path*"). Anahtarın kendisini asla döndürmez.
export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;
  const started = Date.now();
  try {
    await generateFeedback("Kısa bir cümleyle yanıt ver.", "Merhaba de.");
    return NextResponse.json({ ok: true, model: AI_MODEL_ID, ms: Date.now() - started });
  } catch (err) {
    const e = err as { status?: number; message?: string; name?: string };
    return NextResponse.json({
      ok: false,
      keyPresent: Boolean(key),
      keyLength: key?.length ?? 0,
      keyNonAsciiAt: key ? [...key].map((c, i) => (c.charCodeAt(0) > 126 || c.charCodeAt(0) < 33 ? i : -1)).filter((i) => i >= 0) : [],
      keySha8: key ? createHash("sha256").update(key).digest("hex").slice(0, 8) : null,
      otherAnthropicEnv: Object.keys(process.env).filter((k) => k.startsWith("ANTHROPIC_") && k !== "ANTHROPIC_API_KEY"),
      keyLooksValid: Boolean(key?.startsWith("sk-ant-")),
      status: e.status ?? null,
      name: e.name ?? null,
      message: e.message ?? String(err),
      ms: Date.now() - started,
    });
  }
}
