import { prepare } from "./db";
import { standardSystemPrompt, buildStandardUserMessage } from "@/config/ai-prompt-standard";
import { adaptiveSystemPrompts, buildAdaptiveUserMessage } from "@/config/ai-prompt-adaptive";
import { strategyForOutput } from "@/config/fuzzy-config";
import { generateFeedback, AI_MODEL_ID } from "./ai-client";
import { computeFuzzyOutput } from "./fuzzy";
import { resolveTaskAssignment } from "./task-assignment";
import type { TaskPosition } from "@/config/counterbalancing";

export type FeedbackResult =
  | { status: "ok"; text: string }
  | { status: "error"; message: string };

/**
 * Idempotent: an existing ai_feedback_events row is returned as-is. On
 * failure, no row is written, so the next call (e.g. the participant
 * reloading the feedback page) retries the AI call from scratch.
 */
export async function ensureAiFeedback(
  participantCode: string,
  position: TaskPosition
): Promise<FeedbackResult> {
  const { task, condition } = await resolveTaskAssignment(participantCode, position);

  const existing = (await prepare(
    `SELECT feedback_text FROM ai_feedback_events WHERE participant_code = ? AND task_key = ?`
  ).get(participantCode, task.taskKey)) as { feedback_text: string } | undefined;

  if (existing) {
    return { status: "ok", text: existing.feedback_text };
  }

  const idea = (await prepare(
    `SELECT title, description FROM initial_ideas WHERE participant_code = ? AND task_key = ?`
  ).get(participantCode, task.taskKey)) as { title: string; description: string } | undefined;

  if (!idea) {
    return { status: "error", message: "İlk fikir kaydı bulunamadı." };
  }

  let systemPrompt: string;
  let fuzzyDebug: {
    inputs: string;
    membership: string;
    rules: string;
    output: number;
  } | null = null;

  if (condition === "adaptive") {
    const mstat = (await prepare(
      `SELECT average_score FROM mstat_scores WHERE participant_code = ?`
    ).get(participantCode)) as { average_score: number } | undefined;
    const pre = (await prepare(
      `SELECT clarity, guidance_needed FROM pre_assessments WHERE participant_code = ? AND task_key = ?`
    ).get(participantCode, task.taskKey)) as
      | { clarity: number; guidance_needed: number }
      | undefined;

    if (!mstat || !pre) {
      return { status: "error", message: "Uyarlanabilir koşul için gerekli veriler eksik." };
    }

    const fuzzyInputs = {
      mstatScore: mstat.average_score,
      clarity: pre.clarity,
      guidanceNeeded: pre.guidance_needed,
    };
    const fuzzyResult = computeFuzzyOutput(fuzzyInputs);
    const strategy = strategyForOutput(fuzzyResult.output);

    systemPrompt = adaptiveSystemPrompts[strategy];
    fuzzyDebug = {
      inputs: JSON.stringify(fuzzyInputs),
      membership: JSON.stringify(fuzzyResult.membershipValues),
      rules: JSON.stringify(fuzzyResult.activatedRules),
      output: fuzzyResult.output,
    };
  } else {
    systemPrompt = standardSystemPrompt;
  }

  const userMessage =
    condition === "adaptive"
      ? buildAdaptiveUserMessage(task, idea.title, idea.description)
      : buildStandardUserMessage(task, idea.title, idea.description);

  try {
    const feedbackText = await generateFeedback(systemPrompt, userMessage);
    await prepare(
      `INSERT INTO ai_feedback_events
        (participant_code, task_key, condition, prompt_sent, model, feedback_text,
         fuzzy_inputs, fuzzy_membership, fuzzy_rules, fuzzy_output)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      participantCode,
      task.taskKey,
      condition,
      userMessage,
      AI_MODEL_ID,
      feedbackText,
      fuzzyDebug?.inputs ?? null,
      fuzzyDebug?.membership ?? null,
      fuzzyDebug?.rules ?? null,
      fuzzyDebug?.output ?? null
    );
    return { status: "ok", text: feedbackText };
  } catch (err) {
    // Researcher notification channel: Aşama 5 admin panel will surface this.
    // For now it is logged server-side so the researcher can check server logs.
    console.error(`[ai-feedback] participant=${participantCode} AI call failed:`, err);
    return {
      status: "error",
      message: "Şu anda geri bildirim oluşturulamadı. Lütfen birkaç saniye sonra tekrar deneyin.",
    };
  }
}
