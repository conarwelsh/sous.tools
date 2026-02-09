import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  const randomEmail = `chef-${Math.random().toString(36).substring(7)}@sous.tools`;

  test("should register a new organization and user", async ({ page }) => {
    await page.goto("/register");

    await page.fill(
      'input[placeholder="Kitchen Intelligence Ltd"]',
      "Test Kitchen",
    );
    await page.fill('input[placeholder="Auguste"]', "Test");
    await page.fill('input[placeholder="Escoffier"]', "Chef");
    await page.fill('input[placeholder="chef@sous.tools"]', randomEmail);
    await page.fill('input[placeholder="••••••••"]', "password123");

    await page.click("text=Create Account");

    // Should redirect to login
    await expect(page).toHaveURL("/login");
  });

  test("should login with the new user", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[placeholder="chef@sous.tools"]', randomEmail);
    await page.fill('input[placeholder="••••••••"]', "password123");

    await page.click("text=Sign In");

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("text=Dashboard")).toBeVisible();
    await expect(page.locator("text=Test Chef")).toBeVisible();
  });

  test("should logout and revoke session", async ({ page }) => {
    // 1. Login first
    await page.goto("/login");
    await page.fill('input[placeholder="chef@sous.tools"]', randomEmail);
    await page.fill('input[placeholder="••••••••"]', "password123");
    await page.click("text=Sign In");
    await expect(page).toHaveURL("/dashboard");

    // 2. Click logout
    await page.click("text=Sign Out");

    // 3. Should terminate and redirect to home
    await expect(page).toHaveURL("/");

    // 4. Try to go back to dashboard - should redirect to login
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/login");
  });
});
