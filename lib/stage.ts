import { prepare } from "./db";
import { isValidGroup, type CounterbalancingGroup, type TaskPosition } from "@/config/counterbalancing";

// Fixed, ordered stage sequence for the two-task counterbalanced study.
// Task 1 and Task 2 repeat the same sub-flow; which task/condition each
// position maps to is resolved per participant via lib/task-assignment.ts.
export const STAGE_ORDER = [
  "DEMOGRAPHICS",
  "MSTAT",
  "TASK1_BRIEF",
  "TASK1_INITIAL_IDEA",
  "TASK1_PRE_ASSESSMENT",
  "TASK1_AI_FEEDBACK",
  "TASK1_REVISED_IDEA",
  "TASK1_POST_ASSESSMENT",
  "BREAK",
  "TASK2_BRIEF",
  "TASK2_INITIAL_IDEA",
  "TASK2_PRE_ASSESSMENT",
  "TASK2_AI_FEEDBACK",
  "TASK2_REVISED_IDEA",
  "TASK2_POST_ASSESSMENT",
  "COMPLETE",
] as const;

export type Stage = (typeof STAGE_ORDER)[number];

export const STAGE_PATH: Record<Stage, string> = {
  DEMOGRAPHICS: "/demographics",
  MSTAT: "/mstat",
  TASK1_BRIEF: "/task/1/brief",
  TASK1_INITIAL_IDEA: "/task/1/idea",
  TASK1_PRE_ASSESSMENT: "/task/1/pre-assessment",
  TASK1_AI_FEEDBACK: "/task/1/feedback",
  TASK1_REVISED_IDEA: "/task/1/revise",
  TASK1_POST_ASSESSMENT: "/task/1/post-assessment",
  BREAK: "/break",
  TASK2_BRIEF: "/task/2/brief",
  TASK2_INITIAL_IDEA: "/task/2/idea",
  TASK2_PRE_ASSESSMENT: "/task/2/pre-assessment",
  TASK2_AI_FEEDBACK: "/task/2/feedback",
  TASK2_REVISED_IDEA: "/task/2/revise",
  TASK2_POST_ASSESSMENT: "/task/2/post-assessment",
  COMPLETE: "/complete",
};

// Maps each per-task stage to its task position (1 or 2). Stages shared
// across both tasks (demographics, MSTAT, ...) and BREAK/COMPLETE map to
// null. Used by pages/routes under app/task/[n]/** to build the exact
// Stage value ("TASK1_BRIEF" | "TASK2_BRIEF") from the "n" route param.
export function stageForTaskPosition(position: TaskPosition, suffix: TaskStageSuffix): Stage {
  return `TASK${position}_${suffix}` as Stage;
}

export type TaskStageSuffix =
  | "BRIEF"
  | "INITIAL_IDEA"
  | "PRE_ASSESSMENT"
  | "AI_FEEDBACK"
  | "REVISED_IDEA"
  | "POST_ASSESSMENT";

export function stageIndex(stage: Stage): number {
  return STAGE_ORDER.indexOf(stage);
}

export function nextStage(stage: Stage): Stage {
  const idx = stageIndex(stage);
  const next = STAGE_ORDER[idx + 1];
  return next ?? stage;
}

/**
 * Creates the participant row if it doesn't already exist, assigning a
 * counterbalancing group round-robin by signup order (count of existing
 * participants mod 4). Re-visiting an existing code is a no-op — the group
 * is fixed at first creation and never reassigned.
 */
export async function createParticipant(code: string): Promise<void> {
  const existing = await prepare(`SELECT 1 FROM participants WHERE code = ?`).get(code);
  if (existing) return;

  // Postgres COUNT(*) bigint döner ve sürücü bunu hassasiyet kaybını önlemek
  // için string olarak verir — sayıya çevirmeden % kullanmak riskli olur.
  const { count } = (await prepare(`SELECT COUNT(*) AS count FROM participants`).get()) as {
    count: string;
  };
  const group: CounterbalancingGroup = ((Number(count) % 4) + 1) as CounterbalancingGroup;

  await prepare(
    `INSERT INTO participants (code, current_stage, assigned_group) VALUES (?, ?, ?)`
  ).run(code, STAGE_ORDER[0], group);
}

export async function getCurrentStage(participantCode: string): Promise<Stage | null> {
  const row = (await prepare(`SELECT current_stage FROM participants WHERE code = ?`).get(
    participantCode
  )) as { current_stage: Stage } | undefined;
  return row?.current_stage ?? null;
}

export async function getAssignedGroup(participantCode: string): Promise<CounterbalancingGroup> {
  const row = (await prepare(`SELECT assigned_group FROM participants WHERE code = ?`).get(
    participantCode
  )) as { assigned_group: number } | undefined;
  const group = row?.assigned_group ?? 1;
  return isValidGroup(group) ? group : 1;
}

export async function advanceStage(participantCode: string, from: Stage): Promise<void> {
  const target = nextStage(from);
  await prepare(
    `UPDATE participants SET current_stage = ?, updated_at = now()
     WHERE code = ? AND current_stage = ?`
  ).run(target, participantCode, from);
}

/**
 * Throws if the participant's actual current stage does not match `expected`.
 * Callers (API routes) use this to reject writes that skip ahead or repeat a
 * completed stage, keeping progression strictly one-directional.
 */
export async function assertStage(participantCode: string, expected: Stage): Promise<void> {
  const actual = await getCurrentStage(participantCode);
  if (actual !== expected) {
    throw new StageMismatchError(expected, actual);
  }
}

export class StageMismatchError extends Error {
  constructor(public expected: Stage, public actual: Stage | null) {
    super(`Stage mismatch: expected ${expected}, participant is at ${actual}`);
  }
}
