/**
 * AUTO-GENERATED from scenarios.ts — 2026-02-25
 * Do not edit manually.
 *
 * Uses data-testid selectors matching actual React Native testID props.
 * Handles: onboarding gate, hidden OTP input, role-select navigation.
 */

import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = 'test@daterabbit.com';
const TEST_OTP = '00000000';

// Helper: locate by testID
const tid = (page: Page, id: string) => page.locator(`[data-testid="${id}"]`);

// Helper: go to welcome screen (skip onboarding if needed)
async function goToWelcome(page: Page) {
  await page.goto('/');
  await page.waitForTimeout(2000);
  const skipBtn = tid(page, 'onboarding-skip');
  if (await skipBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await skipBtn.click();
    await page.waitForTimeout(1500);
  }
}

// Helper: navigate to login screen
async function goToLogin(page: Page) {
  await goToWelcome(page);
  await page.getByText('Sign in', { exact: true }).click();
  await page.waitForTimeout(1500);
}

// Helper: fill the hidden OTP input (opacity:0, height:0)
async function fillOtp(page: Page, code: string) {
  // The OTP input is hidden — click the visible code boxes area to focus it, then type
  const codeContainer = page.locator('[data-testid="otp-code-input"]');
  await codeContainer.focus();
  await page.keyboard.type(code);
  await page.waitForTimeout(500);
}

// Helper: full login flow (welcome → login → OTP → authenticated)
async function login(page: Page) {
  await goToLogin(page);
  await tid(page, 'login-email-input').fill(TEST_EMAIL);
  await tid(page, 'login-continue-btn').click();
  await page.waitForTimeout(2000);
  await fillOtp(page, TEST_OTP);
  await tid(page, 'otp-verify-btn').click();
  await page.waitForTimeout(3000);
}

// =============================================
// PHASE 1: CRITICAL — Auth & Navigation
// =============================================

test.describe('Phase 1: Critical', () => {

  test('Welcome - Page Loads', async ({ page }) => {
    await goToWelcome(page);
    await expect(page.getByText('Real dates')).toBeVisible();
    await expect(tid(page, 'welcome-seeker-btn')).toBeVisible();
    await expect(tid(page, 'welcome-companion-btn')).toBeVisible();
    await expect(page.getByText('Sign in', { exact: true })).toBeVisible();
  });

  test('Welcome - Find Companions navigates to Role Select', async ({ page }) => {
    await goToWelcome(page);
    await tid(page, 'welcome-seeker-btn').click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/02-after-seeker-btn.png' });
    // Both buttons navigate to role-select
    await expect(page).toHaveURL(/role-select/);
  });

  test('Welcome - Become Companion navigates to Role Select', async ({ page }) => {
    await goToWelcome(page);
    await tid(page, 'welcome-companion-btn').click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/03-after-companion-btn.png' });
    await expect(page).toHaveURL(/role-select/);
  });

  test('Login - Full OTP Flow', async ({ page }) => {
    await login(page);
    await page.screenshot({ path: 'test-results/04-after-login.png' });
  });

  test('Login - Invalid OTP', async ({ page }) => {
    await goToLogin(page);
    await tid(page, 'login-email-input').fill(TEST_EMAIL);
    await tid(page, 'login-continue-btn').click();
    await page.waitForTimeout(2000);
    await fillOtp(page, '99999999');
    await tid(page, 'otp-verify-btn').click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/otp/);
  });

  test('Login - Empty Email Validation', async ({ page }) => {
    await goToLogin(page);
    await tid(page, 'login-continue-btn').click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/login/);
  });

  test('OTP - Resend Code', async ({ page }) => {
    await goToLogin(page);
    await tid(page, 'login-email-input').fill(TEST_EMAIL);
    await tid(page, 'login-continue-btn').click();
    await page.waitForTimeout(2000);
    await tid(page, 'otp-resend-btn').click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/07-otp-resent.png' });
  });

  test('OTP - Back Navigation', async ({ page }) => {
    await goToLogin(page);
    await tid(page, 'login-email-input').fill(TEST_EMAIL);
    await tid(page, 'login-continue-btn').click();
    await page.waitForTimeout(2000);
    await tid(page, 'otp-back-btn').click();
    await page.waitForTimeout(1500);
    await expect(page.getByText('Welcome back')).toBeVisible();
  });
});

// =============================================
// PHASE 2: IMPORTANT — Post-Auth Flows
// =============================================

test.describe('Phase 2: Post-Auth', () => {

  test('Browse Companions - Page Loads', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/10-browse-page.png' });
    await expect(tid(page, 'browse-search-input')).toBeVisible();
    await expect(tid(page, 'browse-filter-btn')).toBeVisible();
  });

  test('Browse Companions - Search', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    await tid(page, 'browse-search-input').fill('Test');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/11-browse-search.png' });
  });

  test('View Companion Profile', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    const profileBtn = page.locator('[data-testid^="browse-view-profile-"]').first();
    if (await profileBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await profileBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/12-companion-profile.png' });
      await expect(tid(page, 'profile-view-book-btn')).toBeVisible();
      await expect(tid(page, 'profile-view-message-btn')).toBeVisible();
    }
  });

  test('Bookings Tab - Navigation', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    await page.getByText('Bookings').click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/13-bookings-upcoming.png' });
    const pastTab = tid(page, 'bookings-tab-past');
    if (await pastTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await pastTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/14-bookings-past.png' });
    }
    const cancelledTab = tid(page, 'bookings-tab-cancelled');
    if (await cancelledTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cancelledTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/15-bookings-cancelled.png' });
    }
  });

  test('Messages - Page Loads', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    await page.getByText('Messages').click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/16-messages.png' });
  });

  test('Own Profile - Page Loads', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    await page.getByText('Profile').click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/17-profile.png' });
    await expect(tid(page, 'profile-edit-btn')).toBeVisible();
    await expect(tid(page, 'profile-signout-btn')).toBeVisible();
  });

  test('Signout Flow', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    await page.getByText('Profile').click();
    await page.waitForTimeout(1500);
    await tid(page, 'profile-signout-btn').click();
    await page.waitForTimeout(2000);
    await expect(page.getByText('Real dates')).toBeVisible();
  });
});

// =============================================
// PHASE 3: NICE-TO-HAVE — Edge Cases
// =============================================

test.describe('Phase 3: Edge Cases', () => {

  test('Onboarding - Skip', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/20-onboarding.png' });
    await tid(page, 'onboarding-skip').click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/21-after-skip.png' });
  });

  test('Onboarding - Next Through All Slides', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForTimeout(2000);
    for (let i = 2; i <= 4; i++) {
      await tid(page, 'onboarding-next').click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `test-results/2${i}-onboarding-slide${i}.png` });
    }
    await tid(page, 'onboarding-next').click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/25-after-onboarding.png' });
  });

  test('Favorite - Toggle', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    const profileBtn = page.locator('[data-testid^="browse-view-profile-"]').first();
    if (await profileBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await profileBtn.click();
      await page.waitForTimeout(2000);
      await tid(page, 'profile-view-favorite-btn').click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/26-favorite-toggled.png' });
    }
  });

  test('Booking Form - Validation', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    const bookBtn = page.locator('[data-testid^="browse-book-date-"]').first();
    if (await bookBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bookBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/27-booking-form-empty.png' });
      await tid(page, 'booking-submit-btn').click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/28-booking-validation.png' });
    }
  });

  test('Login Back - Returns to Welcome', async ({ page }) => {
    await goToLogin(page);
    await tid(page, 'login-back-btn').click();
    await page.waitForTimeout(1500);
    await expect(page.getByText('Real dates')).toBeVisible();
  });

  test('Profile - Edit Navigation', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    await page.getByText('Profile').click();
    await page.waitForTimeout(1500);
    await tid(page, 'profile-edit-btn').click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/30-edit-profile.png' });
  });

  test('Neo-Brutalism Visual Audit', async ({ page }) => {
    await goToWelcome(page);
    await page.screenshot({ path: 'test-results/40-visual-welcome.png' });
    await page.getByText('Sign in', { exact: true }).click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/41-visual-login.png' });
    await tid(page, 'login-email-input').fill(TEST_EMAIL);
    await tid(page, 'login-continue-btn').click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/42-visual-otp.png' });
  });
});
