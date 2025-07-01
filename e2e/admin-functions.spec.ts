
import { test, expect } from '@playwright/test';

test.describe('Admin Functions', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
  });

  test('should access admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
    
    // Check admin controls
    await expect(page.locator('text=Real-Time Monitor')).toBeVisible();
    await expect(page.locator('text=User Management')).toBeVisible();
  });

  test('should create new election', async ({ page }) => {
    await page.goto('/admin');
    
    await page.click('text=Create Election');
    await page.fill('input[name="title"]', 'Test Election');
    await page.fill('textarea[name="description"]', 'A test election');
    
    // Set dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('input[type="datetime-local"]', tomorrow.toISOString().slice(0, 16));
    
    await page.click('text=Create');
    
    await expect(page.locator('text=Election created successfully')).toBeVisible();
  });

  test('should monitor real-time voting', async ({ page }) => {
    await page.goto('/admin/monitor');
    
    // Check real-time components
    await expect(page.locator('text=Active Elections')).toBeVisible();
    await expect(page.locator('text=Vote Count')).toBeVisible();
    await expect(page.locator('text=Blockchain Status')).toBeVisible();
    
    // Should update automatically
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="last-updated"]')).toBeVisible();
  });
});
