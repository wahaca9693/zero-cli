/**
 * Telemetry Module
 */
export interface TelemetryEvent {
  name: string;
  properties?: Record<string, unknown>;
}

export function trackEvent(event: TelemetryEvent): void {
  // No-op implementation
}
