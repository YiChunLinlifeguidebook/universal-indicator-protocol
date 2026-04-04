// ─────────────────────────────────────────────────────────────
// AI 協作會議室 — Task Engine Types
// ─────────────────────────────────────────────────────────────

/** Lifecycle states a task can be in. */
export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled";

/** A task registered inside the Task Registry. */
export type Task = {
  taskId: string;
  roomId: string;
  /** ID of the agent or user that created the task. */
  createdBy: string;
  /** ID of the agent currently responsible for the task. */
  assignedTo: string | null;
  status: TaskStatus;
  title: string;
  description?: string;
  /** Arbitrary context passed along with the task. */
  context?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

/** A single lifecycle event recorded for a task. */
export type TaskEvent = {
  taskEventId: string;
  taskId: string;
  roomId: string;
  /** The agent or system component that triggered this event. */
  actorId: string;
  /** e.g. "created", "assigned", "handoff", "completed", "failed" */
  action: string;
  /** State the task moved to as a result of this event. */
  newStatus: TaskStatus;
  detail?: Record<string, unknown>;
  timestamp: string;
};

/** Routing rule used by the Handoff Router. */
export type HandoffRule = {
  ruleId: string;
  /** Glob-style or regex pattern matched against task titles / tags. */
  pattern: string;
  /** ID of the agent that should receive matching tasks. */
  targetAgentId: string;
  priority: number;
};
