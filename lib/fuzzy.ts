import {
  type FuzzyLevel,
  type TrapezoidShape,
  type InputMembershipSets,
  mstatMembership,
  clarityMembership,
  guidanceMembership,
  outputMembership,
  fuzzyRules,
} from "@/config/fuzzy-config";

/**
 * Trapezoidal membership degree at x. A triangular set is a trapezoid whose
 * two middle points coincide (b === c), so this single function covers both
 * shapes used in config/fuzzy-config.ts.
 */
function trapezoidMembership(x: number, shape: TrapezoidShape): number {
  const { a, b, c, d } = shape;
  if (x < a || x > d) return 0;
  if (x >= b && x <= c) return 1; // covers vertical shoulders (a===b or c===d) too
  if (x < b) return (x - a) / (b - a);
  return (d - x) / (d - c);
}

export type MembershipDegrees = Record<FuzzyLevel, number>;

function fuzzify(x: number, sets: InputMembershipSets): MembershipDegrees {
  return {
    low: trapezoidMembership(x, sets.low),
    medium: trapezoidMembership(x, sets.medium),
    high: trapezoidMembership(x, sets.high),
  };
}

export interface FuzzyInputs {
  mstatScore: number; // 1-7
  clarity: number; // 1-7
  guidanceNeeded: number; // 1-7
}

export interface ActivatedRule {
  mstat: FuzzyLevel;
  clarity: FuzzyLevel;
  guidance: FuzzyLevel;
  output: FuzzyLevel;
  strength: number;
}

export interface FuzzyResult {
  membershipValues: {
    mstat: MembershipDegrees;
    clarity: MembershipDegrees;
    guidance: MembershipDegrees;
  };
  activatedRules: ActivatedRule[];
  output: number; // 0-100, centroid defuzzification
}

const DEFUZZ_STEP = 1; // 0-100 domain discretization step for the centroid integral

/**
 * Mamdani fuzzy inference: fuzzify the three inputs, evaluate all 27 rules
 * (firing strength = min of the three antecedent memberships), aggregate
 * each output level's clipped membership via max, then defuzzify by
 * centroid. Returns only a numeric 0-100 value plus the intermediate
 * values needed for a future researcher-facing debug view — this module
 * does not select or build an AI prompt.
 */
export function computeFuzzyOutput(inputs: FuzzyInputs): FuzzyResult {
  const mstatDegrees = fuzzify(inputs.mstatScore, mstatMembership);
  const clarityDegrees = fuzzify(inputs.clarity, clarityMembership);
  const guidanceDegrees = fuzzify(inputs.guidanceNeeded, guidanceMembership);

  const activatedRules: ActivatedRule[] = [];
  const outputStrength: MembershipDegrees = { low: 0, medium: 0, high: 0 };

  for (const rule of fuzzyRules) {
    const strength = Math.min(
      mstatDegrees[rule.mstat],
      clarityDegrees[rule.clarity],
      guidanceDegrees[rule.guidance]
    );
    if (strength > 0) {
      activatedRules.push({ ...rule, strength });
      outputStrength[rule.output] = Math.max(outputStrength[rule.output], strength);
    }
  }

  // Centroid defuzzification over the discretized 0-100 output domain.
  let numerator = 0;
  let denominator = 0;
  for (let x = 0; x <= 100; x += DEFUZZ_STEP) {
    const aggregated = Math.max(
      Math.min(trapezoidMembership(x, outputMembership.low), outputStrength.low),
      Math.min(trapezoidMembership(x, outputMembership.medium), outputStrength.medium),
      Math.min(trapezoidMembership(x, outputMembership.high), outputStrength.high)
    );
    numerator += x * aggregated;
    denominator += aggregated;
  }

  // No rule fired (inputs outside every membership set) — fall back to the
  // domain midpoint rather than dividing by zero.
  const output = denominator > 0 ? numerator / denominator : 50;

  return {
    membershipValues: { mstat: mstatDegrees, clarity: clarityDegrees, guidance: guidanceDegrees },
    activatedRules,
    output: Math.round(output * 100) / 100,
  };
}
