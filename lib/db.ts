// Bulut barındırma (Vercel) yerel diske güvenilir şekilde yazamadığı için
// (serverless fonksiyonların dosya sistemi kalıcı değildir) veri katmanı,
// önceki yerel/şifreli SQLite dosyasından Neon üzerinde barındırılan bir
// Postgres veritabanına taşındı. Neon, veriyi kendi altyapısında "at rest"
// şifreler — etik kurul onaylı Onam Formu'ndaki "şifreli veritabanı"
// taahhüdü bu şekilde karşılanır (bkz. docs/security-privacy.md).
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL tanımlı değil (.env.local / Vercel ortam değişkenleri). " +
      "Neon proje ayarlarından connection string'i kopyalayıp ekleyin."
  );
}

const sql: NeonQueryFunction<false, false> = neon(connectionString);

// better-sqlite3'ün senkron `db.prepare(sql).get/.all/.run(...)` API'sine
// benzer, ama asenkron ve Postgres `$1,$2,...` yer tutucularını kullanan
// ince bir uyumluluk katmanı. Bu sayede mevcut çağrı yerlerindeki SQL
// metinleri (hâlâ `?` ile yazılmış) değişmeden kalabiliyor; yalnızca
// `await` eklemek ve fonksiyonları `async` yapmak yeterli oluyor.
function toPgPlaceholders(query: string): string {
  let i = 0;
  return query.replace(/\?/g, () => `$${++i}`);
}

// Neon zaman damgalarını Date nesnesi olarak döndürür; React bunları doğrudan
// render edemez (admin sayfası 500 verir). Tüm Date değerleri ISO metnine çevrilir.
function normalizeRow<T>(row: T): T {
  if (row && typeof row === "object") {
    for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
      if (v instanceof Date) (row as Record<string, unknown>)[k] = v.toISOString();
    }
  }
  return row;
}

// `prepare(...)` kendi içinde şema migrasyonunun tamamlandığından emin olur;
// çağıranların ayrıca `getDb()`/migrasyon beklemesi gerekmez — tek `await`
// yeterli: `await prepare(sql).get(...)`.
export function prepare(query: string) {
  const pgQuery = toPgPlaceholders(query);
  return {
    async get<T = unknown>(...params: unknown[]): Promise<T | undefined> {
      await migrate();
      const rows = (await sql.query(pgQuery, params)) as T[];
      return rows[0] === undefined ? undefined : normalizeRow(rows[0]);
    },
    async all<T = unknown>(...params: unknown[]): Promise<T[]> {
      await migrate();
      return ((await sql.query(pgQuery, params)) as T[]).map(normalizeRow);
    },
    async run(...params: unknown[]): Promise<{ changes: number }> {
      await migrate();
      const result = (await sql.query(pgQuery, params, { fullResults: true })) as {
        rowCount: number | null;
      };
      return { changes: result.rowCount ?? 0 };
    },
  };
}

// Birden fazla yazmanın tek bir atomik birim olması gereken yerler için
// (ör. 8 MSTAT-II yanıtı + 1 puan satırı). `build`, `?` yer tutuculu SQL
// metinleri alan bir `q(...)` fonksiyonu üzerinden sorgu dizisini kurar.
export async function transaction(
  build: (q: (query: string, ...params: unknown[]) => unknown) => unknown[]
): Promise<void> {
  await migrate();
  await sql.transaction((txn) => {
    const q = (query: string, ...params: unknown[]) => txn.query(toPgPlaceholders(query), params);
    return build(q) as never[];
  });
}

let migrated: Promise<void> | null = null;

function migrate(): Promise<void> {
  if (!migrated) {
    migrated = runMigration();
  }
  return migrated;
}

// Neon'un HTTP tabanlı sürücüsü tek bir çağrıda birden fazla SQL ifadesini
// desteklemiyor; bu yüzden her tablo ayrı bir sorgu olarak, yabancı anahtar
// bağımlılık sırasına göre art arda çalıştırılıyor.
async function runMigration(): Promise<void> {
  await sql.query(`
    CREATE TABLE IF NOT EXISTS participants (
      code TEXT PRIMARY KEY,
      current_stage TEXT NOT NULL,
      assigned_group INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS demographics (
      participant_code TEXT PRIMARY KEY REFERENCES participants(code),
      age_range TEXT,
      gender TEXT,
      university TEXT,
      class_level TEXT,
      studio_count TEXT,
      ai_usage_frequency TEXT,
      ai_design_experience TEXT,
      ai_tools_used TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS mstat_responses (
      participant_code TEXT NOT NULL REFERENCES participants(code),
      item_number INTEGER NOT NULL,
      response_value INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (participant_code, item_number)
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS mstat_scores (
      participant_code TEXT PRIMARY KEY REFERENCES participants(code),
      total_score DOUBLE PRECISION NOT NULL,
      average_score DOUBLE PRECISION NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS task_sessions (
      participant_code TEXT NOT NULL REFERENCES participants(code),
      task_key TEXT NOT NULL,
      started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      ended_at TIMESTAMPTZ,
      PRIMARY KEY (participant_code, task_key)
    )
  `);

  // sketch_data: eskiz/diyagram dosyası artık yerel diske değil, doğrudan
  // veritabanına (bytea) kaydediliyor — Vercel'in serverless fonksiyonları
  // kalıcı bir dosya sistemi sağlamıyor (bkz. lib/save-upload.ts).
  await sql.query(`
    CREATE TABLE IF NOT EXISTS initial_ideas (
      participant_code TEXT NOT NULL REFERENCES participants(code),
      task_key TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      word_count INTEGER NOT NULL,
      sketch_filename TEXT,
      sketch_mime TEXT,
      sketch_data BYTEA,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (participant_code, task_key)
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS pre_assessments (
      participant_code TEXT NOT NULL REFERENCES participants(code),
      task_key TEXT NOT NULL,
      clarity INTEGER NOT NULL,
      decision_difficulty INTEGER NOT NULL,
      guidance_needed INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (participant_code, task_key)
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS ai_feedback_events (
      participant_code TEXT NOT NULL REFERENCES participants(code),
      task_key TEXT NOT NULL,
      condition TEXT NOT NULL DEFAULT 'standard',
      prompt_sent TEXT NOT NULL,
      model TEXT NOT NULL,
      feedback_text TEXT NOT NULL,
      fuzzy_inputs TEXT,
      fuzzy_membership TEXT,
      fuzzy_rules TEXT,
      fuzzy_output DOUBLE PRECISION,
      shown_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      ack_at TIMESTAMPTZ,
      reading_duration_seconds DOUBLE PRECISION,
      PRIMARY KEY (participant_code, task_key)
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS revised_ideas (
      participant_code TEXT NOT NULL REFERENCES participants(code),
      task_key TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      word_count INTEGER NOT NULL,
      sketch_filename TEXT,
      sketch_mime TEXT,
      sketch_data BYTEA,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (participant_code, task_key)
    )
  `);

  // Çalışma sonrası görüşme protokolü, madde 49-53 (config/interview-questions.ts).
  await sql.query(`
    CREATE TABLE IF NOT EXISTS interview_responses (
      participant_code TEXT NOT NULL REFERENCES participants(code),
      question_number INTEGER NOT NULL,
      answer_text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (participant_code, question_number)
    )
  `);

  // Etik kurul onaylı Onam Formu Eki madde 26-32 ile birebir eşleşir (7 madde).
  await sql.query(`
    CREATE TABLE IF NOT EXISTS post_assessments (
      participant_code TEXT NOT NULL REFERENCES participants(code),
      task_key TEXT NOT NULL,
      clarity INTEGER NOT NULL,
      decision_difficulty INTEGER NOT NULL,
      guidance_needed INTEGER NOT NULL,
      structure_level INTEGER NOT NULL,
      fit_to_need INTEGER NOT NULL,
      thinking_space INTEGER NOT NULL,
      usage_level INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (participant_code, task_key)
    )
  `);
}

