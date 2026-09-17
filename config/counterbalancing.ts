import type { TaskBrief } from "./tasks";

export type FeedbackCondition = "standard" | "adaptive";
export type CounterbalancingGroup = 1 | 2 | 3 | 4;
export type TaskPosition = 1 | 2;

export interface TaskAssignment {
  taskKey: TaskBrief["taskKey"];
  condition: FeedbackCondition;
}

// 4 grup × [1. görev, 2. görev]. Görev ve koşul sırası tam olarak
// araştırma tasarımındaki tabloyu yansıtır:
//   Grup 1: Görev A–Standart, Görev B–Uyarlanabilir
//   Grup 2: Görev A–Uyarlanabilir, Görev B–Standart
//   Grup 3: Görev B–Standart, Görev A–Uyarlanabilir
//   Grup 4: Görev B–Uyarlanabilir, Görev A–Standart
export const GROUP_SEQUENCES: Record<CounterbalancingGroup, [TaskAssignment, TaskAssignment]> = {
  1: [
    { taskKey: "task-a", condition: "standard" },
    { taskKey: "task-b", condition: "adaptive" },
  ],
  2: [
    { taskKey: "task-a", condition: "adaptive" },
    { taskKey: "task-b", condition: "standard" },
  ],
  3: [
    { taskKey: "task-b", condition: "standard" },
    { taskKey: "task-a", condition: "adaptive" },
  ],
  4: [
    { taskKey: "task-b", condition: "adaptive" },
    { taskKey: "task-a", condition: "standard" },
  ],
};

export function getAssignmentForPosition(
  group: CounterbalancingGroup,
  position: TaskPosition
): TaskAssignment {
  return GROUP_SEQUENCES[group][position - 1];
}

export function isValidGroup(value: number): value is CounterbalancingGroup {
  return value === 1 || value === 2 || value === 3 || value === 4;
}

/** Reverse lookup for the admin panel: which position (1st/2nd) a given task_key was at for a group. */
export function getPositionForTaskKey(
  group: CounterbalancingGroup,
  taskKey: TaskBrief["taskKey"]
): TaskPosition | null {
  const sequence = GROUP_SEQUENCES[group];
  if (sequence[0].taskKey === taskKey) return 1;
  if (sequence[1].taskKey === taskKey) return 2;
  return null;
}
