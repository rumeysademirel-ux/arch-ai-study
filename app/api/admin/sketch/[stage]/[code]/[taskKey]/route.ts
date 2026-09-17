import { NextRequest, NextResponse } from "next/server";
import { prepare } from "@/lib/db";

// Eskiz/diyagram dosyaları artık yerel diske değil, veritabanına (bytea)
// kaydediliyor (bkz. lib/save-upload.ts) — bu uç nokta, /admin panelindeki
// araştırmacının o dosyayı doğrudan tarayıcıda görüntüleyip indirmesini
// sağlar. middleware.ts içindeki "/api/admin/:path*" eşleşmesiyle Basic
// Auth'a tabidir; katılımcı ekranlarından hiçbir bağlantısı yoktur.
const TABLE_BY_STAGE: Record<string, string> = {
  initial: "initial_ideas",
  revised: "revised_ideas",
};

// bkz. app/admin/page.tsx — katılımcıya göre değişen ikili veri, önbelleğe alınmamalı.
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ stage: string; code: string; taskKey: string }> }
) {
  const { stage, code, taskKey } = await params;
  const table = TABLE_BY_STAGE[stage];
  if (!table) {
    return NextResponse.json({ error: "Geçersiz aşama." }, { status: 400 });
  }

  const row = (await prepare(
    `SELECT sketch_filename, sketch_mime, sketch_data FROM ${table}
     WHERE participant_code = ? AND task_key = ?`
  ).get(code, taskKey)) as
    | { sketch_filename: string | null; sketch_mime: string | null; sketch_data: Buffer | null }
    | undefined;

  if (!row?.sketch_data) {
    return NextResponse.json({ error: "Eskiz bulunamadı." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(row.sketch_data), {
    headers: {
      "Content-Type": row.sketch_mime ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${row.sketch_filename ?? "eskiz"}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
