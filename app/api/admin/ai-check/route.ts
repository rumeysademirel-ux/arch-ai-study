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
      keyLooksValid: Boolean(key?.startsWith("sk-ant-")),
      status: e.status ?? null,
      name: e.name ?? null,
      message: e.message ?? String(err),
      ms: Date.now() - started,
    });
  }
}
