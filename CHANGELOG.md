Changelog

v0.3.0 - 2026-04-05

- Implemented StateManager class (state-manager component)
  - registerAgent / removeAgent / setAgentStatus / getAgentState
  - requestSpeak / cancelSpeakRequest / grantNextSpeaker / releaseSpeaker
  - Priority-ordered speaking queue with tie-breaking by requestedAt
  - getRoomState snapshot
- Implemented TaskEngine class (task-engine component)
  - createTask / getTask / listTasks
  - assignTask / handoffTask / completeTask / failTask / cancelTask
  - Immutable TaskEvent log
  - Handoff Router with regex/pattern-based routing rules (addHandoffRule / removeHandoffRule)
- Implemented MemoryAdapter class (memory-adapter component)
  - addRecord / getRecords with category & sourceId filtering
  - buildSummary — Markdown Writer producing structured summary.md content
  - buildGraphMemory — Graph Memory Builder producing graph_memory.json content
  - buildObsidianSyncPayload — Obsidian Sync Adapter payload construction

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
