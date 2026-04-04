// ─────────────────────────────────────────────────────────────
// AI 協作會議室 — Memory Storage Layer Schema
// Database: PostgreSQL / SQLite
// ─────────────────────────────────────────────────────────────

/**
 * `Meeting` — one collaborative session.
 *
 * SQL:
 * ```sql
 * CREATE TABLE Meeting (
 *   meeting_id   TEXT PRIMARY KEY,
 *   room_id      TEXT NOT NULL,
 *   title        TEXT,
 *   started_at   TEXT NOT NULL,
 *   ended_at     TEXT,
 *   status       TEXT NOT NULL DEFAULT 'active'
 * );
 * ```
 */
export type Meeting = {
  meetingId: string;
  roomId: string;
  title?: string;
  startedAt: string;
  endedAt: string | null;
  status: "active" | "closed" | "archived";
};

/**
 * `Agent` — an AI agent or human participant.
 *
 * SQL:
 * ```sql
 * CREATE TABLE Agent (
 *   agent_id     TEXT PRIMARY KEY,
 *   display_name TEXT NOT NULL,
 *   type         TEXT NOT NULL,
 *   config       TEXT,
 *   created_at   TEXT NOT NULL
 * );
 * ```
 */
export type Agent = {
  agentId: string;
  displayName: string;
  type: "ai" | "human" | "system";
  /** JSON-serialised configuration blob. */
  config?: Record<string, unknown>;
  createdAt: string;
};

/**
 * `Task` — a unit of work inside a meeting.
 *
 * SQL:
 * ```sql
 * CREATE TABLE Task (
 *   task_id      TEXT PRIMARY KEY,
 *   meeting_id   TEXT NOT NULL REFERENCES Meeting(meeting_id),
 *   created_by   TEXT NOT NULL,
 *   assigned_to  TEXT,
 *   status       TEXT NOT NULL DEFAULT 'pending',
 *   title        TEXT NOT NULL,
 *   description  TEXT,
 *   context      TEXT,
 *   created_at   TEXT NOT NULL,
 *   updated_at   TEXT NOT NULL
 * );
 * ```
 */
export type TaskRow = {
  taskId: string;
  meetingId: string;
  createdBy: string;
  assignedTo: string | null;
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  title: string;
  description: string | null;
  /** JSON blob. */
  context: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * `TaskEvent` — an immutable log entry for a task lifecycle action.
 *
 * SQL:
 * ```sql
 * CREATE TABLE TaskEvent (
 *   task_event_id TEXT PRIMARY KEY,
 *   task_id       TEXT NOT NULL REFERENCES Task(task_id),
 *   actor_id      TEXT NOT NULL,
 *   action        TEXT NOT NULL,
 *   new_status    TEXT NOT NULL,
 *   detail        TEXT,
 *   timestamp     TEXT NOT NULL
 * );
 * ```
 */
export type TaskEventRow = {
  taskEventId: string;
  taskId: string;
  actorId: string;
  action: string;
  newStatus: string;
  /** JSON blob. */
  detail: string | null;
  timestamp: string;
};

/**
 * `MemoryRecord` — a persisted memory entry produced by the Memory Adapter.
 *
 * SQL:
 * ```sql
 * CREATE TABLE MemoryRecord (
 *   record_id    TEXT PRIMARY KEY,
 *   meeting_id   TEXT NOT NULL REFERENCES Meeting(meeting_id),
 *   source_id    TEXT NOT NULL,
 *   category     TEXT NOT NULL,
 *   content      TEXT NOT NULL,
 *   tags         TEXT,
 *   created_at   TEXT NOT NULL
 * );
 * ```
 */
export type MemoryRecordRow = {
  recordId: string;
  meetingId: string;
  sourceId: string;
  category: "summary" | "graph" | "log" | "custom";
  /** JSON-serialised content. */
  content: string;
  /** JSON array of tag strings. */
  tags: string | null;
  createdAt: string;
};

/**
 * `StateHistory` — append-only log of agent state transitions.
 *
 * SQL:
 * ```sql
 * CREATE TABLE StateHistory (
 *   history_id   TEXT PRIMARY KEY,
 *   meeting_id   TEXT NOT NULL REFERENCES Meeting(meeting_id),
 *   agent_id     TEXT NOT NULL,
 *   prev_status  TEXT,
 *   new_status   TEXT NOT NULL,
 *   timestamp    TEXT NOT NULL,
 *   meta         TEXT
 * );
 * ```
 */
export type StateHistoryRow = {
  historyId: string;
  meetingId: string;
  agentId: string;
  prevStatus: string | null;
  newStatus: string;
  timestamp: string;
  /** JSON blob for additional context. */
  meta: string | null;
};
