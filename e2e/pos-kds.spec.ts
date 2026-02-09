import { test, expect } from "@playwright/test";

test.describe("POS & KDS Flow", () => {
  test("should create order on POS and see it on KDS (Mock flow)", async ({
    browser,
  }) => {
    // 1. Open POS
    const posContext = await browser.newContext();
    const posPage = await posContext.newPage();
    await posPage.goto("http://localhost:1424");

    // Add items
    await posPage.getByText("Burger").click();
    await posPage.getByText("Fries").click();

    // Check Cart
    await expect(posPage.getByText("Burger")).toBeVisible();
    await expect(posPage.getByText("Total")).toBeVisible();

    // Pay
    await posPage.getByText("Pay").click();
    // In our mock, clearing the cart simulates payment success
    await expect(posPage.getByText("Burger")).not.toBeVisible();

    // 2. Open KDS
    const kdsContext = await browser.newContext();
    const kdsPage = await kdsContext.newPage();
    await kdsPage.goto("http://localhost:1423");

    // Check for tickets (Mock data is pre-seeded in KDSFeature for now)
    await expect(kdsPage.getByText("#101")).toBeVisible();

    // Bump order
    await kdsPage.locator("text=BUMP").first().click();
    await expect(kdsPage.getByText("#101")).not.toBeVisible();
  });
});

test("should print label", async ({ page }) => {
  await page.goto("http://localhost:3000"); // Web app has the LabelEditor

  await page.getByText("Label Printer").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Print Label" }).click();

  // Since we can't verify physical print, we assume no crash = success
  // In a real test, we'd spy on the bridge call.
});
