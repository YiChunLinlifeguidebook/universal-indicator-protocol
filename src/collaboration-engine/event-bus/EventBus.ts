// ─────────────────────────────────────────────────────────────
// AI 協作會議室 — Event Bus
// ─────────────────────────────────────────────────────────────

import type { BusEvent, EventHandler, EventType } from "./types.js";

/**
 * EventBus — the central Pub/Sub backbone of the Collaboration Engine.
 *
 * Agents and the system core emit events via `emit()` and subscribe to
 * specific event types via `on()`.  All handlers registered for a given
 * type are called synchronously in registration order.
 *
 * Example
 * ```ts
 * const bus = new EventBus();
 *
 * bus.on("message", (evt) => {
 *   console.log(`[${evt.senderId}] ${evt.payload.content}`);
 * });
 *
 * bus.emit({
 *   eventId:   "evt-001",
 *   timestamp: new Date().toISOString(),
 *   senderId:  "agent-alice",
 *   roomId:    "room-42",
 *   type:      "message",
 *   payload:   { content: "Hello, room!" },
 * });
 * ```
 */
export class EventBus {
  private readonly handlers: Map<EventType, Set<EventHandler>> = new Map();

  /**
   * Register a handler for a specific event type.
   *
   * @returns A disposer function — call it to unsubscribe.
   */
  on<T extends BusEvent>(
    type: T["type"],
    handler: EventHandler<T>
  ): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler as EventHandler);

    return () => {
      this.handlers.get(type)?.delete(handler as EventHandler);
    };
  }

  /**
   * Emit an event to all subscribers registered for its type.
   */
  emit(event: BusEvent): void {
    const bucket = this.handlers.get(event.type);
    if (!bucket) return;
    for (const handler of bucket) {
      handler(event);
    }
  }

  /**
   * Remove all handlers for a given event type, or clear every
   * handler when called with no argument.
   */
  off(type?: EventType): void {
    if (type === undefined) {
      this.handlers.clear();
    } else {
      this.handlers.delete(type);
    }
  }

  /**
   * Return the number of handlers currently registered for a given type.
   */
  listenerCount(type: EventType): number {
    return this.handlers.get(type)?.size ?? 0;
  }
}
