import { NextRequest, NextResponse } from "next/server";
import { clearParticipantCode } from "@/lib/session";

// Yalnızca "Tamamlandı" (COMPLETE) ekranından erişilir — bir sonraki
// katılımcının aynı cihazda kendi kodunu girebilmesi için oturum çerezini
// temizler. Tamamlanmamış bir katılımcının verisini silmez, yalnızca
// bu tarayıcı oturumunu ilgili koddan ayırır.
export async function GET(req: NextRequest) {
  await clearParticipantCode();
  return NextResponse.redirect(new URL("/", req.url));
}
