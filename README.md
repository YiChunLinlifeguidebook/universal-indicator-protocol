> **Project Status**
> This project is still under active revision and structural refinement.
> The public materials in this repository represent an early but usable framework baseline.
> The architecture is not finalized yet, but it is already open for technical discussion, collaboration, and early-stage commercial conversation.
>
> **專案狀態**
> 本專案目前仍在持續改版、調整架構與細化內容中。
> 此公開倉庫所呈現的是一個早期但可用的框架基線版本。
> 整體架構尚未最終定稿，但已經可以進入技術交流、合作討論與早期商談階段。

# Universal Indicator Protocol

## English
Universal Indicator Protocol is a protocol-oriented framework for transforming heterogeneous raw data into normalized, comparable, and decision-readable indicators.

It is designed as a reusable technical backbone for multiple domains, including market data, system telemetry, business metrics, sensor signals, behavioral events, and text-derived features.

This public repository presents:
- the public-facing architecture
- protocol contracts
- normalized input/output structures
- non-core implementation examples

This repository does NOT include:
- proprietary formulas
- scoring weights
- private decision policies
- commercialization logic
- reserved core implementation details

## 中文
Universal Indicator Protocol 是一套以 protocol 為導向的通用技術框架，
目的是把異質原始資料轉成可標準化、可比較、可供決策系統讀取的統一指標。

這套骨架可跨多個領域複用，包括市場資料、系統遙測、商業指標、感測器訊號、行為事件與文本衍生特徵。

這個公開倉庫目前展示的是：
- 對外公開的架構層
- protocol 介面契約
- 標準化輸入 / 輸出格式
- 非核心範例實作

這個公開倉庫不包含：
- 私有公式
- 權重邏輯
- 核心決策策略
- 商業化邏輯
- 保留中的核心實作細節

## Core Concept / 核心概念

### English
Any raw data source can enter the same pipeline:

Ingestion → Normalization → Feature Extraction → Indicator Computation → Scoring → Decision Interface

### 中文
任何原始資料來源都可以進入同一條處理管線：

資料接入 → 標準化 → 特徵萃取 → 指標計算 → 分級評分 → 決策接口

## Public Positioning / 對外定位

### English
This is not a single-domain module.
It is a reusable indicator protocol intended to serve as a universal technical layer between raw data and decision systems.

### 中文
這不是單一領域模組。
它是一個可重複使用的指標 protocol，目標是成為原始資料與決策系統之間的通用技術中介層。
