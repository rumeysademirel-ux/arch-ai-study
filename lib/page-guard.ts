import { redirect } from "next/navigation";
import { getParticipantCode } from "./session";
import { getCurrentStage, STAGE_PATH, type Stage } from "./stage";

/**
 * Server-side guard for stage pages. Redirects to login if there is no
 * session, or to the participant's actual current stage if it does not
 * match the page being rendered — this blocks both revisiting completed
 * stages and skipping ahead.
 */
export async function requireStage(expected: Stage): Promise<string> {
  const code = await getParticipantCode();
  if (!code) {
    redirect("/");
  }

  const actual = await getCurrentStage(code);
  if (!actual) {
    redirect("/");
  }

  if (actual !== expected) {
    redirect(STAGE_PATH[actual]);
  }

  return code;
}
