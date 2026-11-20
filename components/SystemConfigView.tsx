'use client';
import { TELEMETRY_URL } from '@/hooks/useTelemetry';
export default function SystemConfigView() {
  return <section className="panel">
    <h2>System Configuration</h2>
    <p>This local session uses shared simulator state. Controls affect every connected browser.</p>
    <dl className="config-list">
      <dt>Telemetry endpoint</dt><dd>{TELEMETRY_URL}</dd>
      <dt>Simulation cadence</dt><dd>Target 10 samples/second; delivery depends on host load.</dd>
      <dt>Engine model</dt><dd>Illustrative four-cylinder model; V-4 visualization is schematic.</dd>
      <dt>Data window</dt><dd>Most recent 50 samples; resets on mode/run changes and reconnects.</dd>
      <dt>Configuration</dt><dd>Set NEXT_PUBLIC_TELEMETRY_URL before starting or building the dashboard. See README for server settings.</dd>
      <dt>Validation status</dt><dd>No real-engine calibration, trained fault classifier, or validated remaining-life prediction.</dd>
    </dl>
  </section>;
}
