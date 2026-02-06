import { test, expect } from '@playwright/test';

test('should pair a device successfully', async ({ page, request }) => {
  // 1. Get a pairing code from the API
  const response = await request.post('http://localhost:4000/hardware/pairing-code', {
    data: {
      hardwareId: 'test-device-123',
      type: 'signage',
      metadata: { name: 'E2E Test Device' }
    }
  });
  expect(response.ok()).toBeTruthy();
  const { code } = await response.json();
  expect(code).toHaveLength(6);

  // 2. Navigate to the web app
  await page.goto('/');

  // 3. Enter the pairing code
  // Note: We might need to handle authentication first if the page is protected.
  // For now, let's assume it's on the home page as seen in apps/web/src/app/page.tsx
  
  const input = page.locator('input[placeholder="ABC123"]');
  await input.fill(code);

  const pairButton = page.getByRole('button', { name: 'Pair Device' });
  await pairButton.click();

  // 4. Verify success message
  await expect(page.getByText('Device paired successfully!')).toBeVisible();
});
