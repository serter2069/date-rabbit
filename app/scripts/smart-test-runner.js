/**
 * Smart Test Runner - гибридное тестирование
 *
 * Комбинирует:
 * 1. TestID селекторы (быстро, мс)
 * 2. AI Vision (медленно, но надёжно)
 *
 * AI используется только когда:
 * - Нет testID
 * - Нужна визуальная верификация
 *
 * Запуск:
 *   node scripts/smart-test-runner.js              # Все тесты
 *   node scripts/smart-test-runner.js --fast       # Только быстрые (без AI)
 *   node scripts/smart-test-runner.js --suite=auth # Конкретный suite
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ============== CONFIG ==============

const CONFIG = {
  BASE_URL: 'https://daterabbit.smartlaunchhub.com',
  API_URL: 'https://daterabbit-api.smartlaunchhub.com/api',
  SCREENSHOTS_DIR: path.join(__dirname, '../tests/screenshots'),
  VIEWPORT: { width: 390, height: 844 },
  TIMEOUT: 10000,
};

// OpenRouter для AI Vision (только когда нужно)
const OPENROUTER_KEY = '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';
const VISION_MODEL = 'z-ai/glm-4.6v'; // Дешевле чем Claude

const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, val] = arg.replace('--', '').split('=');
  acc[key] = val || true;
  return acc;
}, {});

const FAST_MODE = args.fast;

// ============== HELPERS ==============

function generateEmail() {
  return `test${Date.now()}@test.local`;
}

async function aiGetCoords(page, description) {
  if (FAST_MODE) throw new Error('AI disabled in fast mode');

  const screenshot = await page.screenshot();
  const base64 = screenshot.toString('base64');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${base64}` } },
          { type: 'text', text: `Locate "${description}" and return bounding box [[xmin,ymin,xmax,ymax]]` }
        ]
      }],
      max_tokens: 100
    })
  });

  const data = await response.json();
  const result = data.choices[0].message.content.replace(/<\|[^>]+\|>/g, '');
  const match = result.match(/\[\[?\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\]?\]/);

  if (match) {
    const [, x1, y1, x2, y2] = match.map(Number);
    return {
      x: Math.round(((x1 + x2) / 2) * CONFIG.VIEWPORT.width / 1000),
      y: Math.round(((y1 + y2) / 2) * CONFIG.VIEWPORT.height / 1000)
    };
  }
  return null;
}

async function aiVerify(page, question) {
  if (FAST_MODE) return true; // Skip verification in fast mode

  const screenshot = await page.screenshot();
  const base64 = screenshot.toString('base64');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${base64}` } },
          { type: 'text', text: `${question}\nAnswer YES or NO first.` }
        ]
      }],
      max_tokens: 100
    })
  });

  const data = await response.json();
  const result = data.choices[0].message.content.replace(/<\|[^>]+\|>/g, '').toLowerCase();
  return result.startsWith('yes');
}

// ============== SMART CLICK ==============

async function smartClick(page, options) {
  const { testId, text, aiDescription, wait = 1000 } = options;

  // Priority 1: TestID (fastest)
  if (testId) {
    try {
      await page.click(`[testID="${testId}"], [data-testid="${testId}"]`, { timeout: 3000 });
      await page.waitForTimeout(wait);
      return { method: 'testId', success: true };
    } catch (e) {
      // TestID not found, try next method
    }
  }

  // Priority 2: Text content (fast)
  if (text) {
    try {
      await page.click(`text="${text}"`, { timeout: 3000 });
      await page.waitForTimeout(wait);
      return { method: 'text', success: true };
    } catch (e) {
      // Text not found, try AI
    }
  }

  // Priority 3: AI Vision (slow but reliable)
  if (aiDescription && !FAST_MODE) {
    const coords = await aiGetCoords(page, aiDescription);
    if (coords) {
      await page.mouse.click(coords.x, coords.y);
      await page.waitForTimeout(wait);
      return { method: 'ai', success: true, coords };
    }
  }

  return { method: 'none', success: false };
}

// ============== TEST SCENARIOS ==============

const SCENARIOS = {
  auth: [
    {
      name: 'Welcome Page Loads',
      fast: true,
      run: async (page) => {
        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        await page.waitForTimeout(1500);

        // Check elements exist
        const hasLogo = await page.$('text="DateRabbit"').catch(() => null);
        const hasCreateBtn = await page.$('text="Create Account"').catch(() => null);

        return !!(hasLogo && hasCreateBtn);
      }
    },
    {
      name: 'Navigate to Seeker Registration',
      fast: false,
      run: async (page) => {
        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        await page.waitForTimeout(1500);

        // Click Create Account
        await smartClick(page, {
          text: 'Create Account',
          aiDescription: 'Create Account button'
        });

        // Click Book dates
        await smartClick(page, {
          text: 'Book dates',
          aiDescription: 'Book dates or Date Seeker option'
        });

        // Verify we're on registration
        const hasNameField = await page.$('input[placeholder*="name" i]').catch(() => null);
        return !!hasNameField || await aiVerify(page, 'Is this a registration form?');
      }
    },
    {
      name: 'Navigate to Companion Registration',
      fast: false,
      run: async (page) => {
        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        await page.waitForTimeout(1500);

        await smartClick(page, { text: 'Create Account' });
        await smartClick(page, {
          text: 'Earn $$$',
          aiDescription: 'Earn money or Companion option'
        });

        const hasRateField = await page.$('input[placeholder*="rate" i]').catch(() => null);
        return !!hasRateField || await aiVerify(page, 'Is this a companion registration form with rate field?');
      }
    },
    {
      name: 'Navigate to Login',
      fast: true,
      run: async (page) => {
        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        await page.waitForTimeout(1500);

        await smartClick(page, { text: 'I already have an account' });

        const hasEmailField = await page.$('input[placeholder*="email" i]').catch(() => null);
        return !!hasEmailField;
      }
    },
    {
      name: 'Protected Route Redirects',
      fast: true,
      run: async (page) => {
        await page.goto(`${CONFIG.BASE_URL}/male/browse`);
        await page.waitForTimeout(2000);

        // Should redirect to welcome
        const url = page.url();
        return url.includes('welcome') || url.includes('login');
      }
    },
  ],

  registration: [
    {
      name: 'Seeker Form Validation - Empty Submit',
      fast: false,
      run: async (page) => {
        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        await page.waitForTimeout(1500);

        await smartClick(page, { text: 'Create Account' });
        await smartClick(page, { text: 'Book dates', aiDescription: 'Date Seeker option' });
        await page.waitForTimeout(1000);

        // Try to submit empty
        await smartClick(page, { text: 'Create Account', aiDescription: 'Submit button' });
        await page.waitForTimeout(1000);

        // Should show errors or stay on page
        return await aiVerify(page, 'Are there validation errors or is this still the registration form?');
      }
    },
    {
      name: 'Seeker Form Fill',
      fast: false,
      run: async (page) => {
        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        await page.waitForTimeout(1500);

        await smartClick(page, { text: 'Create Account' });
        await smartClick(page, { text: 'Book dates', aiDescription: 'Date Seeker option' });
        await page.waitForTimeout(1000);

        // Fill form
        await page.fill('input[placeholder*="name" i]', 'Test User');
        await page.fill('input[placeholder*="email" i]', generateEmail());
        await page.fill('input[placeholder*="birth" i], input[placeholder*="year" i]', '1990');
        await page.fill('input[placeholder*="city" i], input[placeholder*="location" i]', 'New York');

        return await aiVerify(page, 'Is the form filled with user data?');
      }
    },
  ],

  smoke: [
    {
      name: 'App Loads',
      fast: true,
      run: async (page) => {
        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        const title = await page.title();
        return title.length > 0;
      }
    },
    {
      name: 'No Console Errors',
      fast: true,
      run: async (page) => {
        const errors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') errors.push(msg.text());
        });

        await page.goto(`${CONFIG.BASE_URL}/welcome`);
        await page.waitForTimeout(3000);

        return errors.length === 0;
      }
    },
    {
      name: 'API Health',
      fast: true,
      run: async (page) => {
        try {
          const response = await fetch(`${CONFIG.API_URL}/health`);
          return response.ok;
        } catch {
          return false;
        }
      }
    },
  ],
};

// ============== RUNNER ==============

async function runTest(test, page, screenshotDir) {
  if (FAST_MODE && !test.fast) {
    return { name: test.name, skipped: true, reason: 'AI required' };
  }

  const start = Date.now();
  let passed = false;
  let error = null;

  try {
    passed = await test.run(page);
  } catch (e) {
    error = e.message;
  }

  // Screenshot
  const safeName = test.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  await page.screenshot({ path: path.join(screenshotDir, `${safeName}.png`) });

  return {
    name: test.name,
    passed,
    error,
    duration: Date.now() - start,
    fast: test.fast
  };
}

async function main() {
  console.log('\n🧪 Smart Test Runner');
  console.log(`📍 ${CONFIG.BASE_URL}`);
  console.log(`⚡ Fast mode: ${FAST_MODE ? 'ON (no AI)' : 'OFF (AI enabled)'}`);
  console.log(`🧠 Vision: ${VISION_MODEL}\n`);

  if (!fs.existsSync(CONFIG.SCREENSHOTS_DIR)) {
    fs.mkdirSync(CONFIG.SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  const selectedSuite = args.suite;
  const suitesToRun = selectedSuite
    ? { [selectedSuite]: SCENARIOS[selectedSuite] }
    : SCENARIOS;

  if (selectedSuite && !SCENARIOS[selectedSuite]) {
    console.error(`❌ Unknown suite: ${selectedSuite}`);
    console.log(`Available: ${Object.keys(SCENARIOS).join(', ')}`);
    process.exit(1);
  }

  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const [suiteName, tests] of Object.entries(suitesToRun)) {
    console.log(`\n${'─'.repeat(40)}`);
    console.log(`📋 ${suiteName.toUpperCase()}`);
    console.log('─'.repeat(40));

    const screenshotDir = path.join(CONFIG.SCREENSHOTS_DIR, suiteName);
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

    const context = await browser.newContext({ viewport: CONFIG.VIEWPORT });
    const page = await context.newPage();

    for (const test of tests) {
      const icon = test.fast ? '⚡' : '🧠';
      process.stdout.write(`${icon} ${test.name}... `);

      const result = await runTest(test, page, screenshotDir);

      if (result.skipped) {
        console.log(`⏭️ skipped (${result.reason})`);
        totalSkipped++;
      } else if (result.passed) {
        console.log(`✅ ${result.duration}ms`);
        totalPassed++;
      } else {
        console.log(`❌ ${result.error || 'failed'}`);
        totalFailed++;
      }
    }

    await context.close();
  }

  await browser.close();

  // Summary
  console.log(`\n${'═'.repeat(40)}`);
  console.log('📊 SUMMARY');
  console.log('═'.repeat(40));
  console.log(`✅ Passed:  ${totalPassed}`);
  console.log(`❌ Failed:  ${totalFailed}`);
  console.log(`⏭️ Skipped: ${totalSkipped}`);
  console.log(`📈 Rate:    ${Math.round(totalPassed / (totalPassed + totalFailed) * 100 || 0)}%`);
  console.log(`📸 Screenshots: ${CONFIG.SCREENSHOTS_DIR}\n`);

  process.exit(totalFailed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
