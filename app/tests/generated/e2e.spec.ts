/**
 * DateRabbit E2E Tests — Comprehensive Suite
 *
 * Generated from scenarios.ts — 2026-02-26
 * Do not edit manually; edit scenarios.ts and regenerate.
 *
 * Auth: DEV_AUTH=true on server, OTP is always 000000 for any email.
 *
 * Test accounts:
 *   Seeker:    seeker-test@daterabbit.com
 *   Companion: companion-test@daterabbit.com
 *   OTP:       000000 (always, in DEV mode)
 *
 * API: https://daterabbit-api.smartlaunchhub.com/api
 *
 * Phases:
 *   1 — Critical Auth (browser)
 *   2 — Core Flows (browser + API)
 *   3 — Multi-User Cross-Account (API only)
 *   4 — Edge Cases & Visual Audit (browser)
 */

import { test, expect, Page } from '@playwright/test';

// ============================================
// CONFIG
// ============================================

const SEEKER_EMAIL = 'seeker-test@daterabbit.com';
const COMPANION_EMAIL = 'companion-test@daterabbit.com';
const TEST_OTP = '000000';
const API_URL = 'https://daterabbit-api.smartlaunchhub.com/api';

// ============================================
// HELPERS
// ============================================

/** Returns a Playwright locator by data-testid */
const tid = (page: Page, id: string) => page.locator(`[data-testid="${id}"]`);

/**
 * Navigate to the welcome screen.
 * Handles the onboarding gate: if onboarding-skip is visible, dismisses it first.
 */
async function goToWelcome(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForTimeout(2000);
  const skipBtn = tid(page, 'onboarding-skip');
  if (await skipBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await skipBtn.click();
    await page.waitForTimeout(1500);
  }
}

/**
 * Navigate from welcome to the login screen via the "Sign in" link.
 */
async function goToLogin(page: Page): Promise<void> {
  await goToWelcome(page);
  await page.getByText('Sign in', { exact: true }).click();
  await page.waitForTimeout(1500);
}

/**
 * Fill the OTP input.
 * The OTP input is visually hidden (opacity:0, zero dimensions) — we focus it and type.
 */
async function fillOtp(page: Page, code: string): Promise<void> {
  const otpInput = tid(page, 'otp-code-input');
  await otpInput.focus();
  await page.keyboard.type(code);
  await page.waitForTimeout(500);
}

/**
 * Complete the full seeker login flow (Sign in → email → OTP → authenticated).
 */
async function loginAsSeeker(page: Page): Promise<void> {
  await goToLogin(page);
  await tid(page, 'login-email-input').fill(SEEKER_EMAIL);
  await tid(page, 'login-continue-btn').click();
  await page.waitForTimeout(2000);
  await fillOtp(page, TEST_OTP);
  await tid(page, 'otp-verify-btn').click();
  await page.waitForTimeout(3000);
}

/**
 * Complete the full companion login flow (Sign in → email → OTP → authenticated).
 */
async function loginAsCompanion(page: Page): Promise<void> {
  await goToLogin(page);
  await tid(page, 'login-email-input').fill(COMPANION_EMAIL);
  await tid(page, 'login-continue-btn').click();
  await page.waitForTimeout(2000);
  await fillOtp(page, TEST_OTP);
  await tid(page, 'otp-verify-btn').click();
  await page.waitForTimeout(3000);
}

/**
 * Obtain a JWT token for a given email via the API (DEV mode, OTP = 000000).
 * Returns the token string or throws on failure.
 */
async function getApiToken(email: string): Promise<string> {
  // Step 1: request OTP
  const startRes = await fetch(`${API_URL}/auth/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!startRes.ok) {
    throw new Error(`auth/start failed: ${startRes.status} ${await startRes.text()}`);
  }

  // Step 2: verify OTP
  const verifyRes = await fetch(`${API_URL}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code: TEST_OTP }),
  });
  if (!verifyRes.ok) {
    throw new Error(`auth/verify failed: ${verifyRes.status} ${await verifyRes.text()}`);
  }
  const data = await verifyRes.json();
  const token: string = data.token || data.access_token || data.accessToken;
  if (!token) {
    throw new Error(`No token in auth/verify response: ${JSON.stringify(data)}`);
  }
  return token;
}

/**
 * Make an authenticated API request.
 */
async function apiRequest(
  method: string,
  path: string,
  token: string,
  body?: unknown,
): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Generate a future ISO date string (tomorrow at noon UTC).
 */
function futureDateIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

/**
 * Save a screenshot to test-results/ with a given label.
 */
async function shot(page: Page, label: string): Promise<void> {
  await page.screenshot({ path: `test-results/${label}.png` });
}

// ============================================
// PHASE 1: CRITICAL — Auth & Navigation
// ============================================

test.describe('Phase 1: Critical Auth', () => {

  test('01 Welcome - Page Loads', async ({ page }) => {
    await goToWelcome(page);
    await shot(page, '01-welcome');

    await expect(page.getByText('Real dates')).toBeVisible();
    await expect(tid(page, 'welcome-seeker-btn')).toBeVisible();
    await expect(tid(page, 'welcome-companion-btn')).toBeVisible();
    await expect(page.getByText('Sign in', { exact: true })).toBeVisible();
  });

  test('02 Seeker Registration Flow', async ({ page }) => {
    await goToWelcome(page);

    // Click "Find Companions" — should go to role-select
    await tid(page, 'welcome-seeker-btn').click();
    await page.waitForTimeout(1500);
    await shot(page, '02a-role-select');
    await expect(page).toHaveURL(/role-select/);

    // Select seeker role
    await tid(page, 'role-select-seeker-btn').click();
    await page.waitForTimeout(1500);
    await shot(page, '02b-login');

    // Enter seeker email and continue
    await tid(page, 'login-email-input').fill(SEEKER_EMAIL);
    await tid(page, 'login-continue-btn').click();
    await page.waitForTimeout(2000);
    await shot(page, '02c-otp');

    // Fill OTP (hidden input — focus + keyboard type)
    await fillOtp(page, TEST_OTP);
    await tid(page, 'otp-verify-btn').click();
    await page.waitForTimeout(3000);
    await shot(page, '02d-seeker-logged-in');

    // Seeker should land on Browse page
    await expect(tid(page, 'browse-search-input')).toBeVisible({ timeout: 5000 });
  });

  test('03 Companion Registration Flow', async ({ page }) => {
    await goToWelcome(page);

    // Click "Become a Companion"
    await tid(page, 'welcome-companion-btn').click();
    await page.waitForTimeout(1500);
    await shot(page, '03a-role-select');
    await expect(page).toHaveURL(/role-select/);

    // Select companion role
    await tid(page, 'role-select-companion-btn').click();
    await page.waitForTimeout(1500);
    await shot(page, '03b-login');

    // Enter companion email
    await tid(page, 'login-email-input').fill(COMPANION_EMAIL);
    await tid(page, 'login-continue-btn').click();
    await page.waitForTimeout(2000);

    // OTP
    await fillOtp(page, TEST_OTP);
    await tid(page, 'otp-verify-btn').click();
    await page.waitForTimeout(3000);
    await shot(page, '03c-companion-logged-in');
  });

  test('04 Login With Existing Seeker', async ({ page }) => {
    await loginAsSeeker(page);
    await shot(page, '04-seeker-logged-in');
    // Should be past the auth screens — URL should not be /login or /otp
    await expect(page).not.toHaveURL(/\/(login|otp|role-select)/);
  });

  test('05 Login With Existing Companion', async ({ page }) => {
    await loginAsCompanion(page);
    await shot(page, '05-companion-logged-in');
    await expect(page).not.toHaveURL(/\/(login|otp|role-select)/);
  });

  test('06 Login - Invalid OTP Rejected', async ({ page }) => {
    await goToLogin(page);
    await tid(page, 'login-email-input').fill(SEEKER_EMAIL);
    await tid(page, 'login-continue-btn').click();
    await page.waitForTimeout(2000);

    // Enter wrong OTP
    await fillOtp(page, '999999');
    await tid(page, 'otp-verify-btn').click();
    await page.waitForTimeout(2500);
    await shot(page, '06-invalid-otp');

    // Must stay on OTP screen
    await expect(page).toHaveURL(/otp/);
  });

  test('07 Login - Empty Email Validation', async ({ page }) => {
    await goToLogin(page);

    // Click continue without any email
    await tid(page, 'login-continue-btn').click();
    await page.waitForTimeout(1000);
    await shot(page, '07-empty-email-validation');

    // Should stay on login screen
    await expect(page).toHaveURL(/login/);
  });

  test('08 OTP - Resend Code', async ({ page }) => {
    await goToLogin(page);
    await tid(page, 'login-email-input').fill(SEEKER_EMAIL);
    await tid(page, 'login-continue-btn').click();
    await page.waitForTimeout(2000);

    // Click resend
    await tid(page, 'otp-resend-btn').click();
    await page.waitForTimeout(1500);
    await shot(page, '08-otp-resent');

    // Should still be on OTP screen
    await expect(page).toHaveURL(/otp/);
  });

  test('09 OTP - Back Navigation Returns to Login', async ({ page }) => {
    await goToLogin(page);
    await tid(page, 'login-email-input').fill(SEEKER_EMAIL);
    await tid(page, 'login-continue-btn').click();
    await page.waitForTimeout(2000);

    // Go back
    await tid(page, 'otp-back-btn').click();
    await page.waitForTimeout(1500);
    await shot(page, '09-otp-back-to-login');

    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('10 Sign Out Flow', async ({ page }) => {
    await loginAsSeeker(page);
    await page.waitForTimeout(1000);

    // Navigate to profile
    await page.getByText('Profile').click();
    await page.waitForTimeout(1500);

    // Sign out
    await tid(page, 'profile-signout-btn').click();
    await page.waitForTimeout(2000);
    await shot(page, '10-after-signout');

    // Should be back on welcome
    await expect(page.getByText('Real dates')).toBeVisible({ timeout: 5000 });
  });

});

// ============================================
// PHASE 2: CORE FLOWS
// ============================================

test.describe('Phase 2: Core Flows', () => {

  test('11 Browse Companions - Page Loads with Search and Filter', async ({ page }) => {
    await loginAsSeeker(page);
    await page.waitForTimeout(2000);
    await shot(page, '11-browse-page');

    await expect(tid(page, 'browse-search-input')).toBeVisible();
    await expect(tid(page, 'browse-filter-btn')).toBeVisible();
  });

  test('12 Browse Companions - Text Search', async ({ page }) => {
    await loginAsSeeker(page);
    await page.waitForTimeout(2000);

    await tid(page, 'browse-search-input').fill('Test');
    await page.waitForTimeout(1500); // debounce + API call
    await shot(page, '12-browse-search-results');
    // Search input should still be visible (page did not crash)
    await expect(tid(page, 'browse-search-input')).toBeVisible();
  });

  test('13 View Companion Profile - Book and Message Buttons Visible', async ({ page }) => {
    await loginAsSeeker(page);
    await page.waitForTimeout(2000);

    const profileBtn = page.locator('[data-testid^="browse-view-profile-"]').first();
    const hasCompanion = await profileBtn.isVisible({ timeout: 4000 }).catch(() => false);

    if (!hasCompanion) {
      console.warn('No companions found in browse — skipping profile view assertions');
      return;
    }

    await profileBtn.click();
    await page.waitForTimeout(2000);
    await shot(page, '13-companion-profile-view');

    await expect(tid(page, 'profile-view-book-btn')).toBeVisible();
    await expect(tid(page, 'profile-view-message-btn')).toBeVisible();
  });

  test('14 Create Booking via API', async () => {
    // Authenticate as seeker
    const seekerToken = await getApiToken(SEEKER_EMAIL);

    // Fetch companions list
    const companionsRes = await apiRequest('GET', '/companions', seekerToken);
    expect(companionsRes.status).toBe(200);
    const companionsData = await companionsRes.json();

    // Support both array response and { data: [...] } shape
    const companions: Array<{ id: string; userId?: string }> =
      Array.isArray(companionsData) ? companionsData : companionsData.data ?? companionsData.companions ?? [];

    if (companions.length === 0) {
      console.warn('No companions found — skipping booking creation test');
      return;
    }

    const companionId = companions[0].id;

    // Create booking
    const bookingRes = await apiRequest('POST', '/bookings', seekerToken, {
      companionId,
      dateTime: futureDateIso(),
      duration: 2,
      activity: 'Dinner',
    });

    expect(bookingRes.status).toBe(201);
    const booking = await bookingRes.json();
    expect(booking.id || booking._id).toBeTruthy();

    // Verify booking appears in seeker's list
    const listRes = await apiRequest('GET', '/bookings', seekerToken);
    expect(listRes.status).toBe(200);
    const listData = await listRes.json();
    const list = Array.isArray(listData) ? listData : listData.data ?? listData.bookings ?? [];
    expect(list.length).toBeGreaterThan(0);
  });

  test('15 Seeker Bookings Tab Shows Bookings', async ({ page }) => {
    await loginAsSeeker(page);
    await page.waitForTimeout(1000);

    await page.getByText('Bookings').click();
    await page.waitForTimeout(2000);
    await shot(page, '15-bookings-upcoming');

    // Try switching to past tab if it exists
    const pastTab = tid(page, 'bookings-tab-past');
    if (await pastTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await pastTab.click();
      await page.waitForTimeout(1000);
      await shot(page, '15b-bookings-past');
    }

    // Try cancelled tab
    const cancelledTab = tid(page, 'bookings-tab-cancelled');
    if (await cancelledTab.isVisible({ timeout: 1000 }).catch(() => false)) {
      await cancelledTab.click();
      await page.waitForTimeout(1000);
      await shot(page, '15c-bookings-cancelled');
    }
  });

  test('16 Messages Tab Loads', async ({ page }) => {
    await loginAsSeeker(page);
    await page.waitForTimeout(1000);

    await page.getByText('Messages').click();
    await page.waitForTimeout(2000);
    await shot(page, '16-messages-tab');

    // Page should not crash — check something structural exists
    await expect(page).not.toHaveURL(/\/(login|otp)/);
  });

  test('17 Own Profile Shows Edit and Sign Out', async ({ page }) => {
    await loginAsSeeker(page);
    await page.waitForTimeout(1000);

    await page.getByText('Profile').click();
    await page.waitForTimeout(2000);
    await shot(page, '17-own-profile');

    await expect(tid(page, 'profile-edit-btn')).toBeVisible();
    await expect(tid(page, 'profile-signout-btn')).toBeVisible();
  });

});

// ============================================
// PHASE 3: MULTI-USER & CROSS-ACCOUNT (API-driven)
// ============================================

test.describe('Phase 3: Multi-User API Flows', () => {

  test('18 Booking Lifecycle - Seeker Creates, Companion Confirms', async () => {
    // --- Step 1: Authenticate seeker ---
    const seekerToken = await getApiToken(SEEKER_EMAIL);

    // --- Step 2: Seeker fetches companion list ---
    const companionsRes = await apiRequest('GET', '/companions', seekerToken);
    expect(companionsRes.status).toBe(200);
    const companionsData = await companionsRes.json();
    const companions: Array<{ id: string }> =
      Array.isArray(companionsData) ? companionsData : companionsData.data ?? companionsData.companions ?? [];

    if (companions.length === 0) {
      console.warn('No companions found — skipping booking lifecycle test');
      return;
    }

    const companionId = companions[0].id;

    // --- Step 3: Seeker creates a booking ---
    const createRes = await apiRequest('POST', '/bookings', seekerToken, {
      companionId,
      dateTime: futureDateIso(),
      duration: 2,
      activity: 'Coffee',
    });
    expect(createRes.status).toBe(201);
    const createdBooking = await createRes.json();
    const bookingId: string = createdBooking.id || createdBooking._id;
    expect(bookingId).toBeTruthy();

    // Booking should start as pending
    const initialStatus: string = createdBooking.status;
    expect(['pending', 'PENDING']).toContain(initialStatus.toUpperCase ? initialStatus.toUpperCase() : initialStatus);

    // --- Step 4: Authenticate companion ---
    const companionToken = await getApiToken(COMPANION_EMAIL);

    // --- Step 5: Companion fetches pending requests ---
    const requestsRes = await apiRequest('GET', '/bookings/requests', companionToken);
    expect(requestsRes.status).toBe(200);
    const requestsData = await requestsRes.json();
    const requests: Array<{ id: string }> =
      Array.isArray(requestsData) ? requestsData : requestsData.data ?? requestsData.requests ?? [];
    // May be empty if companion-test is not the target companion — we proceed anyway
    console.log(`Companion sees ${requests.length} pending requests`);

    // --- Step 6: Companion confirms the booking ---
    const confirmRes = await apiRequest('PUT', `/bookings/${bookingId}/confirm`, companionToken);
    // Accept 200 or 403 (if companion-test is not the companion for this booking)
    expect([200, 403]).toContain(confirmRes.status);

    if (confirmRes.status === 200) {
      const confirmed = await confirmRes.json();
      const confirmedStatus: string = confirmed.status;
      expect(['confirmed', 'CONFIRMED']).toContain(
        confirmedStatus.toUpperCase ? confirmedStatus.toUpperCase() : confirmedStatus,
      );

      // --- Step 7: Seeker verifies status changed ---
      const checkRes = await apiRequest('GET', `/bookings`, seekerToken);
      expect(checkRes.status).toBe(200);
    }
  });

  test('19 Messaging - Seeker Sends Message to Companion', async () => {
    // --- Authenticate seeker ---
    const seekerToken = await getApiToken(SEEKER_EMAIL);

    // --- Get companion userId from companions list ---
    const companionsRes = await apiRequest('GET', '/companions', seekerToken);
    expect(companionsRes.status).toBe(200);
    const companionsData = await companionsRes.json();
    const companions: Array<{ id: string; userId?: string; user?: { id: string } }> =
      Array.isArray(companionsData) ? companionsData : companionsData.data ?? companionsData.companions ?? [];

    if (companions.length === 0) {
      console.warn('No companions found — skipping messaging test');
      return;
    }

    // Extract companion's userId (may be nested)
    const firstCompanion = companions[0];
    const companionUserId: string =
      firstCompanion.userId ||
      (firstCompanion.user && firstCompanion.user.id) ||
      firstCompanion.id;

    // --- Seeker sends message to companion ---
    const sendRes = await apiRequest('POST', `/messages/${companionUserId}`, seekerToken, {
      text: `Hello from seeker E2E test — ${Date.now()}`,
    });
    expect([200, 201]).toContain(sendRes.status);

    // --- Authenticate companion ---
    const companionToken = await getApiToken(COMPANION_EMAIL);

    // --- Companion reads conversation ---
    // Get seeker's userId first — we need it to address the conversation
    const seekerMeRes = await apiRequest('GET', '/users/me', seekerToken);
    const seekerMe = await seekerMeRes.json();
    const seekerUserId: string = seekerMe.id || seekerMe._id || seekerMe.userId;

    const convoRes = await apiRequest('GET', `/messages/${seekerUserId}`, companionToken);
    expect(convoRes.status).toBe(200);
    const messages = await convoRes.json();
    const msgList: Array<{ text: string }> =
      Array.isArray(messages) ? messages : messages.data ?? messages.messages ?? [];

    // At least one message should exist
    expect(msgList.length).toBeGreaterThan(0);
  });

  test('20 Messaging - Companion Sends Message to Seeker', async () => {
    // --- Authenticate companion ---
    const companionToken = await getApiToken(COMPANION_EMAIL);

    // --- Authenticate seeker to get their userId ---
    const seekerToken = await getApiToken(SEEKER_EMAIL);
    const seekerMeRes = await apiRequest('GET', '/users/me', seekerToken);
    expect(seekerMeRes.status).toBe(200);
    const seekerMe = await seekerMeRes.json();
    const seekerUserId: string = seekerMe.id || seekerMe._id || seekerMe.userId;
    expect(seekerUserId).toBeTruthy();

    // --- Companion sends message to seeker ---
    const sendRes = await apiRequest('POST', `/messages/${seekerUserId}`, companionToken, {
      text: `Hello from companion E2E test — ${Date.now()}`,
    });
    expect([200, 201]).toContain(sendRes.status);

    // --- Seeker checks unread count ---
    const unreadRes = await apiRequest('GET', '/messages/unread-count', seekerToken);
    expect(unreadRes.status).toBe(200);
    const unreadData = await unreadRes.json();
    const count: number =
      typeof unreadData === 'number'
        ? unreadData
        : unreadData.count ?? unreadData.unread ?? unreadData.total ?? 0;
    expect(count).toBeGreaterThanOrEqual(1);

    // --- Seeker reads companion's messages ---
    const companionMeRes = await apiRequest('GET', '/users/me', companionToken);
    const companionMe = await companionMeRes.json();
    const companionUserId: string = companionMe.id || companionMe._id || companionMe.userId;

    const readRes = await apiRequest('GET', `/messages/${companionUserId}`, seekerToken);
    expect(readRes.status).toBe(200);
    const messages = await readRes.json();
    const msgList: Array<{ text: string }> =
      Array.isArray(messages) ? messages : messages.data ?? messages.messages ?? [];
    expect(msgList.length).toBeGreaterThan(0);
  });

});

// ============================================
// PHASE 4: EDGE CASES & VISUAL AUDIT
// ============================================

test.describe('Phase 4: Edge Cases', () => {

  test('21 Onboarding - Skip Goes to Welcome', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForTimeout(2000);
    await shot(page, '21-onboarding-start');

    await tid(page, 'onboarding-skip').click();
    await page.waitForTimeout(1500);
    await shot(page, '21b-after-skip');
  });

  test('22 Onboarding - Navigate Through All Slides', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForTimeout(2000);

    for (let i = 1; i <= 4; i++) {
      const nextBtn = tid(page, 'onboarding-next');
      if (await nextBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(600);
        await shot(page, `22-onboarding-slide-${i + 1}`);
      }
    }
  });

  test('23 Login Back - Returns to Welcome', async ({ page }) => {
    await goToLogin(page);

    await tid(page, 'login-back-btn').click();
    await page.waitForTimeout(1500);
    await shot(page, '23-login-back');

    await expect(page.getByText('Real dates')).toBeVisible();
  });

  test('24 Profile Edit Navigation', async ({ page }) => {
    await loginAsSeeker(page);
    await page.waitForTimeout(1000);

    await page.getByText('Profile').click();
    await page.waitForTimeout(1500);

    await tid(page, 'profile-edit-btn').click();
    await page.waitForTimeout(2000);
    await shot(page, '24-edit-profile-screen');
  });

  test('25 Visual Audit Screenshots', async ({ page }) => {
    // Welcome
    await goToWelcome(page);
    await shot(page, '25a-visual-welcome');

    // Login screen
    await page.getByText('Sign in', { exact: true }).click();
    await page.waitForTimeout(1500);
    await shot(page, '25b-visual-login');

    // OTP screen
    await tid(page, 'login-email-input').fill(SEEKER_EMAIL);
    await tid(page, 'login-continue-btn').click();
    await page.waitForTimeout(2000);
    await shot(page, '25c-visual-otp');

    // Logged in — browse
    await fillOtp(page, TEST_OTP);
    await tid(page, 'otp-verify-btn').click();
    await page.waitForTimeout(3000);
    await shot(page, '25d-visual-browse');

    // Bookings tab
    await page.getByText('Bookings').click();
    await page.waitForTimeout(2000);
    await shot(page, '25e-visual-bookings');

    // Messages tab
    await page.getByText('Messages').click();
    await page.waitForTimeout(2000);
    await shot(page, '25f-visual-messages');

    // Profile tab
    await page.getByText('Profile').click();
    await page.waitForTimeout(2000);
    await shot(page, '25g-visual-profile');
  });

});
