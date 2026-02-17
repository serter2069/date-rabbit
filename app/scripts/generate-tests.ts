/**
 * Generate Playwright tests from scenarios.ts
 * Run: npx tsx scripts/generate-tests.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { scenarios, selectors, getWebScenarios } from '../tests/scenarios'

const OUTPUT_DIR = path.join(__dirname, '..', 'tests', 'generated')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'e2e.spec.ts')

// Map testID to visible text (for React Native Web)
const textMap: Record<string, string> = {
  // Onboarding
  'onboarding-skip': 'Skip',
  'onboarding-next': 'Next',
  'onboarding-get-started': 'Get Started',

  // Auth - Welcome
  'welcome-create-account-btn': 'Create Account',
  'welcome-login-btn': 'I already have an account',

  // Auth - Role Select
  'role-select-companion-btn': 'Date Companion',
  'role-select-seeker-btn': 'Date Seeker',

  // Auth - Login
  'login-continue-btn': 'Continue',

  // Auth - OTP
  'otp-verify-btn': 'Verify',
  'otp-resend-btn': 'Resend',

  // Auth - Register/Setup
  'register-submit-btn': 'Continue',
  'setup-basic-continue-btn': 'Continue',
  'setup-complete-btn': 'Complete',

  // Profile
  'profile-signout-btn': 'Sign Out',
  'profile-edit-btn': 'Edit Profile',
  'profile-view-book-btn': 'Book a Date',
  'profile-view-message-btn': 'Message',

  // Filter
  'filter-close-btn': '✕',
  'filter-reset-btn': 'Reset',
  'filter-apply-btn': 'Apply',

  // Booking
  'booking-submit-btn': 'Request Booking',

  // Chat
  'chat-send-btn': 'Send',
}

function getSelector(testId: string): string {
  const text = textMap[testId]
  if (text) {
    return `getByText('${text}')`
  }
  return `getByTestId('${testId}')`
}

function getInputSelector(testId: string): string {
  const inputMap: Record<string, string> = {
    'login-email-input': 'email@example.com',
    'register-name-input': 'Your name',
    'register-email-input': 'email@example.com',
    'setup-name-input': 'Your name',
    'setup-age-input': '1995',
    'setup-location-input': 'City',
    'setup-bio-input': 'Tell us about yourself',
    'setup-rate-input': '100',
    'browse-search-input': 'Search',
    'booking-location-input': 'Location',
    'booking-message-input': 'Message',
    'chat-message-input': 'Type a message',
  }
  
  const placeholder = inputMap[testId]
  if (placeholder) {
    return `getByPlaceholder('${placeholder}')`
  }
  return `getByTestId('${testId}')`
}

function generateTests(): string {
  const webScenarios = getWebScenarios()

  const imports = `/**
 * AUTO-GENERATED from scenarios.ts
 * Do not edit manually - run: npm run generate:tests
 * 
 * Uses text-based selectors for React Native Web compatibility
 */

import { test, expect, Page } from '@playwright/test';
import { startLogicTest, analyzeIfLogicMode, endLogicTest } from '../logic/helpers';

`

  const testFunctions = webScenarios.map(scenario => {
    const testName = scenario.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const steps = scenario.steps.map(step => {
      switch (step.action) {
        case 'goto':
          return `    await page.goto('${step.target}');`
        
        case 'click':
          const selector = getSelector(step.target || '')
          return `    await page.${selector}.first().click();${step.comment ? ` // ${step.comment}` : ''}`
        
        case 'fill':
          const inputSelector = getInputSelector(step.target || '')
          return `    await page.${inputSelector}.fill('${step.value}');`
        
        case 'wait':
          return `    await page.waitForTimeout(${step.timeout || 1000});`
        
        case 'expect':
          const expects: string[] = []
          if (step.expect?.url) {
            expects.push(`    await expect(page).toHaveURL(/${step.expect.url}/);`)
          }
          if (step.expect?.visible) {
            expects.push(`    await expect(page.getByText('${step.expect.visible}')).toBeVisible();`)
          }
          if (step.expect?.text) {
            expects.push(`    await expect(page.getByText('${step.expect.text}')).toBeVisible();`)
          }
          return expects.join('\n')
        
        case 'screenshot':
          return `    await analyzeIfLogicMode(page, '${step.value || 'screenshot'}', '${step.comment || ''}');`
        
        default:
          return `    // TODO: ${step.action}`
      }
    }).filter(Boolean).join('\n')

    return `
test('${scenario.name}', async ({ page }) => {
  startLogicTest('${testName}');
${steps}
  endLogicTest();
});
`
  }).join('\n')

  return imports + testFunctions
}

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const content = generateTests()
  fs.writeFileSync(OUTPUT_FILE, content)

  console.log(`✅ Generated ${getWebScenarios().length} tests`)
  console.log(`📄 Output: ${OUTPUT_FILE}`)
}

main()
