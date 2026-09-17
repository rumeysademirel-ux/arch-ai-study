import { cookies } from "next/headers";

const COOKIE_NAME = "participant_code";

export async function getParticipantCode(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function setParticipantCode(code: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, code, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // Anonymous participant code only — no personal data. Persists for the study session.
    maxAge: 60 * 60 * 24 * 3,
  });
}

export async function clearParticipantCode(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
