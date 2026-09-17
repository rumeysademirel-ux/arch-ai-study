import { NextRequest, NextResponse } from "next/server";
import { getExportRows } from "@/lib/admin-data";
import { toCsv } from "@/lib/csv";

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get("format") === "json" ? "json" : "csv";
  const rows = await getExportRows();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  if (format === "json") {
    return new NextResponse(JSON.stringify(rows, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="arch-ai-study-${timestamp}.json"`,
      },
    });
  }

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="arch-ai-study-${timestamp}.csv"`,
    },
  });
}
