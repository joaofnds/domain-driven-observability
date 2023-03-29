export interface Analytics {
  track(event: string, tags: Record<string, any>);
}

export class DatadogAnalytics implements Analytics {
  track(event: string, tags: Record<string, any>) {}
}
