export type RawEvent = {
  source: string;
  entityId: string;
  timestamp: string;
  payload: Record<string, unknown>;
};

export type NormalizedMetric = {
  entityId: string;
  metricName: string;
  value: number | string | boolean;
  unit?: string;
  timestamp: string;
  quality?: "good" | "warn" | "bad";
};

export type FeatureSet = {
  entityId: string;
  timestamp: string;
  features: Record<string, number>;
};

export type IndicatorResult = {
  indicatorId: string;
  entityId: string;
  value: number;
  score?: number;
  state?: string;
  direction?: "up" | "down" | "flat";
  confidence?: number;
  severity?: "low" | "medium" | "high" | "critical";
  summary?: string;
  timestamp: string;
  version: string;
};
