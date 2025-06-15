
import { test, expect } from '@playwright/test';

test.describe('Voting Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate through the complete voting process', async ({ page }) => {
    // Navigate to elections page
    await page.click('text=View Elections');
    await expect(page).toHaveURL('/auth');

    // Mock login process
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should redirect to biometric auth
    await expect(page).toHaveURL(/biometric/);

    // Mock biometric authentication
    await page.evaluate(() => {
      // Mock successful biometric auth
      window.localStorage.setItem('biometric_verified', 'true');
    });

    // Navigate to elections
    await page.goto('/elections');
    await expect(page.locator('h1')).toContainText('Elections');

    // Click on an election
    await page.click('text=Presidential Election 2024');
    await expect(page).toHaveURL(/election/);

    // Select a candidate
    await page.click('input[value="candidate-1"]');
    
    // Cast vote (mock wallet connection)
    await page.evaluate(() => {
      window.ethereum = {
        isMetaMask: true,
        request: () => Promise.resolve(['0x123456789']),
      };
    });

    await page.click('text=Cast Vote on Blockchain');
    
    // Verify vote confirmation
    await expect(page).toHaveURL(/vote-confirmation/);
    await expect(page.locator('text=Vote Cast Successfully')).toBeVisible();
  });

  test('should handle wallet connection', async ({ page }) => {
    await page.goto('/elections');
    
    // Mock wallet connection
    await page.evaluate(() => {
      window.ethereum = {
        isMetaMask: true,
        request: jest.fn().mockResolvedValue(['0x123456789']),
        on: jest.fn(),
        removeListener: jest.fn(),
      };
    });

    await page.click('text=Connect Wallet');
    await expect(page.locator('text=Wallet Connected')).toBeVisible();
  });

  test('should verify vote with verification code', async ({ page }) => {
    await page.goto('/verify');
    
    await page.fill('input[placeholder*="verification"]', 'TEST-VERIFICATION-CODE');
    await page.click('text=Verify Vote');
    
    await expect(page.locator('text=Vote Verified')).toBeVisible();
  });
});
