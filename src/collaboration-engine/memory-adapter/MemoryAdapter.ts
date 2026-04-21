// ─────────────────────────────────────────────────────────────
// AI 協作會議室 — Memory Adapter
// ─────────────────────────────────────────────────────────────

import type {
  MemoryRecord,
  MeetingSummary,
  GraphMemory,
  GraphNode,
  GraphEdge,
  ObsidianSyncPayload,
} from "./types.js";

/**
 * Render an arbitrary content value as a human-readable string.
 * - Plain strings are returned as-is.
 * - Objects with a `text` or `content` string field use that field directly.
 * - All other values fall back to JSON.stringify.
 */
function renderContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (content !== null && typeof content === "object") {
    const obj = content as Record<string, unknown>;
    if (typeof obj["text"] === "string") return obj["text"];
    if (typeof obj["content"] === "string") return obj["content"];
  }
  return JSON.stringify(content);
}

/**
 * MemoryAdapter — converts collaboration data into persistent memory outputs.
 *
 * The adapter produces three artefacts:
 *   1. `summary.md` — a Markdown meeting summary (`buildSummary`)
 *   2. `graph_memory.json` — a knowledge graph (`buildGraphMemory`)
 *   3. An Obsidian-compatible sync payload (`buildObsidianSyncPayload`)
 *
 * Records to be persisted in the database layer can be registered via
 * `addRecord` and retrieved via `getRecords`.
 *
 * Example
 * ```ts
 * const adapter = new MemoryAdapter("room-42", "meeting-01");
 *
 * adapter.addRecord({
 *   recordId:  "rec-001",
 *   sourceId:  "agent-alice",
 *   category:  "log",
 *   content:   { text: "Discussed Q1 targets" },
 *   tags:      ["q1", "targets"],
 * });
 *
 * const summary = adapter.buildSummary({
 *   title: "Q1 Planning",
 *   participants: ["agent-alice", "agent-bob"],
 * });
 *
 * const graph = adapter.buildGraphMemory();
 * const payload = adapter.buildObsidianSyncPayload("/vault", summary, graph);
 * ```
 */
export class MemoryAdapter {
  private readonly roomId: string;
  private readonly meetingId: string;
  private readonly records: MemoryRecord[] = [];

  constructor(roomId: string, meetingId: string) {
    this.roomId = roomId;
    this.meetingId = meetingId;
  }

  // ─── Record store ──────────────────────────────────────────────

  /**
   * Add a memory record to the adapter's internal store.
   * These records are consumed by `buildSummary` and `buildGraphMemory`.
   */
  addRecord(
    params: Omit<MemoryRecord, "roomId" | "createdAt"> & { createdAt?: string }
  ): MemoryRecord {
    const record: MemoryRecord = {
      roomId: this.roomId,
      createdAt: new Date().toISOString(),
      ...params,
    };
    this.records.push(record);
    return record;
  }

  /**
   * Return stored records, optionally filtered by category.
   */
  getRecords(filter?: { category?: MemoryRecord["category"]; sourceId?: string }): MemoryRecord[] {
    let results = [...this.records];
    if (filter?.category !== undefined) {
      results = results.filter((r) => r.category === filter.category);
    }
    if (filter?.sourceId !== undefined) {
      results = results.filter((r) => r.sourceId === filter.sourceId);
    }
    return results;
  }

  // ─── Markdown Writer ───────────────────────────────────────────

  /**
   * Build a `MeetingSummary` from the stored records.
   *
   * The returned `markdown` field contains a structured Markdown document
   * ready to be written to `summary.md`.
   */
  buildSummary(options?: {
    title?: string;
    participants?: string[];
  }): MeetingSummary {
    const now = new Date().toISOString();
    const title = options?.title ?? `Meeting ${this.meetingId}`;
    const participants = options?.participants ?? [];

    const logRecords = this.records.filter((r) => r.category === "log");
    const summaryRecords = this.records.filter((r) => r.category === "summary");

    const participantSection =
      participants.length > 0
        ? `## Participants\n\n${participants.map((p) => `- ${p}`).join("\n")}\n\n`
        : "";

    const summarySection =
      summaryRecords.length > 0
        ? `## Summary\n\n${summaryRecords
            .map((r) => `- [${r.sourceId}] ${renderContent(r.content)}`)
            .join("\n")}\n\n`
        : "";

    const logSection =
      logRecords.length > 0
        ? `## Log\n\n${logRecords
            .map((r) => `- \`${r.createdAt}\` [${r.sourceId}] ${renderContent(r.content)}`)
            .join("\n")}\n\n`
        : "";

    const tagsUsed = Array.from(
      new Set(this.records.flatMap((r) => r.tags ?? []))
    );
    const tagsSection =
      tagsUsed.length > 0
        ? `## Tags\n\n${tagsUsed.map((t) => `#${t}`).join(" ")}\n`
        : "";

    const markdown =
      `# ${title}\n\n` +
      `> Room: ${this.roomId} | Meeting: ${this.meetingId} | Generated: ${now}\n\n` +
      participantSection +
      summarySection +
      logSection +
      tagsSection;

    return {
      roomId: this.roomId,
      meetingId: this.meetingId,
      generatedAt: now,
      markdown,
    };
  }

  // ─── Graph Memory Builder ──────────────────────────────────────

  /**
   * Build a `GraphMemory` object from the stored records.
   *
   * - Each unique `sourceId` becomes an **agent** node.
   * - Each record becomes a node of its `category` type.
   * - Each tag becomes a **concept** node.
   * - Edges link sources → records and records → tags.
   */
  buildGraphMemory(): GraphMemory {
    const now = new Date().toISOString();
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeIds = new Set<string>();

    const addNode = (node: GraphNode) => {
      if (!nodeIds.has(node.id)) {
        nodes.push(node);
        nodeIds.add(node.id);
      }
    };

    for (const record of this.records) {
      // Source (agent) node
      const sourceNodeId = `agent:${record.sourceId}`;
      addNode({
        id: sourceNodeId,
        label: record.sourceId,
        type: "agent",
      });

      // Record node
      const recordNodeId = `record:${record.recordId}`;
      addNode({
        id: recordNodeId,
        label: record.recordId,
        type: record.category === "log" ? "message" : "concept",
        properties: {
          category: record.category,
          createdAt: record.createdAt,
        },
      });

      // Edge: agent → record
      edges.push({
        id: `${sourceNodeId}→${recordNodeId}`,
        source: sourceNodeId,
        target: recordNodeId,
        relation: "produced",
      });

      // Tag nodes + edges
      for (const tag of record.tags ?? []) {
        const tagNodeId = `tag:${tag}`;
        addNode({ id: tagNodeId, label: tag, type: "concept" });
        edges.push({
          id: `${recordNodeId}→${tagNodeId}`,
          source: recordNodeId,
          target: tagNodeId,
          relation: "tagged_as",
        });
      }
    }

    return {
      roomId: this.roomId,
      meetingId: this.meetingId,
      generatedAt: now,
      nodes,
      edges,
    };
  }

  // ─── Obsidian Sync Adapter ─────────────────────────────────────

  /**
   * Build the payload needed to sync outputs to an Obsidian Vault.
   *
   * @param vaultPath Absolute or relative path to the Obsidian vault root.
   * @param summary   Result of {@link buildSummary}.
   * @param graph     Result of {@link buildGraphMemory}.
   */
  buildObsidianSyncPayload(
    vaultPath: string,
    summary: MeetingSummary,
    graph: GraphMemory
  ): ObsidianSyncPayload {
    return { vaultPath, summary, graph };
  }
}
