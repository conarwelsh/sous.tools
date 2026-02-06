import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter @sous/api run start:dev',
      url: 'http://localhost:4000/reference',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'pnpm --filter @sous/web run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'pnpm --filter @sous/kds run dev',
      url: 'http://localhost:1423',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'pnpm --filter @sous/pos run dev',
      url: 'http://localhost:1424',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
