// ─────────────────────────────────────────────────────────────
// AI 協作會議室 — Collaboration Engine
// ─────────────────────────────────────────────────────────────

export { EventBus } from "./event-bus/index.js";
export type {
  BusEvent,
  BaseEvent,
  EventType,
  EventHandler,
  InputMode,
  MessageEvent,
  RequestSpeakEvent,
  GrantSpeakEvent,
  HandoffTaskEvent,
  TaskResultEvent,
  MemoryWriteRequestEvent,
  FollowActivityEvent,
} from "./event-bus/index.js";

export { StateManager } from "./state-manager/index.js";
export type {
  AgentStatus,
  AgentState,
  SpeakRequest,
  SpeakingPermission,
  RoomState,
} from "./state-manager/index.js";

export { TaskEngine } from "./task-engine/index.js";
export type {
  TaskStatus,
  Task,
  TaskEvent,
  HandoffRule,
} from "./task-engine/index.js";

export { MemoryAdapter } from "./memory-adapter/index.js";
export type {
  MemoryRecord,
  MeetingSummary,
  GraphNode,
  GraphEdge,
  GraphMemory,
  ObsidianSyncPayload,
} from "./memory-adapter/index.js";
