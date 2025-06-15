
import { test, expect } from '@playwright/test';

test.describe('Biometric Authentication', () => {
  test('should handle camera permission', async ({ page, context }) => {
    // Grant camera permissions
    await context.grantPermissions(['camera']);
    
    await page.goto('/face-register');
    
    // Check if camera feed is visible
    await expect(page.locator('video')).toBeVisible();
    
    // Mock face detection
    await page.evaluate(() => {
      const video = document.querySelector('video');
      if (video) {
        Object.defineProperty(video, 'videoWidth', { value: 640 });
        Object.defineProperty(video, 'videoHeight', { value: 480 });
      }
    });
    
    await page.click('text=Register Face');
    
    // Should show progress
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
  });

  test('should handle camera permission denial', async ({ page, context }) => {
    // Deny camera permissions
    await context.grantPermissions([]);
    
    await page.goto('/face-register');
    
    // Should show error message
    await expect(page.locator('text=Camera access denied')).toBeVisible();
  });

  test('should complete enhanced biometric registration', async ({ page, context }) => {
    await context.grantPermissions(['camera']);
    
    await page.goto('/enhanced-biometric-register');
    
    // Mock successful face detection and quality
    await page.evaluate(() => {
      window.mockBiometricSuccess = true;
    });
    
    await page.click('text=Start Enhanced Registration');
    
    // Should show security features
    await expect(page.locator('text=Liveness Detection')).toBeVisible();
    await expect(page.locator('text=Anti-Spoofing')).toBeVisible();
    
    // Complete registration
    await page.waitForSelector('text=Registration Complete', { timeout: 10000 });
  });
});
