import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    video: process.env.PLAYWRIGHT_VIDEO ? "on" : "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "pnpm sous infra exec pnpm --filter @sous/api run start:dev",
      url: "http://localhost:4000/docs",
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm sous infra exec pnpm --filter @sous/web run dev",
      url: "http://localhost:3000",
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm sous infra exec pnpm --filter @sous/web run dev -- --port 1423",
      url: "http://localhost:1423",
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm sous infra exec pnpm --filter @sous/web run dev -- --port 1424",
      url: "http://localhost:1424",
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
