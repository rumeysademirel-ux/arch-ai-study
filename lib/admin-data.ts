import { prepare } from "./db";
import {
  GROUP_SEQUENCES,
  getPositionForTaskKey,
  isValidGroup,
  type CounterbalancingGroup,
} from "@/config/counterbalancing";
import { getTaskByKey } from "@/config/tasks";

export interface ParticipantOverview {
  code: string;
  assignedGroup: number;
  currentStage: string;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
}

export async function listParticipants(): Promise<ParticipantOverview[]> {
  const rows = (await prepare(
    `SELECT code, assigned_group, current_stage, created_at, updated_at
     FROM participants ORDER BY created_at DESC`
  ).all()) as {
    code: string;
    assigned_group: number;
    current_stage: string;
    created_at: string;
    updated_at: string;
  }[];

  return rows.map((r) => ({
    code: r.code,
    assignedGroup: r.assigned_group,
    currentStage: r.current_stage,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    completed: r.current_stage === "COMPLETE",
  }));
}

interface TaskDetail {
  position: 1 | 2 | null;
  taskKey: string;
  taskTitle: string;
  condition: string | null;
  startedAt: string | null;
  endedAt: string | null;
  initialIdea: { title: string; description: string; wordCount: number; sketchFilename: string | null; submittedAt: string } | null;
  preAssessment: { clarity: number; decisionDifficulty: number; guidanceNeeded: number } | null;
  aiFeedback: {
    condition: string;
    model: string;
    promptSent: string;
    feedbackText: string;
    shownAt: string;
    ackAt: string | null;
    readingDurationSeconds: number | null;
    fuzzyInputs: string | null;
    fuzzyMembership: string | null;
    fuzzyRules: string | null;
    fuzzyOutput: number | null;
  } | null;
  revisedIdea: { title: string; description: string; wordCount: number; sketchFilename: string | null; submittedAt: string } | null;
  postAssessment: {
    clarity: number;
    decisionDifficulty: number;
    guidanceNeeded: number;
    structureLevel: number;
    fitToNeed: number;
    thinkingSpace: number;
    usageLevel: number;
  } | null;
}

export interface ParticipantDetail {
  code: string;
  assignedGroup: number;
  currentStage: string;
  createdAt: string;
  updatedAt: string;
  demographics: Record<string, string | null> | null;
  mstatScore: { totalScore: number; averageScore: number } | null;
  tasks: TaskDetail[];
}

export async function getParticipantDetail(code: string): Promise<ParticipantDetail | null> {
  const participant = (await prepare(
    `SELECT code, assigned_group, current_stage, created_at, updated_at FROM participants WHERE code = ?`
  ).get(code)) as
    | { code: string; assigned_group: number; current_stage: string; created_at: string; updated_at: string }
    | undefined;
  if (!participant) return null;

  const demographics = (await prepare(
    `SELECT age_range, gender, university, class_level, studio_count,
            ai_usage_frequency, ai_design_experience, ai_tools_used
     FROM demographics WHERE participant_code = ?`
  ).get(code)) as Record<string, string | null> | undefined;

  const mstatScore = (await prepare(
    `SELECT total_score, average_score FROM mstat_scores WHERE participant_code = ?`
  ).get(code)) as { total_score: number; average_score: number } | undefined;

  const taskSessions = (await prepare(
    `SELECT task_key, started_at, ended_at FROM task_sessions WHERE participant_code = ?`
  ).all(code)) as { task_key: string; started_at: string; ended_at: string | null }[];

  const group: CounterbalancingGroup = isValidGroup(participant.assigned_group)
    ? participant.assigned_group
    : 1;

  const tasks: TaskDetail[] = await Promise.all(
    taskSessions.map(async (ts) => {
    const taskKey = ts.task_key as "task-a" | "task-b";
    const task = getTaskByKey(taskKey);
    const position = getPositionForTaskKey(group, taskKey);
    const assignment = GROUP_SEQUENCES[group].find((a) => a.taskKey === taskKey);

    const initialIdea = (await prepare(
      `SELECT title, description, word_count, sketch_filename, submitted_at
       FROM initial_ideas WHERE participant_code = ? AND task_key = ?`
    ).get(code, taskKey)) as
      | { title: string; description: string; word_count: number; sketch_filename: string | null; submitted_at: string }
      | undefined;

    const preAssessment = (await prepare(
      `SELECT clarity, decision_difficulty, guidance_needed
       FROM pre_assessments WHERE participant_code = ? AND task_key = ?`
    ).get(code, taskKey)) as
      | { clarity: number; decision_difficulty: number; guidance_needed: number }
      | undefined;

    const aiFeedback = (await prepare(
      `SELECT condition, model, prompt_sent, feedback_text, shown_at, ack_at,
              reading_duration_seconds, fuzzy_inputs, fuzzy_membership, fuzzy_rules, fuzzy_output
       FROM ai_feedback_events WHERE participant_code = ? AND task_key = ?`
    ).get(code, taskKey)) as
      | {
          condition: string;
          model: string;
          prompt_sent: string;
          feedback_text: string;
          shown_at: string;
          ack_at: string | null;
          reading_duration_seconds: number | null;
          fuzzy_inputs: string | null;
          fuzzy_membership: string | null;
          fuzzy_rules: string | null;
          fuzzy_output: number | null;
        }
      | undefined;

    const revisedIdea = (await prepare(
      `SELECT title, description, word_count, sketch_filename, submitted_at
       FROM revised_ideas WHERE participant_code = ? AND task_key = ?`
    ).get(code, taskKey)) as
      | { title: string; description: string; word_count: number; sketch_filename: string | null; submitted_at: string }
      | undefined;

    const postAssessment = (await prepare(
      `SELECT clarity, decision_difficulty, guidance_needed, structure_level, fit_to_need,
              thinking_space, usage_level
       FROM post_assessments WHERE participant_code = ? AND task_key = ?`
    ).get(code, taskKey)) as
      | {
          clarity: number;
          decision_difficulty: number;
          guidance_needed: number;
          structure_level: number;
          fit_to_need: number;
          thinking_space: number;
          usage_level: number;
        }
      | undefined;

    return {
      position,
      taskKey,
      taskTitle: task.title,
      condition: assignment?.condition ?? null,
      startedAt: ts.started_at,
      endedAt: ts.ended_at,
      initialIdea: initialIdea
        ? {
            title: initialIdea.title,
            description: initialIdea.description,
            wordCount: initialIdea.word_count,
            sketchFilename: initialIdea.sketch_filename,
            submittedAt: initialIdea.submitted_at,
          }
        : null,
      preAssessment: preAssessment
        ? {
            clarity: preAssessment.clarity,
            decisionDifficulty: preAssessment.decision_difficulty,
            guidanceNeeded: preAssessment.guidance_needed,
          }
        : null,
      aiFeedback: aiFeedback
        ? {
            condition: aiFeedback.condition,
            model: aiFeedback.model,
            promptSent: aiFeedback.prompt_sent,
            feedbackText: aiFeedback.feedback_text,
            shownAt: aiFeedback.shown_at,
            ackAt: aiFeedback.ack_at,
            readingDurationSeconds: aiFeedback.reading_duration_seconds,
            fuzzyInputs: aiFeedback.fuzzy_inputs,
            fuzzyMembership: aiFeedback.fuzzy_membership,
            fuzzyRules: aiFeedback.fuzzy_rules,
            fuzzyOutput: aiFeedback.fuzzy_output,
          }
        : null,
      revisedIdea: revisedIdea
        ? {
            title: revisedIdea.title,
            description: revisedIdea.description,
            wordCount: revisedIdea.word_count,
            sketchFilename: revisedIdea.sketch_filename,
            submittedAt: revisedIdea.submitted_at,
          }
        : null,
      postAssessment: postAssessment
        ? {
            clarity: postAssessment.clarity,
            decisionDifficulty: postAssessment.decision_difficulty,
            guidanceNeeded: postAssessment.guidance_needed,
            structureLevel: postAssessment.structure_level,
            fitToNeed: postAssessment.fit_to_need,
            thinkingSpace: postAssessment.thinking_space,
            usageLevel: postAssessment.usage_level,
          }
        : null,
    };
    })
  );

  tasks.sort((a, b) => (a.position ?? 99) - (b.position ?? 99));

  return {
    code: participant.code,
    assignedGroup: participant.assigned_group,
    currentStage: participant.current_stage,
    createdAt: participant.created_at,
    updatedAt: participant.updated_at,
    demographics: demographics ?? null,
    mstatScore: mstatScore
      ? { totalScore: mstatScore.total_score, averageScore: mstatScore.average_score }
      : null,
    tasks,
  };
}

/**
 * One flat row per (participant, task session) — the natural grain for
 * CSV export into stats software. Participants with no task session yet
 * still appear once (all task-level fields null), so incomplete/missing
 * sessions are visible in the export.
 */
export async function getExportRows(): Promise<Record<string, unknown>[]> {
  const codes = (await listParticipants()).map((p) => p.code);
  const rows: Record<string, unknown>[] = [];

  for (const code of codes) {
    const detail = await getParticipantDetail(code);
    if (!detail) continue;

    const base = {
      participant_code: detail.code,
      assigned_group: detail.assignedGroup,
      current_stage: detail.currentStage,
      participant_created_at: detail.createdAt,
      age_range: detail.demographics?.age_range ?? null,
      gender: detail.demographics?.gender ?? null,
      university: detail.demographics?.university ?? null,
      class_level: detail.demographics?.class_level ?? null,
      studio_count: detail.demographics?.studio_count ?? null,
      ai_usage_frequency: detail.demographics?.ai_usage_frequency ?? null,
      ai_design_experience: detail.demographics?.ai_design_experience ?? null,
      ai_tools_used: detail.demographics?.ai_tools_used ?? null,
      mstat_total_score: detail.mstatScore?.totalScore ?? null,
      mstat_average_score: detail.mstatScore?.averageScore ?? null,
    };

    if (detail.tasks.length === 0) {
      rows.push({ ...base, task_position: null });
      continue;
    }

    for (const t of detail.tasks) {
      rows.push({
        ...base,
        task_position: t.position,
        task_key: t.taskKey,
        task_title: t.taskTitle,
        feedback_condition: t.condition,
        task_started_at: t.startedAt,
        task_ended_at: t.endedAt,
        initial_title: t.initialIdea?.title ?? null,
        initial_description: t.initialIdea?.description ?? null,
        initial_word_count: t.initialIdea?.wordCount ?? null,
        initial_sketch_filename: t.initialIdea?.sketchFilename ?? null,
        pre_clarity: t.preAssessment?.clarity ?? null,
        pre_decision_difficulty: t.preAssessment?.decisionDifficulty ?? null,
        pre_guidance_needed: t.preAssessment?.guidanceNeeded ?? null,
        ai_model: t.aiFeedback?.model ?? null,
        ai_feedback_text: t.aiFeedback?.feedbackText ?? null,
        ai_shown_at: t.aiFeedback?.shownAt ?? null,
        ai_ack_at: t.aiFeedback?.ackAt ?? null,
        ai_reading_duration_seconds: t.aiFeedback?.readingDurationSeconds ?? null,
        fuzzy_inputs: t.aiFeedback?.fuzzyInputs ?? null,
        fuzzy_membership: t.aiFeedback?.fuzzyMembership ?? null,
        fuzzy_rules: t.aiFeedback?.fuzzyRules ?? null,
        fuzzy_output: t.aiFeedback?.fuzzyOutput ?? null,
        revised_title: t.revisedIdea?.title ?? null,
        revised_description: t.revisedIdea?.description ?? null,
        revised_word_count: t.revisedIdea?.wordCount ?? null,
        revised_sketch_filename: t.revisedIdea?.sketchFilename ?? null,
        post_clarity: t.postAssessment?.clarity ?? null,
        post_decision_difficulty: t.postAssessment?.decisionDifficulty ?? null,
        post_guidance_needed: t.postAssessment?.guidanceNeeded ?? null,
        post_structure_level: t.postAssessment?.structureLevel ?? null,
        post_fit_to_need: t.postAssessment?.fitToNeed ?? null,
        post_thinking_space: t.postAssessment?.thinkingSpace ?? null,
        post_usage_level: t.postAssessment?.usageLevel ?? null,
      });
    }
  }

  return rows;
}
