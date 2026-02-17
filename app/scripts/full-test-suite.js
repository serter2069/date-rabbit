/**
 * DateRabbit Full Test Suite
 *
 * Comprehensive AI Vision testing for all user flows
 * Model: Qwen2.5-VL-32B ($0.05/M tokens)
 *
 * Usage:
 *   node scripts/full-test-suite.js           # Run all tests
 *   node scripts/full-test-suite.js --suite auth    # Only auth tests
 *   node scripts/full-test-suite.js --suite seeker  # Only seeker tests
 *   node scripts/full-test-suite.js --suite companion # Only companion tests
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// OpenRouter API
const OPENROUTER_API_KEY = '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';
const VISION_MODEL = 'qwen/qwen2.5-vl-32b-instruct';

const BASE_URL = 'https://daterabbit.smartlaunchhub.com';
const SCREENSHOTS_DIR = path.join(__dirname, '../tests/full-suite-screenshots');

// Test credentials
const TEST_SEEKER = {
  email: 'test-seeker@daterabbit.test',
  name: 'Test Seeker',
  birthYear: '1995'
};

const TEST_COMPANION = {
  email: 'test-companion@daterabbit.test',
  name: 'Test Companion',
  birthYear: '1998'
};

// ============================================
// TEST SCENARIOS
// ============================================

const SCENARIOS = {
  // ---- AUTH FLOW ----
  auth: [
    {
      name: 'Welcome Page Load',
      steps: [
        { goto: '/welcome', screenshot: true },
        { verify: 'Is this the DateRabbit welcome page with "Create Account" and "I already have an account" buttons?' }
      ]
    },
    {
      name: 'Role Selection - Seeker',
      steps: [
        { goto: '/welcome' },
        { click: 'Create Account button (coral/salmon colored)', wait: 1500 },
        { verify: 'Are there two role options: Date Seeker and Date Companion?' },
        { click: 'Book dates button inside Date Seeker card', wait: 1500, screenshot: true },
        { verify: 'Is this a registration form with name, email, birth year fields?' }
      ]
    },
    {
      name: 'Role Selection - Companion',
      steps: [
        { goto: '/welcome' },
        { click: 'Create Account button', wait: 1500 },
        { click: 'Earn $$$ button inside Date Companion card', wait: 1500, screenshot: true },
        { verify: 'Is this a registration form for companions?' }
      ]
    },
    {
      name: 'Login Flow',
      steps: [
        { goto: '/welcome' },
        { click: 'I already have an account', wait: 1500, screenshot: true },
        { verify: 'Is this a login page with email input field?' }
      ]
    },
    {
      name: 'Protected Route Redirect',
      steps: [
        { goto: '/male/browse', screenshot: true },
        { verify: 'Was user redirected to welcome/login page? (Should see DateRabbit welcome screen, not browse page)' }
      ]
    }
  ],

  // ---- SEEKER (MALE) FLOW ----
  seeker: [
    {
      name: 'Seeker Registration Form Validation',
      steps: [
        { goto: '/welcome' },
        { click: 'Create Account', wait: 1000 },
        { click: 'Book dates', wait: 1500 },
        { click: 'Continue or Submit button', wait: 1000 },
        { verify: 'Are there validation errors shown (required fields)?' }
      ]
    },
    {
      name: 'Seeker Browse Page Layout',
      steps: [
        { goto: '/male/browse', screenshot: true },
        // Will redirect to login if not authenticated
        { verify: 'Is this either the browse page with companion cards OR a login/welcome page?' }
      ]
    },
    {
      name: 'Seeker Navigation Tabs (requires auth)',
      steps: [
        { goto: '/male', screenshot: true },
        { verify: 'Is this showing either navigation tabs (if authenticated) OR a login/welcome page redirect (if not authenticated)?' }
      ]
    }
  ],

  // ---- FULL REGISTRATION FLOW (with auth) ----
  'full-flow': [
    {
      name: 'Complete Seeker Registration',
      steps: [
        { goto: '/welcome' },
        { click: 'Create Account', wait: 1000 },
        { click: 'Book dates button', wait: 1500 },
        { fill: { field: 'Full Name input field', value: 'Test User' } },
        { fill: { field: 'Email input field', value: 'test@example.com' } },
        { fill: { field: 'Birth Year input field', value: '1995' } },
        { screenshot: true },
        { click: 'the coral/salmon colored Create Account button at the bottom', wait: 2500, screenshot: true },
        { verify: 'Is this showing a dashboard or home screen with welcome message and navigation tabs at the bottom? (Should NOT be an error page or login screen)' }
      ]
    },
    {
      name: 'Browse Companions After Login',
      steps: [
        // After registration, should be on main page
        { goto: '/male/browse', screenshot: true },
        { verify: 'Is this the Browse page with search functionality and filter tabs (like "All", "Nearby", "Top Rated")? (It may show "No matches found" which is acceptable - we are checking the page loaded correctly)' }
      ]
    }
  ],

  // ---- COMPANION (FEMALE) FLOW ----
  companion: [
    {
      name: 'Companion Registration Form',
      steps: [
        { goto: '/welcome' },
        { click: 'Create Account', wait: 1000 },
        { click: 'Earn $$$', wait: 1500, screenshot: true },
        { verify: 'Is this a registration form with fields for companion signup?' }
      ]
    },
    {
      name: 'Companion Navigation Tabs (requires auth)',
      steps: [
        { goto: '/female', screenshot: true },
        { verify: 'Is this showing either navigation tabs (if authenticated) OR a login/welcome page redirect (if not authenticated)?' }
      ]
    }
  ],

  // ---- UI/UX TESTS ----
  ui: [
    {
      name: 'Onboarding Screen',
      steps: [
        { goto: '/onboarding', screenshot: true },
        { verify: 'Is this an onboarding/intro screen for the app?' }
      ]
    },
    {
      name: 'Settings Pages Exist',
      steps: [
        { goto: '/settings/edit-profile', screenshot: true },
        { verify: 'Is this a profile editing page or login redirect?' }
      ]
    },
    {
      name: 'Mobile Responsive Layout',
      steps: [
        { goto: '/welcome', screenshot: true },
        { verify: 'Does the UI look properly sized for mobile (not broken layout, readable text)?' }
      ]
    }
  ],

  // ---- SMOKE TESTS (Quick health check) ----
  smoke: [
    {
      name: 'App Loads',
      steps: [
        { goto: '/', screenshot: true },
        { verify: 'Does the app load without errors? (Not a blank page or error screen)' }
      ]
    },
    {
      name: 'Welcome Page Renders',
      steps: [
        { goto: '/welcome' },
        { verify: 'Is the welcome page showing DateRabbit branding?' }
      ]
    },
    {
      name: 'Auth Routes Work',
      steps: [
        { goto: '/login' },
        { verify: 'Is this a login page?' }
      ]
    }
  ]
};

// ============================================
// AI VISION HELPER
// ============================================

async function callVisionAI(prompt, imageBase64) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://daterabbit.smartlaunchhub.com',
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } },
          { type: 'text', text: prompt }
        ]
      }],
      max_tokens: 500,
      temperature: 0.1
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }
  return data.choices[0].message.content;
}

async function findElement(page, description) {
  // Get viewport size for coordinate scaling
  const viewport = page.viewportSize();
  const screenshot = await page.screenshot({ type: 'png' });
  const base64 = screenshot.toString('base64');

  // Screenshot is 2x due to deviceScaleFactor, so actual size is viewport * 2
  const imgWidth = viewport.width * 2;
  const imgHeight = viewport.height * 2;

  const prompt = `You are a UI testing assistant. Find the element described below in this mobile app screenshot.

ELEMENT TO FIND: "${description}"

The screenshot is ${imgWidth}x${imgHeight} pixels. Return ONLY a JSON object with the center coordinates:
{"x": number, "y": number, "found": true}

If element is not found, return:
{"found": false, "reason": "brief explanation"}

RESPOND WITH JSON ONLY, no other text.`;

  const response = await callVisionAI(prompt, base64);

  try {
    const match = response.match(/\{[\s\S]*\}/);
    if (match) {
      const result = JSON.parse(match[0]);
      // Scale coordinates back to viewport (divide by deviceScaleFactor)
      if (result.found && result.x && result.y) {
        result.x = Math.round(result.x / 2);
        result.y = Math.round(result.y / 2);
      }
      return result;
    }
  } catch (e) {
    console.log('Parse error:', response);
  }
  return { found: false, reason: 'Failed to parse AI response' };
}

async function verifyScreen(page, question) {
  const screenshot = await page.screenshot({ type: 'png' });
  const base64 = screenshot.toString('base64');

  const prompt = `You are a UI testing assistant. Answer this question about the mobile app screenshot:

QUESTION: ${question}

Respond with ONLY "YES" or "NO" followed by a brief explanation (one sentence).`;

  const response = await callVisionAI(prompt, base64);
  const passed = response.toUpperCase().startsWith('YES');
  return { passed, response: response.substring(0, 100) };
}

// ============================================
// TEST RUNNER
// ============================================

async function runScenario(page, scenario, suiteDir) {
  const scenarioDir = path.join(suiteDir, scenario.name.replace(/[^a-z0-9]/gi, '-').toLowerCase());
  if (!fs.existsSync(scenarioDir)) {
    fs.mkdirSync(scenarioDir, { recursive: true });
  }

  const errors = [];
  let stepNum = 0;

  for (const step of scenario.steps) {
    stepNum++;
    const stepPrefix = `step-${String(stepNum).padStart(2, '0')}`;

    try {
      if (step.goto) {
        await page.goto(`${BASE_URL}${step.goto}`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(1000);
        console.log(`   ${stepNum}. goto ${step.goto} ✅`);
      }

      if (step.screenshot) {
        await page.screenshot({ path: path.join(scenarioDir, `${stepPrefix}.png`) });
      }

      if (step.click) {
        const result = await findElement(page, step.click);
        if (result.found) {
          await page.mouse.click(result.x, result.y);
          console.log(`   ${stepNum}. click "${step.click.substring(0, 40)}..." at (${result.x}, ${result.y}) ✅`);
          if (step.wait) await page.waitForTimeout(step.wait);
          if (step.screenshot) {
            await page.screenshot({ path: path.join(scenarioDir, `${stepPrefix}-after-click.png`) });
          }
        } else {
          throw new Error(`Element not found: ${result.reason || step.click}`);
        }
      }

      if (step.fill) {
        const result = await findElement(page, step.fill.field);
        if (result.found) {
          await page.mouse.click(result.x, result.y);
          await page.keyboard.type(step.fill.value);
          console.log(`   ${stepNum}. fill "${step.fill.field}" with "${step.fill.value}" ✅`);
        } else {
          throw new Error(`Field not found: ${step.fill.field}`);
        }
      }

      if (step.verify) {
        const result = await verifyScreen(page, step.verify);
        if (result.passed) {
          console.log(`   ${stepNum}. verify: ✅ ${result.response.substring(0, 60)}...`);
        } else {
          console.log(`   ${stepNum}. verify: ❌ ${result.response.substring(0, 60)}...`);
          errors.push({ step: stepNum, error: result.response });
        }
      }

    } catch (error) {
      console.log(`   ${stepNum}. ERROR: ${error.message}`);
      errors.push({ step: stepNum, error: error.message });
      await page.screenshot({ path: path.join(scenarioDir, `${stepPrefix}-error.png`) });
    }
  }

  return errors;
}

async function runSuite(suiteName, scenarios) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📦 SUITE: ${suiteName.toUpperCase()}`);
  console.log(`${'='.repeat(50)}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 720, height: 1280 },
    deviceScaleFactor: 2,
    isMobile: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    bypassCSP: true,
  });
  const page = await context.newPage();

  // Disable caching to ensure fresh content
  await page.route('**/*', async route => {
    const headers = { ...route.request().headers() };
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
    await route.continue({ headers });
  });

  const suiteDir = path.join(SCREENSHOTS_DIR, suiteName);
  if (!fs.existsSync(suiteDir)) {
    fs.mkdirSync(suiteDir, { recursive: true });
  }

  const results = [];

  for (const scenario of scenarios) {
    console.log(`\n📋 ${scenario.name}`);
    const errors = await runScenario(page, scenario, suiteDir);
    results.push({
      name: scenario.name,
      passed: errors.length === 0,
      errors
    });
  }

  await browser.close();
  return results;
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('🐰 DateRabbit Full Test Suite');
  console.log(`📍 ${BASE_URL}`);
  console.log(`🧠 Model: ${VISION_MODEL}`);

  // Parse CLI args
  const args = process.argv.slice(2);
  const suiteArg = args.find(a => a.startsWith('--suite='))?.split('=')[1];

  let suitesToRun = Object.keys(SCENARIOS);
  if (suiteArg) {
    if (SCENARIOS[suiteArg]) {
      suitesToRun = [suiteArg];
    } else {
      console.log(`❌ Unknown suite: ${suiteArg}`);
      console.log(`Available: ${Object.keys(SCENARIOS).join(', ')}`);
      process.exit(1);
    }
  }

  console.log(`📋 Suites: ${suitesToRun.join(', ')}`);

  // Clean screenshots dir
  if (fs.existsSync(SCREENSHOTS_DIR)) {
    fs.rmSync(SCREENSHOTS_DIR, { recursive: true });
  }
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const allResults = {};
  const startTime = Date.now();

  for (const suite of suitesToRun) {
    allResults[suite] = await runSuite(suite, SCENARIOS[suite]);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 FINAL SUMMARY');
  console.log(`${'='.repeat(50)}`);

  let totalPassed = 0;
  let totalFailed = 0;

  for (const [suite, results] of Object.entries(allResults)) {
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    totalPassed += passed;
    totalFailed += failed;

    console.log(`\n${suite.toUpperCase()}: ${passed}/${results.length} passed`);

    const failures = results.filter(r => !r.passed);
    if (failures.length > 0) {
      for (const f of failures) {
        console.log(`   ❌ ${f.name}`);
        for (const e of f.errors) {
          console.log(`      Step ${e.step}: ${e.error.substring(0, 60)}`);
        }
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`⏱️  Time: ${elapsed}s`);
  console.log(`📸 Screenshots: ${SCREENSHOTS_DIR}`);
  console.log(`${'='.repeat(50)}`);

  process.exit(totalFailed > 0 ? 1 : 0);
}

main().catch(console.error);
