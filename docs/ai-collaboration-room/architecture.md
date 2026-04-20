# AI 協作會議室 — Architecture Blueprint

## 1. 系統總覽

AI 協作會議室是一個多代理（Multi-Agent）協作平台，讓多個 AI 與使用者能在同一個會議室中協作、分工、交接任務、管理記憶、產生會議紀錄、跨平台同步。

系統由三層組成：

| 層級 | 名稱 | 說明 |
|------|------|------|
| 1 | Frontend Layer（前端層） | 跨平台使用者介面 |
| 2 | Collaboration Engine（協作引擎） | 事件驅動的多代理協作核心 |
| 3 | Memory Storage Layer（記憶儲存層） | Obsidian Vault + 關聯式資料庫 |

```
┌─────────────────────────────────────────┐
│             Frontend Layer              │
│  Android │ iOS │ Web PWA │ Electron │   │
│                         Word Add-in     │
└──────────────┬──────────────────────────┘
               │  WebSocket / HTTPS
┌──────────────▼──────────────────────────┐
│          Collaboration Engine           │
│  Event Bus │ State Manager │            │
│  Task Engine │ Memory Adapter           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Memory Storage Layer            │
│  Obsidian Vault │ PostgreSQL / SQLite   │
└─────────────────────────────────────────┘
```

---

## 2. 協作引擎核心組件

### 2.1 Event Bus（事件總線）

負責在所有代理與使用者之間傳遞事件，採發布／訂閱模式（Pub/Sub）。

**事件類型：**

| 事件 | 說明 |
|------|------|
| `message` | 一般訊息廣播（支援 `inputMode`：`keyboard` / `voice` / `hybrid`） |
| `request_speak` | 代理申請發言權 |
| `grant_speak` | 系統授予發言權 |
| `handoff_task` | 將任務移交給其他代理 |
| `task_result` | 任務完成並回傳結果 |
| `memory_write_request` | 請求將內容寫入記憶層 |

**InputMode（訊息輸入模式）：**

`message` 事件的 payload 支援可選的 `inputMode` 欄位，讓前端標記訊息的輸入方式：

| `inputMode` | 說明 |
|-------------|------|
| `"keyboard"` | 純鍵盤輸入（預設值） |
| `"voice"` | 純語音輸入（語音轉文字） |
| `"hybrid"` | 語音與鍵盤混合輸入（可同時講話與打字） |

---

### 2.2 State Manager（狀態管理）

維護所有代理的即時狀態，並控制發言佇列。

**子模組：**

- **Agent State** — 追蹤每個代理的目前狀態（idle / speaking / working / waiting）
- **Queue Manager** — 管理發言申請佇列，依優先序授權
- **Speaking Permission** — 保存目前持有發言權的代理

---

### 2.3 Task Engine（任務交接）

負責任務的建立、分配、移交與完成追蹤。

**子模組：**

- **Task Registry** — 儲存所有任務的定義與狀態
- **TaskEvent Log** — 記錄每個任務生命週期中的事件
- **Handoff Router** — 依規則將任務路由至正確的代理

---

### 2.4 Memory Adapter（記憶適配器）

將協作過程中產生的資料轉換並寫入記憶儲存層。

**子模組：**

- **Markdown Writer** — 將摘要輸出為 `summary.md`
- **Graph Memory Builder** — 將關聯資料輸出為 `graph_memory.json`
- **Obsidian Sync Adapter** — 將輸出同步至 Obsidian Vault

---

## 3. 記憶輸出流程（Memory Export Pipeline）

```
Messages / Tasks / MemoryRecord
        │
        ▼
  Summary Builder
        │
        ▼
   summary.md
        │
        ├─────────────────────────┐
        │                         │
TaskEvent / AgentState /          │
EventLog                          │
        │                         │
        ▼                         │
  Graph Builder                   │
        │                         │
        ▼                         │
graph_memory.json                 │
        │                         │
        └──────────┬──────────────┘
                   │
                   ▼
             Obsidian Vault
```

---

## 4. 跨平台部署架構

| 平台 | 技術 |
|------|------|
| Android | Kotlin / React Native |
| iOS | Swift / React Native |
| Web PWA | Progressive Web App |
| Desktop | Electron（Mac / Windows） |
| Office | Word Add-in（Office.js） |

所有前端透過 **WebSocket**（即時）或 **HTTPS**（請求）連接至協作引擎。

---

## 5. 記憶儲存層

### 5.1 Obsidian Vault（本地或 Git Repo）

| 檔案 | 說明 |
|------|------|
| `summary.md` | 每次會議的摘要 |
| `graph_memory.json` | 知識圖譜記憶 |
| `meeting-logs/` | 完整會議紀錄 |

### 5.2 Database（PostgreSQL / SQLite）

| 表格 | 說明 |
|------|------|
| `Meeting` | 會議基本資訊 |
| `Agent` | 代理定義與設定 |
| `Task` | 任務定義 |
| `TaskEvent` | 任務生命週期事件 |
| `MemoryRecord` | 記憶條目 |
| `StateHistory` | 代理狀態歷史 |

詳細 Schema 定義見 [`src/memory-storage/schema.ts`](../../src/memory-storage/schema.ts)。
