// ─────────────────────────────────────────────────────────────
// AI 協作會議室 — State Manager Types
// ─────────────────────────────────────────────────────────────

/** Possible lifecycle states for a single agent. */
export type AgentStatus = "idle" | "speaking" | "working" | "waiting";

/** Runtime state record for one agent inside a room. */
export type AgentState = {
  agentId: string;
  roomId: string;
  status: AgentStatus;
  /** ISO-8601 timestamp of the last status change. */
  updatedAt: string;
  /** Free-form metadata (e.g. current task description). */
  meta?: Record<string, unknown>;
};

/** A pending entry in the speaking queue. */
export type SpeakRequest = {
  agentId: string;
  roomId: string;
  /** ISO-8601 timestamp when the request was submitted. */
  requestedAt: string;
  /** Higher value = higher priority. Default: 0. */
  priority: number;
  reason?: string;
};

/** Describes which agent currently holds the floor in a room. */
export type SpeakingPermission = {
  roomId: string;
  /** `null` when no agent currently holds the floor. */
  currentSpeakerId: string | null;
  /** ISO-8601 timestamp when the floor was granted. */
  grantedAt: string | null;
  /** Optional expiry — ISO-8601 timestamp. */
  expiresAt: string | null;
};

/** Full state snapshot for one room. */
export type RoomState = {
  roomId: string;
  agents: AgentState[];
  speakQueue: SpeakRequest[];
  speaking: SpeakingPermission;
};
