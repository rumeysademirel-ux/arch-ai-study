import { getAssignedGroup } from "./stage";
import { getAssignmentForPosition, type TaskAssignment, type TaskPosition } from "@/config/counterbalancing";
import { getTaskByKey, type TaskBrief } from "@/config/tasks";

/**
 * Resolves which task and which feedback condition a participant sees at a
 * given position (1st or 2nd task), based on their counterbalancing group.
 * This is the single place task/condition sequencing logic lives — pages
 * and API routes under app/**\/[n]/** all go through this.
 */
export async function resolveTaskAssignment(
  participantCode: string,
  position: TaskPosition
): Promise<TaskAssignment & { task: TaskBrief }> {
  const group = await getAssignedGroup(participantCode);
  const assignment = getAssignmentForPosition(group, position);
  return { ...assignment, task: getTaskByKey(assignment.taskKey) };
}

export function parseTaskPosition(raw: string): TaskPosition | null {
  if (raw === "1") return 1;
  if (raw === "2") return 2;
  return null;
}
