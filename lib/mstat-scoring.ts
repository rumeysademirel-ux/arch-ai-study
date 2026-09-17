import { mstatItems, mstatScaleMax } from "@/config/mstat-items";

// Sum/mean of raw responses, reversing items flagged reverseScored in
// config/mstat-items.ts (reverse = scaleMax + 1 - raw, standard Likert
// reverse-scoring). Ölçek 5'li Likert (bkz. config/mstat-items.ts).
export function scoreMstat(responses: Record<number, number>, scaleMax = mstatScaleMax): {
  totalScore: number;
  averageScore: number;
} {
  let total = 0;
  let count = 0;
  for (const item of mstatItems) {
    const raw = responses[item.itemNumber];
    if (raw === undefined) continue;
    const value = item.reverseScored ? scaleMax + 1 - raw : raw;
    total += value;
    count += 1;
  }
  return {
    totalScore: total,
    averageScore: count > 0 ? total / count : 0,
  };
}
