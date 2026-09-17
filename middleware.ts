import { NextRequest, NextResponse } from "next/server";

// Guards the researcher panel (/admin) and its API (/api/admin) with plain
// HTTP Basic Auth. Deliberately simple for a small-scale research tool —
// no session table, no login page, the browser handles the credential
// prompt and caches it for the origin. Credentials come from environment
// variables only (never hardcoded); see .env.local.example.
//
// Hardening on top of bare Basic Auth (Aşama 8):
//   - constant-time credential comparison (no timing side-channel)
//   - a simple in-memory lockout after repeated failed attempts
//   - defensive headers + noindex on every response this middleware returns
//
// Scope note: HTTP Basic Auth sends credentials base64-encoded, not
// encrypted — this is only safe when the deployment sits behind HTTPS.
// Do not expose this panel over plain HTTP outside local development.

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000; // failures older than this don't count toward the limit
const LOCKOUT_MS = 5 * 60 * 1000; // how long a client is locked out after hitting the limit

interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

// Module-level state persists for the lifetime of the server process — fine
// for a single-instance local/small-scale deployment (resets on restart).
// It is not a substitute for infrastructure-level rate limiting if this is
// ever deployed across multiple instances or at real scale.
const attempts = new Map<string, AttemptRecord>();

function clientKey(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

function isLockedOut(key: string): number | null {
  const record = attempts.get(key);
  if (!record?.lockedUntil) return null;
  if (Date.now() > record.lockedUntil) {
    attempts.delete(key);
    return null;
  }
  return record.lockedUntil;
}

function recordFailure(key: string): void {
  const now = Date.now();
  const record = attempts.get(key);
  if (!record || now - record.firstAttemptAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: now, lockedUntil: null });
    return;
  }
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }
}

function recordSuccess(key: string): void {
  attempts.delete(key);
}

/** Constant-time comparison via fixed-length digests — avoids leaking password length or a matching prefix through response timing. */
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [digestA, digestB] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  const bytesA = new Uint8Array(digestA);
  const bytesB = new Uint8Array(digestB);
  let mismatch = 0;
  for (let i = 0; i < bytesA.length; i++) {
    mismatch |= bytesA[i] ^ bytesB[i];
  }
  return mismatch === 0;
}

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "no-referrer");
  // Keeps the panel out of search engines / crawlers if ever reachable publicly.
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export async function middleware(request: NextRequest) {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass) {
    return withSecurityHeaders(
      new NextResponse(
        "Araştırmacı paneli yapılandırılmamış. .env.local dosyasına ADMIN_USERNAME ve " +
          "ADMIN_PASSWORD ekleyin (bkz. .env.local.example).",
        { status: 500 }
      )
    );
  }

  const key = clientKey(request);
  const lockedUntil = isLockedOut(key);
  if (lockedUntil) {
    return withSecurityHeaders(
      new NextResponse("Çok fazla başarısız deneme. Lütfen birkaç dakika sonra tekrar deneyin.", {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((lockedUntil - Date.now()) / 1000)) },
      })
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = atob(authHeader.slice("Basic ".length));
    const separatorIndex = decoded.indexOf(":");
    const user = decoded.slice(0, separatorIndex);
    const pass = decoded.slice(separatorIndex + 1);

    const valid = await timingSafeEqual(`${user}:${pass}`, `${expectedUser}:${expectedPass}`);
    if (valid) {
      recordSuccess(key);
      return withSecurityHeaders(NextResponse.next());
    }
  }

  recordFailure(key);

  // HTTP header values must be Latin-1/ASCII-safe — the realm string can't
  // carry Turkish characters (ş, ı, ç, ğ, ö, ü), unlike the response body.
  return withSecurityHeaders(
    new NextResponse("Yetkilendirme gerekli.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Arastirmaci Paneli"' },
    })
  );
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
