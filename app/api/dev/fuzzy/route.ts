import { NextRequest, NextResponse } from "next/server";
import { computeFuzzyOutput } from "@/lib/fuzzy";
import { strategyForOutput } from "@/config/fuzzy-config";

/**
 * TEMPORARY development-only diagnostic endpoint for Aşama 3. Lets the
 * researcher exercise the fuzzy engine with arbitrary inputs before it is
 * wired into the adaptive AI condition (Aşama 3 devamı) or exposed properly
 * in the admin panel (Aşama 5, with auth). Not linked from any participant
 * screen. Remove or gate behind admin auth before a real study deployment.
 *
 * Usage: GET /api/dev/fuzzy?mstat=3&clarity=2&guidance=6
 */
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production." }, { status: 404 });
  }

  const params = req.nextUrl.searchParams;
  const mstatScore = Number(params.get("mstat"));
  const clarity = Number(params.get("clarity"));
  const guidanceNeeded = Number(params.get("guidance"));

  for (const [name, value] of Object.entries({ mstat: mstatScore, clarity, guidance: guidanceNeeded })) {
    if (!Number.isFinite(value) || value < 1 || value > 5) {
      return NextResponse.json(
        { error: `"${name}" parametresi 1-5 aralığında bir sayı olmalıdır.` },
        { status: 400 }
      );
    }
  }

  const result = computeFuzzyOutput({ mstatScore, clarity, guidanceNeeded });

  return NextResponse.json({
    inputs: { mstatScore, clarity, guidanceNeeded },
    membershipValues: result.membershipValues,
    activatedRules: result.activatedRules,
    output: result.output,
    strategy: strategyForOutput(result.output),
  });
}
