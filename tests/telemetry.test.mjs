import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isTelemetry, appendHistory, telemetryCsv, isHealthy } from '../lib/telemetry.ts';
const sample = JSON.parse(readFileSync(new URL('./fixtures/telemetry.json', import.meta.url)));
test('accepts producer contract and rejects missing, non-finite and mistyped fields', () => {
  assert.equal(isTelemetry(sample), true);
  for (const bad of [null, [], {}, {...sample, rpm: '500'}, {...sample, rpm: Infinity}, {...sample, mode:'unknown'}, {...sample, fault_severity:2}]) assert.equal(isTelemetry(bad), false);
});
test('history is bounded and resets at mode/run/replay boundaries', () => {
  let history = [];
  for (let sequence=1; sequence<=100; sequence++) history=appendHistory(history, {...sample,sequence});
  assert.equal(history.length,50);
  for (const update of [{mode:'faults'}, {run_id:200}, {sequence:0}]) assert.equal(appendHistory(history,{...sample,sequence:101,...update}).length,1);
  assert.equal(appendHistory([{...sample,source_time_s:5}],{...sample,sequence:2,source_time_s:0}).length,1);
});
test('fault status never calls a labelled low-severity fault healthy', () => {
  assert.equal(isHealthy(sample),true);
  assert.equal(isHealthy({...sample, fault_label:'OIL_PRESSURE_LOSS', fault_severity:0.1}),false);
});
test('CSV escapes quotes and neutralizes formula strings', () => {
  const csv=telemetryCsv([{...sample, fault_label:'=HYPERLINK("example")'}]);
  assert.ok(csv.includes('"\'=HYPERLINK(""example"")"'));
  assert.ok(csv.includes('SIMULATED'));
});
