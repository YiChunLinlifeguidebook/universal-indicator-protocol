Changelog

v0.3.0 - 2026-04-07

- Added `InputMode` type (`"keyboard" | "voice" | "hybrid"`) to the Event Bus
- Extended `MessageEvent.payload` with optional `inputMode` field to support hybrid voice + keyboard input
- Updated architecture documentation to describe `InputMode` options
- Exported `InputMode` from the event-bus public surface

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
