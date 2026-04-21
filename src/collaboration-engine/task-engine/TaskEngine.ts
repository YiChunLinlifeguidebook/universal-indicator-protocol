// ─────────────────────────────────────────────────────────────
// AI 協作會議室 — Task Engine
// ─────────────────────────────────────────────────────────────

import type { Task, TaskEvent, TaskStatus, HandoffRule } from "./types.js";

/**
 * TaskEngine — handles task creation, assignment, handoff routing,
 * and lifecycle tracking inside a meeting room.
 *
 * Example
 * ```ts
 * const engine = new TaskEngine("room-42");
 *
 * engine.addHandoffRule({
 *   ruleId:        "rule-01",
 *   pattern:       "summarize",
 *   targetAgentId: "agent-summary",
 *   priority:      10,
 * });
 *
 * const task = engine.createTask({
 *   taskId:    "task-001",
 *   createdBy: "agent-alice",
 *   title:     "Summarize the discussion",
 * });
 *
 * // Auto-routed to "agent-summary" because title matches "summarize"
 * engine.handoffTask("task-001", "agent-alice");
 *
 * engine.completeTask("task-001", "agent-summary");
 * ```
 */
export class TaskEngine {
  private readonly roomId: string;
  private readonly tasks: Map<string, Task> = new Map();
  private readonly eventLog: TaskEvent[] = [];
  private readonly handoffRules: HandoffRule[] = [];

  constructor(roomId: string) {
    this.roomId = roomId;
  }

  // ─── Task registry ─────────────────────────────────────────────

  /**
   * Register a new task in this room.
   *
   * @throws {Error} if a task with the same `taskId` already exists.
   */
  createTask(
    params: Pick<Task, "taskId" | "createdBy" | "title"> &
      Partial<Pick<Task, "assignedTo" | "description" | "context">>
  ): Task {
    if (this.tasks.has(params.taskId)) {
      throw new Error(`Task "${params.taskId}" already exists in room "${this.roomId}".`);
    }
    const now = new Date().toISOString();
    const task: Task = {
      taskId: params.taskId,
      roomId: this.roomId,
      createdBy: params.createdBy,
      assignedTo: params.assignedTo ?? null,
      status: "pending",
      title: params.title,
      description: params.description,
      context: params.context,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(task.taskId, task);
    this._logEvent({
      taskId: task.taskId,
      actorId: task.createdBy,
      action: "created",
      newStatus: "pending",
    });
    return task;
  }

  /**
   * Return a task by ID, or `undefined` if not found.
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Return all tasks in this room, optionally filtered by status.
   */
  listTasks(filter?: { status?: TaskStatus; assignedTo?: string }): Task[] {
    let results = Array.from(this.tasks.values());
    if (filter?.status !== undefined) {
      results = results.filter((t) => t.status === filter.status);
    }
    if (filter?.assignedTo !== undefined) {
      results = results.filter((t) => t.assignedTo === filter.assignedTo);
    }
    return results;
  }

  // ─── Task lifecycle ────────────────────────────────────────────

  /**
   * Assign a task to a specific agent and move it to `"in_progress"`.
   *
   * @throws {Error} if the task does not exist.
   */
  assignTask(taskId: string, agentId: string, actorId: string): Task {
    this._requireTask(taskId);
    return this._updateTask(taskId, {
      assignedTo: agentId,
      status: "in_progress",
    }, actorId, "assigned");
  }

  /**
   * Hand off a task to another agent using the Handoff Router.
   * If a matching rule is found the task is assigned to the rule's target;
   * otherwise the caller must supply `targetAgentId` explicitly.
   *
   * @throws {Error} if the task does not exist or no target can be resolved.
   */
  handoffTask(
    taskId: string,
    actorId: string,
    targetAgentId?: string
  ): Task {
    const task = this._requireTask(taskId);
    const resolved =
      targetAgentId ?? this._routeHandoff(task);

    if (!resolved) {
      throw new Error(
        `No handoff target found for task "${taskId}". ` +
          "Provide a targetAgentId or add a matching handoff rule."
      );
    }

    return this._updateTask(taskId, {
      assignedTo: resolved,
      status: "in_progress",
    }, actorId, "handoff", { targetAgentId: resolved });
  }

  /**
   * Mark a task as completed.
   *
   * @throws {Error} if the task does not exist.
   */
  completeTask(
    taskId: string,
    actorId: string,
    detail?: Record<string, unknown>
  ): Task {
    return this._updateTask(taskId, { status: "completed" }, actorId, "completed", detail);
  }

  /**
   * Mark a task as failed.
   *
   * @throws {Error} if the task does not exist.
   */
  failTask(
    taskId: string,
    actorId: string,
    detail?: Record<string, unknown>
  ): Task {
    return this._updateTask(taskId, { status: "failed" }, actorId, "failed", detail);
  }

  /**
   * Cancel a task.
   *
   * @throws {Error} if the task does not exist.
   */
  cancelTask(
    taskId: string,
    actorId: string,
    detail?: Record<string, unknown>
  ): Task {
    return this._updateTask(taskId, { status: "cancelled" }, actorId, "cancelled", detail);
  }

  // ─── Task Event Log ────────────────────────────────────────────

  /**
   * Return the full event log, optionally filtered by task.
   */
  getEventLog(taskId?: string): TaskEvent[] {
    if (taskId === undefined) return [...this.eventLog];
    return this.eventLog.filter((e) => e.taskId === taskId);
  }

  // ─── Handoff Router ────────────────────────────────────────────

  /**
   * Register a routing rule for automatic task handoffs.
   * Rules with a higher `priority` are evaluated first.
   */
  addHandoffRule(rule: HandoffRule): void {
    this.handoffRules.push(rule);
  }

  /**
   * Remove a routing rule by its ID. No-op if not found.
   */
  removeHandoffRule(ruleId: string): void {
    const idx = this.handoffRules.findIndex((r) => r.ruleId === ruleId);
    if (idx !== -1) this.handoffRules.splice(idx, 1);
  }

  /**
   * Return all registered handoff rules sorted by descending priority.
   */
  listHandoffRules(): HandoffRule[] {
    return [...this.handoffRules].sort((a, b) => b.priority - a.priority);
  }

  // ─── Internal helpers ──────────────────────────────────────────

  private _requireTask(taskId: string): Task {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task "${taskId}" not found in room "${this.roomId}".`);
    }
    return task;
  }

  private _updateTask(
    taskId: string,
    patch: Partial<Task>,
    actorId: string,
    action: string,
    detail?: Record<string, unknown>
  ): Task {
    const existing = this._requireTask(taskId);
    const updated: Task = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(taskId, updated);
    this._logEvent({
      taskId,
      actorId,
      action,
      newStatus: updated.status,
      detail,
    });
    return updated;
  }

  private _logEvent(params: {
    taskId: string;
    actorId: string;
    action: string;
    newStatus: TaskStatus;
    detail?: Record<string, unknown>;
  }): void {
    const event: TaskEvent = {
      taskEventId: `${params.taskId}-${Date.now()}-${this.eventLog.length}`,
      taskId: params.taskId,
      roomId: this.roomId,
      actorId: params.actorId,
      action: params.action,
      newStatus: params.newStatus,
      detail: params.detail,
      timestamp: new Date().toISOString(),
    };
    this.eventLog.push(event);
  }

  /**
   * Attempt to resolve a target agent for the given task using handoff rules.
   * Returns `null` if no rule matches.
   */
  private _routeHandoff(task: Task): string | null {
    const sorted = [...this.handoffRules].sort((a, b) => b.priority - a.priority);
    for (const rule of sorted) {
      try {
        const re = new RegExp(rule.pattern, "i");
        if (re.test(task.title) || (task.description && re.test(task.description))) {
          return rule.targetAgentId;
        }
      } catch {
        // If the pattern is not a valid regex, fall through.
      }
    }
    return null;
  }
}
