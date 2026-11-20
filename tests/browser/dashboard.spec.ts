import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const fixture = JSON.parse(readFileSync('tests/fixtures/telemetry.json', 'utf8'));

test('real simulator controls, replay, exports, navigation and mobile layout', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('status').filter({ hasText: /^Connected$/ })).toBeVisible();
  const throttle = page.getByRole('slider', { name: 'Throttle command' });
  await throttle.focus();
  await throttle.press('End');
  await expect(page.getByText('Throttle command: 100%')).toBeVisible();
  const reportDownload = page.waitForEvent('download');
  await page.getByRole('button', {name: 'Export Report'}).click();
  const report = JSON.parse(readFileSync((await (await reportDownload).path())!, 'utf8'));
  expect(report.samples.length).toBeGreaterThan(0);
  expect(report.samples[0].provenance).toBe('SIMULATED');
  await page.getByRole('button', {name: 'Datasets',exact:true}).click();
  for (const name of ['train_healthy.csv', 'train_faults.csv', 'test_scenarios.csv']) {
    const mode = page.getByRole('button').filter({hasText:name});
    await mode.click();
    await expect(mode).toHaveAttribute('aria-pressed','true');
  }
  await page.getByRole('button', {name:'Dashboard',exact:true}).click();
  await expect(throttle).toBeDisabled();
  await page.getByRole('button', {name:'Trend Logs',exact:true}).click();
  const csvDownload=page.waitForEvent('download');
  await page.getByRole('button',{name:'Export CSV'}).click();
  expect(readFileSync((await (await csvDownload).path())!, 'utf8')).toContain('SIMULATED');
  await page.getByRole('button', {name:'Real-time Analytics',exact:true}).click();
  await expect(page.getByText('Illustrative Fuel Flow / RPM Ratio')).toBeVisible();
  await page.getByRole('button', {name:'Fault Detection',exact:true}).click();
  await expect(page.getByText('Source Fault Severity')).toBeVisible();
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button', {name:'System Config',exact:true}).click();
  await expect(page.getByText('System Configuration', {exact:true})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({path:'docs/assets/mobile.png',fullPage:true});
  await page.setViewportSize({width:1440,height:1000});
  await page.getByRole('button', {name:'Dashboard',exact:true}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.screenshot({ path: 'docs/assets/dashboard.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('invalid messages, low-severity fault, stale data and reconnect', async ({page}) => {
  let connections=0;
  await page.routeWebSocket('ws://127.0.0.1:3002', ws => {
    connections++;
    ws.send('{broken');
    if (connections>1) {
      ws.send(JSON.stringify({...fixture, fault_label:'OIL_PRESSURE_LOSS',fault_severity:0.1}));
      return;
    }
    ws.send(JSON.stringify(fixture));
    // Leave the socket open without telemetry to exercise the stale-data watchdog.
  });
  await page.goto('/');
  await expect(page.getByRole('status').filter({hasText:/^Connected$/})).toBeVisible();
  await expect.poll(() => connections, {timeout:10000}).toBeGreaterThan(1);
  await page.getByRole('button',{name:'Fault Detection',exact:true}).click();
  await expect(page.getByText('Source Fault: OIL_PRESSURE_LOSS')).toBeVisible();
});

test('disconnected controls remain unavailable', async ({page}) => {
  await page.routeWebSocket('ws://127.0.0.1:3002', ws => ws.close());
  await page.goto('/');
  await expect(page.getByRole('slider')).toBeDisabled();
  await expect(page.getByRole('button',{name:'Export Report'})).toBeDisabled();
});
