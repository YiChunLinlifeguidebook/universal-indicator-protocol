Changelog

v0.3.0 - 2026-04-05

- Added TypeScript project configuration (package.json, tsconfig.json)
  - ES module output targeting ES2020
  - NodeNext module resolution to support .js import extensions
  - `npm run typecheck` — zero-error type check across all source files
- Added GitHub Actions CI workflow (.github/workflows/ci.yml)
  - Runs TypeScript type check on every pull request targeting main
- Added GitHub Actions auto-approve workflow (.github/workflows/auto-approve.yml)
  - Automatically approves pull requests when CI passes
  - Triggered by workflow_run on CI completion

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
