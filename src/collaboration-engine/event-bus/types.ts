// ─────────────────────────────────────────────────────────────
// AI 協作會議室 — Event Bus Types
// ─────────────────────────────────────────────────────────────

/** All event types supported by the Event Bus. */
export type EventType =
  | "message"
  | "request_speak"
  | "grant_speak"
  | "handoff_task"
  | "task_result"
  | "memory_write_request";

/** Base shape shared by every bus event. */
export type BaseEvent = {
  /** Unique event identifier (e.g. UUID). */
  eventId: string;
  /** ISO-8601 timestamp of when the event was emitted. */
  timestamp: string;
  /** ID of the agent or user that emitted the event. */
  senderId: string;
  /** ID of the meeting room this event belongs to. */
  roomId: string;
};

// ─── Concrete event payloads ───────────────────────────────────

/** A general chat / broadcast message. */
export type MessageEvent = BaseEvent & {
  type: "message";
  payload: {
    content: string;
    /** Optional list of agent IDs to address directly. */
    mentions?: string[];
  };
};

/** An agent requests the floor (speaking permission). */
export type RequestSpeakEvent = BaseEvent & {
  type: "request_speak";
  payload: {
    /** Reason / topic the agent wants to speak about. */
    reason?: string;
    priority?: number;
  };
};

/** The system grants speaking permission to an agent. */
export type GrantSpeakEvent = BaseEvent & {
  type: "grant_speak";
  payload: {
    /** ID of the agent that is granted the floor. */
    grantedAgentId: string;
    /** Duration in milliseconds the agent is allowed to hold the floor. */
    durationMs?: number;
  };
};

/** An agent hands off a task to another agent. */
export type HandoffTaskEvent = BaseEvent & {
  type: "handoff_task";
  payload: {
    taskId: string;
    /** ID of the agent the task is handed off to. */
    targetAgentId: string;
    description: string;
    context?: Record<string, unknown>;
  };
};

/** An agent reports the result of a completed task. */
export type TaskResultEvent = BaseEvent & {
  type: "task_result";
  payload: {
    taskId: string;
    status: "success" | "failure" | "partial";
    result?: unknown;
    errorMessage?: string;
  };
};

/** An agent requests that content be written to the memory layer. */
export type MemoryWriteRequestEvent = BaseEvent & {
  type: "memory_write_request";
  payload: {
    /** Category of the memory record. */
    category: "summary" | "graph" | "log" | "custom";
    content: unknown;
    tags?: string[];
  };
};

/** Discriminated union of all concrete event types. */
export type BusEvent =
  | MessageEvent
  | RequestSpeakEvent
  | GrantSpeakEvent
  | HandoffTaskEvent
  | TaskResultEvent
  | MemoryWriteRequestEvent;

/** Callback signature for event subscribers. */
export type EventHandler<T extends BusEvent = BusEvent> = (event: T) => void;
