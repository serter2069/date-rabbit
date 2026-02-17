import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to reset auth state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('unauthenticated user lands on welcome page', async ({ page }) => {
    await page.goto('/');

    // Should redirect to welcome
    await expect(page).toHaveURL(/welcome/);
    await expect(page.getByText('DateRabbit')).toBeVisible();
    await expect(page.getByText('Where meaningful connections meet')).toBeVisible();
  });

  test('welcome page has Create Account and Login buttons', async ({ page }) => {
    await page.goto('/welcome');

    // React Native Web uses divs, not buttons
    await expect(page.getByText('Create Account').first()).toBeVisible();
    await expect(page.getByText('I already have an account')).toBeVisible();
  });

  test('Create Account navigates to role selection', async ({ page }) => {
    await page.goto('/welcome');

    await page.getByText('Create Account').first().click();

    await expect(page).toHaveURL(/role-select/);
    await expect(page.getByText('Join as...')).toBeVisible();
  });

  test('role selection shows both role cards', async ({ page }) => {
    await page.goto('/role-select');

    await expect(page.getByText('Date Companion')).toBeVisible();
    await expect(page.getByText('Date Seeker')).toBeVisible();
    await expect(page.getByText('Earn $$$')).toBeVisible();
    await expect(page.getByText('Book dates', { exact: true })).toBeVisible();
  });

  test('selecting Date Companion role goes to register for female', async ({ page }) => {
    await page.goto('/role-select');

    await page.getByText('Date Companion').click();

    await expect(page).toHaveURL(/register.*role=female/);
    await expect(page.getByText("Let's set up your companion profile")).toBeVisible();
    await expect(page.getByText('Hourly Rate')).toBeVisible();
  });

  test('selecting Date Seeker role goes to register for male', async ({ page }) => {
    await page.goto('/role-select');

    await page.getByText('Date Seeker').click();

    await expect(page).toHaveURL(/register.*role=male/);
    await expect(page.getByText('Join and start booking dates')).toBeVisible();
    // Male should NOT see hourly rate
    await expect(page.getByText('Hourly Rate')).not.toBeVisible();
  });
});

test.describe('Registration Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('registration form has all required fields for female', async ({ page }) => {
    await page.goto('/register?role=female');

    // Check all form labels
    await expect(page.getByText('Full Name')).toBeVisible();
    await expect(page.getByText('Email')).toBeVisible();
    await expect(page.getByText('Birth Year')).toBeVisible();
    await expect(page.getByText('Location')).toBeVisible();
    await expect(page.getByText('Hourly Rate ($)')).toBeVisible();

    // Check placeholders
    await expect(page.getByPlaceholder('Your name')).toBeVisible();
    await expect(page.getByPlaceholder('email@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('1995')).toBeVisible();
    await expect(page.getByPlaceholder('City')).toBeVisible();
    await expect(page.getByPlaceholder('100')).toBeVisible();
  });

  test('registration form does NOT have password field', async ({ page }) => {
    await page.goto('/register?role=female');

    // Password should NOT exist (OTP auth only)
    const passwordLabels = await page.getByText('Password').count();
    expect(passwordLabels).toBe(0);
  });

  test('registration form shows terms and privacy links', async ({ page }) => {
    await page.goto('/register?role=female');

    await expect(page.getByText(/By creating an account, you agree/)).toBeVisible();
    await expect(page.getByText('Terms of Service')).toBeVisible();
    await expect(page.getByText('Privacy Policy')).toBeVisible();
  });

  test('can fill registration form', async ({ page }) => {
    await page.goto('/register?role=female');

    await page.getByPlaceholder('Your name').fill('Test User');
    await page.getByPlaceholder('email@example.com').fill('test@example.com');
    await page.getByPlaceholder('1995').fill('1998');
    await page.getByPlaceholder('City').fill('New York');
    await page.getByPlaceholder('100').fill('150');

    // Verify values are filled
    await expect(page.getByPlaceholder('Your name')).toHaveValue('Test User');
    await expect(page.getByPlaceholder('email@example.com')).toHaveValue('test@example.com');
    await expect(page.getByPlaceholder('1995')).toHaveValue('1998');
    await expect(page.getByPlaceholder('City')).toHaveValue('New York');
    await expect(page.getByPlaceholder('100')).toHaveValue('150');
  });

  test('back button exists on registration', async ({ page }) => {
    await page.goto('/register?role=female');
    await expect(page.getByText('← Back')).toBeVisible();
  });
});

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('login page has email input and Continue button', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByText('Welcome')).toBeVisible();
    await expect(page.getByPlaceholder('email@example.com')).toBeVisible();
    await expect(page.getByText('Continue')).toBeVisible();
  });

  test('can enter email in login form', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('email@example.com').fill('user@test.com');

    await expect(page.getByPlaceholder('email@example.com')).toHaveValue('user@test.com');
  });

});

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('onboarding page shows first slide', async ({ page }) => {
    await page.goto('/onboarding');

    await expect(page.getByText('Find Your Perfect Date')).toBeVisible();
    await expect(page.getByText(/Connect with verified/)).toBeVisible();
  });

  test('onboarding has Skip button', async ({ page }) => {
    await page.goto('/onboarding');

    await expect(page.getByText('Skip')).toBeVisible();
  });

  test('onboarding has Next button', async ({ page }) => {
    await page.goto('/onboarding');

    await expect(page.getByText('Next')).toBeVisible();
  });
});

test.describe('Full User Flow', () => {
  test('complete flow: welcome -> login page', async ({ page }) => {
    // Start fresh
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');

    // 1. Landing on welcome
    await expect(page).toHaveURL(/welcome/);

    // 2. Click "I already have an account"
    await page.getByText('I already have an account').click();
    await expect(page).toHaveURL(/login/);

    // 3. Email input is visible
    await expect(page.getByPlaceholder('email@example.com')).toBeVisible();
    await expect(page.getByText('Continue')).toBeVisible();
  });
});
