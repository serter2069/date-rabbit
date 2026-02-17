/**
 * DateRabbit Complete AI Test Suite
 *
 * Полная система автоматического тестирования через AI Vision
 *
 * Использование:
 *   node scripts/test-suite.js                    # Все тесты
 *   node scripts/test-suite.js --suite=auth       # Только auth тесты
 *   node scripts/test-suite.js --suite=seeker     # Только seeker тесты
 *   node scripts/test-suite.js --suite=companion  # Только companion тесты
 *   node scripts/test-suite.js --suite=e2e        # End-to-end (2 пользователя)
 *   node scripts/test-suite.js --model=glm        # Использовать GLM (дешевле)
 *   node scripts/test-suite.js --parallel         # Параллельный запуск
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ============== CONFIGURATION ==============

const CONFIG = {
  BASE_URL: 'https://daterabbit.smartlaunchhub.com',
  API_URL: 'https://daterabbit-api.smartlaunchhub.com/api',
  OPENROUTER_API_KEY: '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',
  SCREENSHOTS_DIR: path.join(__dirname, '../tests/screenshots'),
  REPORTS_DIR: path.join(__dirname, '../tests/reports'),
  VIEWPORT: { width: 390, height: 844 }, // iPhone 14 Pro
  DEFAULT_WAIT: 1500,
  MAX_RETRIES: 2,
};

const MODELS = {
  claude: 'anthropic/claude-sonnet-4.5',
  glm: 'z-ai/glm-4.6v',
};

// Parse CLI args
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, val] = arg.replace('--', '').split('=');
  acc[key] = val || true;
  return acc;
}, {});

const VISION_MODEL = MODELS[args.model] || MODELS.claude;
const isGLM = VISION_MODEL.includes('glm');

// ============== AI VISION FUNCTIONS ==============

async function callVisionAI(imageBase64, prompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
      'HTTP-Referer': CONFIG.BASE_URL,
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
      max_tokens: 300
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
}

async function getClickCoords(page, description) {
  const screenshot = await page.screenshot();
  const base64 = screenshot.toString('base64');

  const prompt = isGLM
    ? `Locate the "${description}" and provide its bounding box coordinates in [[xmin,ymin,xmax,ymax]] format.`
    : `Find the CENTER coordinates of: "${description}"
Screenshot is ${CONFIG.VIEWPORT.width}x${CONFIG.VIEWPORT.height} pixels.
Return ONLY JSON: {"x": number, "y": number}`;

  const result = await callVisionAI(base64, prompt);
  const cleaned = result.replace(/<\|[^>]+\|>/g, '').trim();

  if (isGLM) {
    const boxMatch = cleaned.match(/\[\[?\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\]?\]/);
    if (boxMatch) {
      const [, x1, y1, x2, y2] = boxMatch.map(Number);
      return {
        x: Math.round(((x1 + x2) / 2) * CONFIG.VIEWPORT.width / 1000),
        y: Math.round(((y1 + y2) / 2) * CONFIG.VIEWPORT.height / 1000)
      };
    }
  } else {
    const jsonMatch = cleaned.match(/\{[^}]+\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  }

  return null;
}

async function verifyScreen(page, question) {
  const screenshot = await page.screenshot();
  const base64 = screenshot.toString('base64');
  const result = await callVisionAI(base64, `${question}\nAnswer YES or NO first, then explain briefly.`);
  const cleaned = result.replace(/<\|[^>]+\|>/g, '').trim();
  return cleaned.toLowerCase().startsWith('yes');
}

// ============== TEST HELPERS ==============

async function fillInput(page, placeholder, value) {
  await page.fill(`input[placeholder*="${placeholder}" i], textarea[placeholder*="${placeholder}" i]`, value);
}

async function clickByTestId(page, testId) {
  await page.click(`[data-testid="${testId}"]`);
}

async function waitAndClick(page, description, wait = CONFIG.DEFAULT_WAIT) {
  const coords = await getClickCoords(page, description);
  if (!coords) throw new Error(`Element not found: ${description}`);
  await page.mouse.click(coords.x, coords.y);
  await page.waitForTimeout(wait);
  return coords;
}

function generateEmail() {
  return `test${Date.now()}@test.local`;
}

// ============== TEST SCENARIOS ==============

const SCENARIOS = {
  // ========== AUTH SUITE ==========
  auth: [
    {
      name: 'Welcome Page Loads',
      steps: async (page) => {
        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        await page.waitForTimeout(2000);
        return await verifyScreen(page, 'Is this a welcome/landing page with DateRabbit branding and Create Account button?');
      }
    },
    {
      name: 'Navigate to Seeker Registration',
      steps: async (page) => {
        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        await page.waitForTimeout(1500);
        await waitAndClick(page, 'Create Account button');
        await waitAndClick(page, 'Book dates or Date Seeker option');
        return await verifyScreen(page, 'Is this a registration form with name, email, birth year fields?');
      }
    },
    {
      name: 'Navigate to Companion Registration',
      steps: async (page) => {
        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        await page.waitForTimeout(1500);
        await waitAndClick(page, 'Create Account button');
        await waitAndClick(page, 'Earn money or Date Companion option');
        return await verifyScreen(page, 'Is this a companion registration form with hourly rate field?');
      }
    },
    {
      name: 'Navigate to Login',
      steps: async (page) => {
        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        await page.waitForTimeout(1500);
        await waitAndClick(page, 'I already have an account');
        return await verifyScreen(page, 'Is this a login page with email input?');
      }
    },
    {
      name: 'Protected Route Redirects to Welcome',
      steps: async (page) => {
        await page.goto(`${CONFIG.BASE_URL}/male/browse`);
        await page.waitForTimeout(2000);
        return await verifyScreen(page, 'Is this a welcome/login page (redirect from protected route)?');
      }
    },
  ],

  // ========== SEEKER SUITE ==========
  seeker: [
    {
      name: 'Seeker Registration Form Validation',
      steps: async (page) => {
        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        await page.waitForTimeout(1500);
        await waitAndClick(page, 'Create Account button');
        await waitAndClick(page, 'Book dates option');
        await page.waitForTimeout(1000);

        // Try to submit empty form
        await waitAndClick(page, 'Create Account submit button');
        return await verifyScreen(page, 'Are there validation errors shown (red text or error messages)?');
      }
    },
    {
      name: 'Seeker Registration - Fill Form',
      steps: async (page) => {
        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        await page.waitForTimeout(1500);
        await waitAndClick(page, 'Create Account button');
        await waitAndClick(page, 'Book dates option');
        await page.waitForTimeout(1000);

        // Fill form
        await fillInput(page, 'name', 'Test User');
        await fillInput(page, 'email', generateEmail());
        await fillInput(page, 'birth', '1990');
        await fillInput(page, 'city', 'New York');

        return await verifyScreen(page, 'Is the form filled with name, email, birth year and location?');
      }
    },
  ],

  // ========== COMPANION SUITE ==========
  companion: [
    {
      name: 'Companion Registration Form Has Rate Field',
      steps: async (page) => {
        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        await page.waitForTimeout(1500);
        await waitAndClick(page, 'Create Account button');
        await waitAndClick(page, 'Earn money or Companion option');
        await page.waitForTimeout(1000);

        return await verifyScreen(page, 'Is there an hourly rate field (with $ or rate mentioned)?');
      }
    },
    {
      name: 'Companion Registration - Fill Form',
      steps: async (page) => {
        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        await page.waitForTimeout(1500);
        await waitAndClick(page, 'Create Account button');
        await waitAndClick(page, 'Earn money option');
        await page.waitForTimeout(1000);

        // Fill form
        await fillInput(page, 'name', 'Test Companion');
        await fillInput(page, 'email', generateEmail());
        await fillInput(page, 'birth', '1995');
        await fillInput(page, 'city', 'Los Angeles');
        await fillInput(page, 'rate', '100');

        return await verifyScreen(page, 'Is the form filled with name, email, birth year, location, and hourly rate?');
      }
    },
  ],

  // ========== END-TO-END SUITE ==========
  e2e: [
    {
      name: 'E2E: Full Registration Flow - Seeker',
      steps: async (page, context) => {
        const email = generateEmail();
        context.seekerEmail = email;

        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        await page.waitForTimeout(1500);
        await waitAndClick(page, 'Create Account button');
        await waitAndClick(page, 'Book dates option');
        await page.waitForTimeout(1000);

        await fillInput(page, 'name', 'E2E Seeker');
        await fillInput(page, 'email', email);
        await fillInput(page, 'birth', '1992');
        await fillInput(page, 'city', 'Miami');

        await waitAndClick(page, 'Create Account submit button');
        await page.waitForTimeout(3000);

        // Should go to OTP or next step
        const onOTP = await verifyScreen(page, 'Is this an OTP verification screen or dashboard?');
        console.log(`   Seeker email: ${email}`);
        return onOTP;
      }
    },
    {
      name: 'E2E: Full Registration Flow - Companion',
      steps: async (page, context) => {
        const email = generateEmail();
        context.companionEmail = email;

        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        await page.waitForTimeout(1500);
        await waitAndClick(page, 'Create Account button');
        await waitAndClick(page, 'Earn money option');
        await page.waitForTimeout(1000);

        await fillInput(page, 'name', 'E2E Companion');
        await fillInput(page, 'email', email);
        await fillInput(page, 'birth', '1996');
        await fillInput(page, 'city', 'Miami');
        await fillInput(page, 'rate', '85');

        await waitAndClick(page, 'Create Account submit button');
        await page.waitForTimeout(3000);

        const onOTP = await verifyScreen(page, 'Is this an OTP verification screen or dashboard?');
        console.log(`   Companion email: ${email}`);
        return onOTP;
      }
    },
  ],

  // ========== UI COMPONENTS SUITE ==========
  ui: [
    {
      name: 'Welcome Page - All Elements Visible',
      steps: async (page) => {
        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        await page.waitForTimeout(2000);
        return await verifyScreen(page,
          'Does this page have: 1) DateRabbit logo, 2) Feature list (verified profiles, secure payments, support), 3) Create Account button, 4) Login link?'
        );
      }
    },
    {
      name: 'Role Selection - Two Options Visible',
      steps: async (page) => {
        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        await page.waitForTimeout(1500);
        await waitAndClick(page, 'Create Account button');
        return await verifyScreen(page,
          'Are there two role options visible: 1) Date Seeker/Book dates, 2) Date Companion/Earn money?'
        );
      }
    },
  ],
};

// ============== TEST RUNNER ==============

async function runScenario(scenario, page, context, screenshotDir) {
  const startTime = Date.now();
  let passed = false;
  let error = null;

  try {
    passed = await scenario.steps(page, context);
  } catch (e) {
    error = e.message;
  }

  const duration = Date.now() - startTime;

  // Save screenshot
  const safeName = scenario.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  await page.screenshot({ path: path.join(screenshotDir, `${safeName}.png`) });

  return { name: scenario.name, passed, error, duration };
}

async function runSuite(suiteName, scenarios, browser) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📋 Suite: ${suiteName.toUpperCase()}`);
  console.log('='.repeat(50));

  const screenshotDir = path.join(CONFIG.SCREENSHOTS_DIR, suiteName);
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  const context = await browser.newContext({ viewport: CONFIG.VIEWPORT });
  const page = await context.newPage();
  const sharedContext = {}; // For passing data between tests

  const results = [];

  for (const scenario of scenarios) {
    process.stdout.write(`   ${scenario.name}... `);
    const result = await runScenario(scenario, page, sharedContext, screenshotDir);
    results.push(result);

    if (result.passed) {
      console.log(`✅ (${result.duration}ms)`);
    } else {
      console.log(`❌ ${result.error || 'Verification failed'}`);
    }
  }

  await context.close();
  return results;
}

async function main() {
  console.log('\n🤖 DateRabbit AI Test Suite');
  console.log(`📍 Base URL: ${CONFIG.BASE_URL}`);
  console.log(`🧠 Model: ${VISION_MODEL}`);
  console.log(`📱 Viewport: ${CONFIG.VIEWPORT.width}x${CONFIG.VIEWPORT.height}`);

  // Setup directories
  if (!fs.existsSync(CONFIG.SCREENSHOTS_DIR)) fs.mkdirSync(CONFIG.SCREENSHOTS_DIR, { recursive: true });
  if (!fs.existsSync(CONFIG.REPORTS_DIR)) fs.mkdirSync(CONFIG.REPORTS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  // Determine which suites to run
  const selectedSuite = args.suite;
  const suitesToRun = selectedSuite
    ? { [selectedSuite]: SCENARIOS[selectedSuite] }
    : SCENARIOS;

  if (selectedSuite && !SCENARIOS[selectedSuite]) {
    console.error(`\n❌ Unknown suite: ${selectedSuite}`);
    console.log(`Available suites: ${Object.keys(SCENARIOS).join(', ')}`);
    process.exit(1);
  }

  const allResults = {};
  let totalPassed = 0;
  let totalFailed = 0;

  for (const [suiteName, scenarios] of Object.entries(suitesToRun)) {
    const results = await runSuite(suiteName, scenarios, browser);
    allResults[suiteName] = results;
    totalPassed += results.filter(r => r.passed).length;
    totalFailed += results.filter(r => !r.passed).length;
  }

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`📈 Success Rate: ${Math.round(totalPassed / (totalPassed + totalFailed) * 100)}%`);

  // Failed tests details
  if (totalFailed > 0) {
    console.log('\n❌ FAILED TESTS:');
    for (const [suite, results] of Object.entries(allResults)) {
      const failed = results.filter(r => !r.passed);
      if (failed.length > 0) {
        console.log(`   [${suite}]`);
        failed.forEach(r => console.log(`     - ${r.name}: ${r.error || 'Verification failed'}`));
      }
    }
  }

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    model: VISION_MODEL,
    baseUrl: CONFIG.BASE_URL,
    summary: { passed: totalPassed, failed: totalFailed },
    suites: allResults,
  };

  const reportPath = path.join(CONFIG.REPORTS_DIR, `report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved: ${reportPath}`);
  console.log(`📸 Screenshots: ${CONFIG.SCREENSHOTS_DIR}\n`);

  process.exit(totalFailed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
