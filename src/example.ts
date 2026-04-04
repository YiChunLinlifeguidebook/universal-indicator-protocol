import type { RawEvent, NormalizedMetric, FeatureSet, IndicatorResult } from "./types";

const rawEvent: RawEvent = {
  source: "store-ops",
  entityId: "store-001",
  timestamp: "2026-04-04T15:00:00Z",
  payload: {
    customerCount: 12,
    previousDayCount: 30,
  },
};

const normalizedMetric: NormalizedMetric = {
  entityId: rawEvent.entityId,
  metricName: "customer_count_ratio",
  value: 0.4,
  unit: "ratio",
  timestamp: rawEvent.timestamp,
  quality: "warn",
};

const featureSet: FeatureSet = {
  entityId: rawEvent.entityId,
  timestamp: rawEvent.timestamp,
  features: {
    customer_count_ratio: 0.4,
    drop_from_baseline: 0.6,
  },
};

const indicatorResult: IndicatorResult = {
  indicatorId: "traffic-monitor-v1",
  entityId: rawEvent.entityId,
  value: 0.4,
  score: 35,
  state: "low-traffic",
  direction: "down",
  confidence: 0.88,
  severity: "medium",
  summary: "Customer traffic dropped significantly. Recommend promotional action.",
  timestamp: rawEvent.timestamp,
  version: "0.1.0",
};

console.log("=== UIP Normalized Indicator Output Example ===");
console.log("\nRaw Event:");
console.log(JSON.stringify(rawEvent, null, 2));
console.log("\nNormalized Metric:");
console.log(JSON.stringify(normalizedMetric, null, 2));
console.log("\nFeature Set:");
console.log(JSON.stringify(featureSet, null, 2));
console.log("\nIndicator Result:");
console.log(JSON.stringify(indicatorResult, null, 2));
