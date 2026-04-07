# Architecture

## Pipeline

Data Sources
→ Ingestion Layer
→ Normalization Layer
→ Feature Extraction Layer
→ Indicator Engine
→ Scoring Layer
→ Output Interface
→ Output / API / Logs

## Layer Summary

1. **Data Sources**

   Any heterogeneous raw data source, such as:
   
   - market data
   - telemetry
   - business metrics
   - sensor data
   - event streams
   - text-derived signals

2. **Ingestion Layer**

   Responsible for receiving raw events from APIs, webhooks, polling jobs, queues, or files.

3. **Normalization Layer**

   Converts raw events into a canonical metric structure.

4. **Feature Extraction Layer**

   Derives machine-usable features from normalized metrics.

5. **Indicator Engine**

   Computes structured indicator results from feature sets.

6. **Scoring Layer**

   Maps numeric results into graded, human-readable states.

7. **Decision Interface**

   Outputs a standardized bundle that can be consumed by downstream systems.

## 中文摘要

這套架構的目的不是單純展示資料，
而是把各種來源的原始資料，轉成統一可讀、可比、可追蹤的技術指標，
作為下游系統的中介層。