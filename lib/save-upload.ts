import crypto from "crypto";

// Kept in sync with components/SketchUpload.tsx's client-side check — that
// one is UX only (trivially bypassable via curl or devtools); this is the
// enforcement that actually matters.
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

interface FileSignature {
  ext: string;
  mime: string;
  match: (buf: Buffer) => boolean;
}

// Real file type is sniffed from the first bytes, never trusted from the
// client-supplied filename/extension — a renamed .exe or .html posing as
// "eskiz.png" is rejected regardless of what the upload form claims.
const SIGNATURES: FileSignature[] = [
  {
    ext: "png",
    mime: "image/png",
    match: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    ext: "jpg",
    mime: "image/jpeg",
    match: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: "webp",
    mime: "image/webp",
    match: (b) =>
      b.length >= 12 &&
      b.subarray(0, 4).toString("ascii") === "RIFF" &&
      b.subarray(8, 12).toString("ascii") === "WEBP",
  },
  {
    ext: "pdf",
    mime: "application/pdf",
    match: (b) => b.length >= 5 && b.subarray(0, 5).toString("ascii") === "%PDF-",
  },
];

function detectFileType(buffer: Buffer): FileSignature | null {
  return SIGNATURES.find((sig) => sig.match(buffer)) ?? null;
}

export type UploadResult =
  | { ok: true; filename: string; mime: string; data: Buffer }
  | { ok: false; error: string };

// Vercel'in serverless fonksiyonları kalıcı bir dosya sistemi sağlamıyor,
// bu yüzden dosya diske değil — çağıranın veritabanına (bytea sütunu)
// yazacağı ham bayt dizisi olarak döndürülüyor (bkz. lib/db.ts).
export async function processUpload(
  file: File,
  participantCode: string,
  tag: string
): Promise<UploadResult> {
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "Dosya boyutu 10 MB sınırını aşıyor." };
  }
  if (file.size === 0) {
    return { ok: false, error: "Dosya boş görünüyor." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectFileType(buffer);
  if (!detected) {
    return {
      ok: false,
      error: "Desteklenmeyen dosya türü. Yalnızca PNG, JPEG, WEBP veya PDF yükleyebilirsiniz.",
    };
  }

  // Dosya adı tamamen sunucu tarafında üretilir (rastgele id + tespit
  // edilen uzantı) — istemcinin gönderdiği orijinal ad hiçbir zaman
  // saklanmaz veya kullanılmaz.
  const filename = `${participantCode}-${tag}-${crypto.randomUUID()}.${detected.ext}`;
  return { ok: true, filename, mime: detected.mime, data: buffer };
}
