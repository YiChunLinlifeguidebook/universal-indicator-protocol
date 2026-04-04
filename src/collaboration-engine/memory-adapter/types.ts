// ─────────────────────────────────────────────────────────────
// AI 協作會議室 — Memory Adapter Types
// ─────────────────────────────────────────────────────────────

/** A single record to be persisted in the memory layer. */
export type MemoryRecord = {
  recordId: string;
  roomId: string;
  /** Source agent or system that produced this record. */
  sourceId: string;
  category: "summary" | "graph" | "log" | "custom";
  content: unknown;
  tags?: string[];
  createdAt: string;
};

// ─── Summary Builder output ────────────────────────────────────

/** The structured output written to `summary.md`. */
export type MeetingSummary = {
  roomId: string;
  meetingId: string;
  generatedAt: string;
  /** Markdown-formatted meeting summary. */
  markdown: string;
};

// ─── Graph Memory Builder output ───────────────────────────────

/** A node in the knowledge graph. */
export type GraphNode = {
  id: string;
  label: string;
  type: "agent" | "task" | "message" | "concept" | "custom";
  properties?: Record<string, unknown>;
};

/** A directed edge in the knowledge graph. */
export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  relation: string;
  weight?: number;
};

/** The structured output written to `graph_memory.json`. */
export type GraphMemory = {
  roomId: string;
  meetingId: string;
  generatedAt: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
};

// ─── Obsidian Sync Adapter ─────────────────────────────────────

/** Sync request passed to the Obsidian Sync Adapter. */
export type ObsidianSyncPayload = {
  vaultPath: string;
  summary: MeetingSummary;
  graph: GraphMemory;
};
