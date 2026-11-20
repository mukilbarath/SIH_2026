export const MODES = ['physics', 'healthy', 'faults', 'scenarios'] as const;
export type Mode = typeof MODES[number];
export const NUMERIC_FIELDS = [
  'time_s', 'sequence', 'throttle_pct', 'rpm', 'fuel_flow_lph', 'rul_hours', 'fault_severity',
  'cht_1_c', 'cht_2_c', 'cht_3_c', 'cht_4_c', 'egt_1_c', 'egt_2_c', 'egt_3_c', 'egt_4_c',
  'oil_pressure_bar', 'oil_temp_c', 'vibration_x_g', 'vibration_y_g', 'vibration_z_g',
] as const;
export type Telemetry = Record<typeof NUMERIC_FIELDS[number], number> & {
  type: 'telemetry'; schema_version: 1; mode: Mode; fault_label: string;
  provenance: 'SIMULATED'; phase: string; source_time_s: number | null; run_id: number | null;
};
export type Command = { type: 'set_throttle'; value: number } | { type: 'set_mode'; value: Mode };
export const MAX_HISTORY = 50;

export function isTelemetry(value: unknown): value is Telemetry {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  return data.type === 'telemetry' && data.schema_version === 1 && data.provenance === 'SIMULATED'
    && MODES.includes(data.mode as Mode)
    && typeof data.fault_label === 'string' && data.fault_label.length > 0 && data.fault_label.length <= 100
    && typeof data.phase === 'string' && data.phase.length <= 100
    && ['source_time_s', 'run_id'].every(k => data[k] === null || (typeof data[k] === 'number' && Number.isFinite(data[k])))
    && NUMERIC_FIELDS.every(k => typeof data[k] === 'number' && Number.isFinite(data[k]))
    && (data.throttle_pct as number) >= 0 && (data.throttle_pct as number) <= 100
    && (data.fault_severity as number) >= 0 && (data.fault_severity as number) <= 1
    && (data.rpm as number) >= 0 && (data.rul_hours as number) >= 0;
}

export function appendHistory(history: Telemetry[], sample: Telemetry): Telemetry[] {
  const last = history.at(-1);
  // Never draw a continuous chart across unrelated modes, source runs or replay wraps.
  if (last && (last.mode !== sample.mode || last.run_id !== sample.run_id || sample.sequence <= last.sequence
    || (sample.source_time_s !== null && last.source_time_s !== null && sample.source_time_s < last.source_time_s))) return [sample];
  return [...history, sample].slice(-MAX_HISTORY);
}

export function isHealthy(data: Telemetry) { return data.fault_label === 'HEALTHY' && data.fault_severity === 0; }

export function telemetryCsv(samples: Telemetry[]): string {
  const fields: (keyof Telemetry)[] = ['provenance', 'mode', 'phase', 'run_id', 'source_time_s', ...NUMERIC_FIELDS, 'fault_label'];
  const cell = (value: unknown) => {
    let text = String(value ?? '');
    if (typeof value === 'string' && /^[=+@\-\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  return [fields.join(','), ...samples.map(s => fields.map(k => cell(s[k])).join(','))].join('\r\n');
}

export function download(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
