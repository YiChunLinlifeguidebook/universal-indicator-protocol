Changelog

v0.4.0 - 2026-04-15

- Consolidated all pending changes into unified release
- Added TypeScript project configuration (package.json, tsconfig.json)
  - ES module output targeting ES2020 with NodeNext module resolution
  - `npm run typecheck` passes clean across all source files
- Added GitHub Actions CI workflow (.github/workflows/ci.yml)
  - Runs TypeScript type check on every pull request targeting main
- Added GitHub Actions auto-approve workflow (.github/workflows/auto-approve.yml)
  - Automatically approves pull requests when CI passes
- Added UIP protocol types (src/types.ts, src/index.ts, src/example.ts)
- Implemented StateManager class (state-manager component)
  - registerAgent / removeAgent / setAgentStatus / getAgentState
  - requestSpeak / cancelSpeakRequest / grantNextSpeaker / releaseSpeaker
  - Priority-ordered speaking queue with tie-breaking by requestedAt
  - getRoomState snapshot
- Implemented TaskEngine class (task-engine component)
  - createTask / getTask / listTasks
  - assignTask / handoffTask / completeTask / failTask / cancelTask
  - Immutable TaskEvent log
  - Handoff Router with regex/pattern-based routing rules
- Implemented MemoryAdapter class (memory-adapter component)
  - addRecord / getRecords with category & sourceId filtering
  - buildSummary — Markdown Writer producing structured summary.md content
  - buildGraphMemory — Graph Memory Builder producing graph_memory.json content
  - buildObsidianSyncPayload — Obsidian Sync Adapter payload construction
- Added top-level collaboration-engine/index.ts entry point
- Added `InputMode` type (`"keyboard" | "voice" | "hybrid"`) to the Event Bus
  - Extended `MessageEvent.payload` with optional `inputMode` field
- Added `follow_activity` event type and `FollowActivityEvent` to the Event Bus
- Added GitHub Activity Monitor module (src/github-activity/)
  - FollowerWatcher: monitors GitHub follower changes with pagination
  - Produces FollowerActivityReport with Chinese-language summary
- Added Cloudflare Pages commercial website (website/)
  - Dark-theme landing page with product positioning and demo
  - Security-hardened HTTP headers and redirect rules
  - Wrangler CLI deployment configuration

v0.2.0 - 2026-04-04

- Added AI 協作會議室（AI Collaboration Meeting Room）architecture blueprint
- Added Event Bus component with full TypeScript types and EventBus class
  - Supported events: message, request_speak, grant_speak, handoff_task, task_result, memory_write_request
- Added State Manager types (AgentState, SpeakRequest, SpeakingPermission, RoomState)
- Added Task Engine types (Task, TaskEvent, HandoffRule)
- Added Memory Adapter types (MemoryRecord, MeetingSummary, GraphMemory, ObsidianSyncPayload)
- Added Memory Storage Layer schema (Meeting, Agent, Task, TaskEvent, MemoryRecord, StateHistory)
- Added architecture documentation under docs/ai-collaboration-room/

v0.1.0 - 2026-04-04

- Initial public release of the Universal Indicator Protocol
- Added public architecture definition
- Added protocol contracts
- Added minimal TypeScript skeleton
- Added normalized indicator output example
