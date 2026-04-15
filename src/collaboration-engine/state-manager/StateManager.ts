// ─────────────────────────────────────────────────────────────
// AI 協作會議室 — State Manager
// ─────────────────────────────────────────────────────────────

import type {
  AgentState,
  AgentStatus,
  SpeakRequest,
  SpeakingPermission,
  RoomState,
} from "./types.js";

/**
 * StateManager — maintains the real-time state of every agent inside a room
 * and controls the speaking-permission queue.
 *
 * Example
 * ```ts
 * const sm = new StateManager("room-42");
 *
 * sm.registerAgent("agent-alice", "ai");
 * sm.registerAgent("agent-bob",   "ai");
 *
 * sm.requestSpeak("agent-alice", { priority: 1, reason: "Has an update" });
 * sm.requestSpeak("agent-bob",   { priority: 0 });
 *
 * const permission = sm.grantNextSpeaker(5_000);
 * // permission.currentSpeakerId === "agent-alice"
 *
 * sm.releaseSpeaker();
 * // floor is free again
 * ```
 */
export class StateManager {
  private readonly roomId: string;
  private readonly agents: Map<string, AgentState> = new Map();
  private readonly speakQueue: SpeakRequest[] = [];
  private speaking: SpeakingPermission;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.speaking = {
      roomId,
      currentSpeakerId: null,
      grantedAt: null,
      expiresAt: null,
    };
  }

  // ─── Agent lifecycle ──────────────────────────────────────────

  /**
   * Register a new agent (or re-register an existing one) in this room.
   * The initial status is always `"idle"`.
   */
  registerAgent(agentId: string, meta?: Record<string, unknown>): AgentState {
    const state: AgentState = {
      agentId,
      roomId: this.roomId,
      status: "idle",
      updatedAt: new Date().toISOString(),
      meta,
    };
    this.agents.set(agentId, state);
    return state;
  }

  /**
   * Remove an agent from this room.  No-op if the agent is not registered.
   * If the agent currently holds the floor it is also released.
   */
  removeAgent(agentId: string): void {
    this.agents.delete(agentId);
    if (this.speaking.currentSpeakerId === agentId) {
      this.releaseSpeaker();
    }
    const idx = this.speakQueue.findIndex((r) => r.agentId === agentId);
    if (idx !== -1) this.speakQueue.splice(idx, 1);
  }

  /**
   * Update the status of a registered agent.
   *
   * @throws {Error} if `agentId` is not registered.
   */
  setAgentStatus(
    agentId: string,
    status: AgentStatus,
    meta?: Record<string, unknown>
  ): AgentState {
    const existing = this.agents.get(agentId);
    if (!existing) {
      throw new Error(`Agent "${agentId}" is not registered in room "${this.roomId}".`);
    }
    const updated: AgentState = {
      ...existing,
      status,
      updatedAt: new Date().toISOString(),
      ...(meta !== undefined ? { meta } : {}),
    };
    this.agents.set(agentId, updated);
    return updated;
  }

  /**
   * Return the current state of a specific agent, or `undefined` if not found.
   */
  getAgentState(agentId: string): AgentState | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Return a snapshot of all registered agents' states.
   */
  getAllAgentStates(): AgentState[] {
    return Array.from(this.agents.values());
  }

  // ─── Speaking queue ────────────────────────────────────────────

  /**
   * Add a speak request from an agent to the queue.
   * Duplicate requests (same agent already queued) are ignored.
   *
   * @throws {Error} if `agentId` is not registered.
   */
  requestSpeak(
    agentId: string,
    options?: { priority?: number; reason?: string }
  ): SpeakRequest {
    if (!this.agents.has(agentId)) {
      throw new Error(`Agent "${agentId}" is not registered in room "${this.roomId}".`);
    }
    const already = this.speakQueue.find((r) => r.agentId === agentId);
    if (already) return already;

    const request: SpeakRequest = {
      agentId,
      roomId: this.roomId,
      requestedAt: new Date().toISOString(),
      priority: options?.priority ?? 0,
      reason: options?.reason,
    };
    this.speakQueue.push(request);
    return request;
  }

  /**
   * Remove an agent's pending speak request without granting the floor.
   */
  cancelSpeakRequest(agentId: string): void {
    const idx = this.speakQueue.findIndex((r) => r.agentId === agentId);
    if (idx !== -1) this.speakQueue.splice(idx, 1);
  }

  /**
   * Grant the floor to the highest-priority agent in the queue.
   * Ties are broken by earliest `requestedAt`.
   *
   * @param durationMs Optional floor-hold duration in milliseconds.
   * @returns The updated {@link SpeakingPermission}, or `null` if the queue
   *          is empty or the floor is already held.
   */
  grantNextSpeaker(durationMs?: number): SpeakingPermission | null {
    if (this.speaking.currentSpeakerId !== null) return null;
    if (this.speakQueue.length === 0) return null;

    this.speakQueue.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.requestedAt < b.requestedAt ? -1 : 1;
    });

    const next = this.speakQueue.shift()!;
    const grantedAt = new Date().toISOString();
    const expiresAt = durationMs
      ? new Date(Date.now() + durationMs).toISOString()
      : null;

    this.speaking = {
      roomId: this.roomId,
      currentSpeakerId: next.agentId,
      grantedAt,
      expiresAt,
    };

    this.setAgentStatus(next.agentId, "speaking");
    return this.speaking;
  }

  /**
   * Release the floor.  The current speaker's status reverts to `"idle"`.
   */
  releaseSpeaker(): void {
    if (this.speaking.currentSpeakerId) {
      const speakerId = this.speaking.currentSpeakerId;
      if (this.agents.has(speakerId)) {
        this.setAgentStatus(speakerId, "idle");
      }
    }
    this.speaking = {
      roomId: this.roomId,
      currentSpeakerId: null,
      grantedAt: null,
      expiresAt: null,
    };
  }

  /**
   * Return the current speaking-permission snapshot.
   */
  getSpeakingPermission(): SpeakingPermission {
    return { ...this.speaking };
  }

  /**
   * Return a copy of the current speak request queue (sorted by priority).
   */
  getSpeakQueue(): SpeakRequest[] {
    return [...this.speakQueue].sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.requestedAt < b.requestedAt ? -1 : 1;
    });
  }

  // ─── Room snapshot ─────────────────────────────────────────────

  /**
   * Return a full state snapshot for this room.
   */
  getRoomState(): RoomState {
    return {
      roomId: this.roomId,
      agents: this.getAllAgentStates(),
      speakQueue: this.getSpeakQueue(),
      speaking: this.getSpeakingPermission(),
    };
  }
}
