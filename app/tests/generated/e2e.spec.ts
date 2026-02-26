/**
 * AUTO-GENERATED from scenarios.ts — 2026-02-26
 * Do not edit manually.
 *
 * Handles: onboarding gate, hidden OTP input (focus+type), role-select nav.
 */

import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = 'test@daterabbit.com';
const TEST_OTP = '000000';

const tid = (page: Page, id: string) => page.locator(`[data-testid="${id}"]`);

async function goToWelcome(page: Page) {
  await page.goto('/');
  await page.waitForTimeout(2000);
  const skipBtn = tid(page, 'onboarding-skip');
  if (await skipBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await skipBtn.click();
    await page.waitForTimeout(1500);
  }
}

async function goToLogin(page: Page) {
  await goToWelcome(page);
  await page.getByText('Sign in', { exact: true }).click();
  await page.waitForTimeout(1500);
}

async function fillOtp(page: Page, code: string) {
  // OTP input is hidden (opacity:0, h:0, w:0) — focus it, then keyboard type
  const otpInput = tid(page, 'otp-code-input');
  await otpInput.focus();
  await page.keyboard.type(code);
  await page.waitForTimeout(500);
}

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
    await expect(page).toHaveURL(/role-select/);
  });

  test('Welcome - Become Companion navigates to Role Select', async ({ page }) => {
    await goToWelcome(page);
    await tid(page, 'welcome-companion-btn').click();
    await page.waitForTimeout(1500);
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
    await fillOtp(page, '999999');
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
    await tid(page, 'onboarding-skip').click();
    await page.waitForTimeout(1500);
  });

  test('Onboarding - Next Through All Slides', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForTimeout(2000);
    for (let i = 0; i < 4; i++) {
      await tid(page, 'onboarding-next').click();
      await page.waitForTimeout(500);
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
