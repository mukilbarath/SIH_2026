import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', fullyParallel: false, workers: 1,
  use: { baseURL: 'http://127.0.0.1:3000', trace: 'retain-on-failure', video: 'on', ...devices['Desktop Chrome'] },
  webServer: [
    { command: 'npm run start', url: 'http://127.0.0.1:3000', reuseExistingServer: false, timeout: 120000 },
    { command: `"${process.env.PYTHON || 'python'}" server/mavlink_sitl.py`, port: 3002, reuseExistingServer: false, timeout: 30000 },
  ],
});
