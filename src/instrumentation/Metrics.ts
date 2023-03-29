export interface Metrics {
  gauge(metric: string, value: number);
  increment(metric: string, tags: Record<string, number | string>);
}

export class DatadogMetrics implements Metrics {
  gauge(metric: string, value: number) {}
  increment(metric: string, tags: Record<string, number | string>) {}
}
