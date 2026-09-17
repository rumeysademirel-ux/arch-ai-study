// PLANLANAN AŞAMA 3 — sadece sayısal çıktı. Bu modül henüz AI prompt
// oluşturmaya bağlı DEĞİLDİR (bkz. docs/fuzzy-system.md). Üyelik fonksiyonu
// sınırları ve kural tablosu araştırmacı tarafından buradan değiştirilebilir.

export type FuzzyLevel = "low" | "medium" | "high";

/** Trapezoid membership function; a triangular set is (a, b, b, d) or (a, c, c, d). */
export interface TrapezoidShape {
  a: number;
  b: number;
  c: number;
  d: number;
}

export interface InputMembershipSets {
  low: TrapezoidShape;
  medium: TrapezoidShape;
  high: TrapezoidShape;
}

// Girdi ölçekleri 1–5 (MSTAT-II ortalama puanı ve süreç değerlendirmesi
// maddeleri, etik kurul onaylı ölçek formlarıyla aynı 5'li Likert aralığında —
// bkz. config/mstat-items.ts, config/process-questions.ts).
const inputSets: InputMembershipSets = {
  low: { a: 1, b: 1, c: 1.7, d: 3 },
  medium: { a: 1.7, b: 3, c: 3, d: 4.3 },
  high: { a: 3, b: 4.3, c: 5, d: 5 },
};

export const mstatMembership: InputMembershipSets = inputSets;
export const clarityMembership: InputMembershipSets = inputSets;
export const guidanceMembership: InputMembershipSets = inputSets;

// Çıktı ölçeği 0–100 (geri bildirimin yapılandırma düzeyi).
export const outputMembership: InputMembershipSets = {
  low: { a: 0, b: 0, c: 20, d: 45 },
  medium: { a: 25, b: 50, c: 50, d: 75 },
  high: { a: 55, b: 80, c: 100, d: 100 },
};

export interface FuzzyRule {
  mstat: FuzzyLevel;
  clarity: FuzzyLevel;
  guidance: FuzzyLevel;
  output: FuzzyLevel;
}

// 27 kural (3 girdi × 3 üyelik kümesi). Her kuralın sonucu (output), MSTAT-II
// ve yön netliği düşük olduğunda ve istenen destek düzeyi yüksek olduğunda
// daha yapılandırılmış geri bildirime doğru kayar. Araştırmacı, bilimsel
// gerekçeye göre herhangi bir satırın `output` değerini değiştirebilir.
export const fuzzyRules: FuzzyRule[] = [
  { mstat: "low", clarity: "low", guidance: "low", output: "medium" },
  { mstat: "low", clarity: "low", guidance: "medium", output: "high" },
  { mstat: "low", clarity: "low", guidance: "high", output: "high" },
  { mstat: "low", clarity: "medium", guidance: "low", output: "medium" },
  { mstat: "low", clarity: "medium", guidance: "medium", output: "medium" },
  { mstat: "low", clarity: "medium", guidance: "high", output: "high" },
  { mstat: "low", clarity: "high", guidance: "low", output: "low" },
  { mstat: "low", clarity: "high", guidance: "medium", output: "medium" },
  { mstat: "low", clarity: "high", guidance: "high", output: "medium" },
  { mstat: "medium", clarity: "low", guidance: "low", output: "medium" },
  { mstat: "medium", clarity: "low", guidance: "medium", output: "medium" },
  { mstat: "medium", clarity: "low", guidance: "high", output: "high" },
  { mstat: "medium", clarity: "medium", guidance: "low", output: "low" },
  { mstat: "medium", clarity: "medium", guidance: "medium", output: "medium" },
  { mstat: "medium", clarity: "medium", guidance: "high", output: "medium" },
  { mstat: "medium", clarity: "high", guidance: "low", output: "low" },
  { mstat: "medium", clarity: "high", guidance: "medium", output: "low" },
  { mstat: "medium", clarity: "high", guidance: "high", output: "medium" },
  { mstat: "high", clarity: "low", guidance: "low", output: "low" },
  { mstat: "high", clarity: "low", guidance: "medium", output: "medium" },
  { mstat: "high", clarity: "low", guidance: "high", output: "medium" },
  { mstat: "high", clarity: "medium", guidance: "low", output: "low" },
  { mstat: "high", clarity: "medium", guidance: "medium", output: "low" },
  { mstat: "high", clarity: "medium", guidance: "high", output: "medium" },
  { mstat: "high", clarity: "high", guidance: "low", output: "low" },
  { mstat: "high", clarity: "high", guidance: "medium", output: "low" },
  { mstat: "high", clarity: "high", guidance: "high", output: "low" },
];

// 0–100 çıktının geri bildirim stratejisine dönüştürülmesi (henüz kullanılmıyor
// — Aşama 3 kapsamı yalnızca sayısal çıktı üretmektir).
export const strategyThresholds = {
  openEndedMax: 33,
  moderateMax: 66,
};

export type FeedbackStrategy = "open-ended" | "moderate" | "highly-structured";

export function strategyForOutput(output: number): FeedbackStrategy {
  if (output <= strategyThresholds.openEndedMax) return "open-ended";
  if (output <= strategyThresholds.moderateMax) return "moderate";
  return "highly-structured";
}
