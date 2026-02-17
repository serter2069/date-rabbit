/**
 * AI Vision Test Runner - автоматическое тестирование через AI
 *
 * AI смотрит на скриншоты и управляет браузером
 * Не нужно писать селекторы - просто описания на естественном языке
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// OpenRouter API
const OPENROUTER_API_KEY = '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';

// Available vision models (can switch via CLI arg)
const VISION_MODELS = {
  'claude': 'anthropic/claude-sonnet-4.5',
  'glm': 'z-ai/glm-4.6v',      // GLM Vision - cheaper
  'glm45': 'z-ai/glm-4.5v',    // GLM 4.5 Vision
  'qwen': 'qwen/qwen2.5-vl-32b-instruct',  // 🏆 Cheapest: $0.05/M input
  'qwen3': 'qwen/qwen3-vl-8b-instruct',    // $0.08/M - newest
  'qwen72': 'qwen/qwen2.5-vl-72b-instruct', // $0.15/M - best accuracy
};

// Use model from CLI arg or default to qwen (cheapest)
const modelArg = process.argv[2];
const VISION_MODEL = VISION_MODELS[modelArg] || VISION_MODELS['qwen'];

const BASE_URL = 'https://daterabbit.smartlaunchhub.com';
const SCREENSHOTS_DIR = path.join(__dirname, '../tests/ai-screenshots');

// Test scenarios - describe what to test in natural language
const SCENARIOS = [
  {
    name: 'Registration - Seeker',
    steps: [
      { goto: '/welcome', screenshot: true },
      { click: 'the coral/salmon colored "Create Account" button at the bottom', wait: 1500 },
      { click: 'the "Book dates" button (coral/salmon button inside Date Seeker card)', wait: 1500 },
      { verify: 'Is this a registration form with name, email, birth year fields?' }
    ]
  },
  {
    name: 'Registration - Companion',
    steps: [
      { goto: '/welcome' },
      { click: 'the coral/salmon colored "Create Account" button at the bottom', wait: 1500 },
      { click: 'the "Earn $$$" button (coral/orange button inside Date Companion card)', wait: 1500 },
      { verify: 'Is this a registration form for companions?' }
    ]
  },
  {
    name: 'Login Page',
    steps: [
      { goto: '/welcome' },
      { click: 'I already have an account', wait: 1500 },
      { verify: 'Is this a login page with email input?' }
    ]
  },
  {
    name: 'Auth Redirect Check',
    steps: [
      { goto: '/male/browse', screenshot: true },
      { verify: 'Is this a welcome/login page (redirected from protected route)? YES if shows DateRabbit welcome or login.' }
    ]
  }
];

async function callVisionAI(imageBase64, prompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://daterabbit.smartlaunchhub.com',
      'X-Title': 'DateRabbit AI Testing'
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
      max_tokens: 500
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
}

async function getClickCoords(screenshotPath, description) {
  const imageData = fs.readFileSync(screenshotPath);
  const base64 = imageData.toString('base64');

  // Use different prompts for different models
  const isGLM = VISION_MODEL.includes('glm');

  const prompt = isGLM
    ? `Locate the "${description}" and provide its bounding box coordinates in [[xmin,ymin,xmax,ymax]] format.`
    : `You are a UI testing assistant analyzing a 1280x720 pixel screenshot.
Find the CENTER coordinates of: "${description}"

Coordinate system:
- x=0 is left, x=1280 is right
- y=0 is TOP, y=720 is BOTTOM

Return ONLY valid JSON: {"x": number, "y": number}
If not found: {"error": "not found", "reason": "brief explanation"}`;

  const result = await callVisionAI(base64, prompt);

  // Clean GLM-style box tags
  const cleaned = result.replace(/<\|[^>]+\|>/g, '').trim();

  // For GLM: parse bounding box [[xmin,ymin,xmax,ymax]] and convert from 0-1000 to pixels
  if (isGLM) {
    const boxMatch = cleaned.match(/\[\[?\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\]?\]/);
    if (boxMatch) {
      const [, x1, y1, x2, y2] = boxMatch.map(Number);
      // GLM uses normalized 0-1000 coordinates
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      // Convert to pixels (1280x720)
      return {
        x: Math.round(cx * 1280 / 1000),
        y: Math.round(cy * 720 / 1000)
      };
    }
    return { error: 'no bounding box', raw: result.slice(0, 100) };
  }

  // For Claude and others: parse JSON or coordinates
  try {
    const jsonMatch = cleaned.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0]
        .replace(/'/g, '"')
        .replace(/(\w+):/g, '"$1":')
        .replace(/""(\w+)""/g, '"$1"');
      return JSON.parse(jsonStr);
    }
  } catch (e) {
    // Ignore and try next method
  }

  // Try extracting x and y directly
  const xMatch = cleaned.match(/x["\s:=]+(\d+)/i);
  const yMatch = cleaned.match(/y["\s:=]+(\d+)/i);
  if (xMatch && yMatch) {
    return { x: parseInt(xMatch[1]), y: parseInt(yMatch[1]) };
  }

  return { error: 'parse failed', raw: result.slice(0, 100) };
}

async function verifyScreen(screenshotPath, question) {
  const imageData = fs.readFileSync(screenshotPath);
  const base64 = imageData.toString('base64');

  const prompt = `${question}
Answer with YES or NO first, then briefly explain what you see (1-2 sentences).`;

  const result = await callVisionAI(base64, prompt);

  // Clean up GLM-style box tags
  return result.replace(/<\|[^|]+\|>/g, '').trim();
}

async function runScenario(scenario, page) {
  console.log(`\n📋 ${scenario.name}`);

  const scenarioDir = path.join(SCREENSHOTS_DIR, scenario.name.replace(/[^a-z0-9]/gi, '-').toLowerCase());
  if (!fs.existsSync(scenarioDir)) fs.mkdirSync(scenarioDir, { recursive: true });

  let stepNum = 0;
  let passed = true;
  const errors = [];

  for (const step of scenario.steps) {
    stepNum++;
    const shotPath = path.join(scenarioDir, `step-${String(stepNum).padStart(2, '0')}.png`);

    try {
      // GOTO
      if (step.goto) {
        await page.goto(`${BASE_URL}${step.goto}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: shotPath });
        console.log(`   ${stepNum}. goto ${step.goto} ✅`);
      }

      // CLICK
      if (step.click) {
        if (!fs.existsSync(shotPath)) {
          await page.screenshot({ path: shotPath });
        }

        const coords = await getClickCoords(shotPath, step.click);

        if (coords.error) {
          console.log(`   ${stepNum}. click "${step.click}" ❌ (${coords.reason || coords.error})`);
          errors.push({ step: stepNum, error: coords.reason || coords.error });
          passed = false;
        } else {
          await page.mouse.click(coords.x, coords.y);
          console.log(`   ${stepNum}. click "${step.click}" at (${coords.x}, ${coords.y}) ✅`);
        }

        if (step.wait) await page.waitForTimeout(step.wait);
        await page.screenshot({ path: shotPath.replace('.png', '-after.png') });
      }

      // VERIFY
      if (step.verify) {
        await page.screenshot({ path: shotPath });
        const result = await verifyScreen(shotPath, step.verify);
        const isPassed = result.toLowerCase().startsWith('yes');

        if (isPassed) {
          console.log(`   ${stepNum}. verify: ✅ ${result.slice(0, 80)}...`);
        } else {
          console.log(`   ${stepNum}. verify: ❌ ${result.slice(0, 80)}...`);
          errors.push({ step: stepNum, error: result });
          passed = false;
        }
      }

      // SCREENSHOT
      if (step.screenshot && !step.goto) {
        await page.screenshot({ path: shotPath });
      }

    } catch (err) {
      console.log(`   ${stepNum}. ERROR: ${err.message.slice(0, 60)}`);
      errors.push({ step: stepNum, error: err.message });
      passed = false;
    }
  }

  return { name: scenario.name, passed, errors };
}

async function runAllTests() {
  console.log('\n🤖 AI Vision Test Runner');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`🧠 Model: ${VISION_MODEL}`);
  console.log(`📋 Scenarios: ${SCENARIOS.length}\n`);

  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const results = [];

  for (const scenario of SCENARIOS) {
    const result = await runScenario(scenario, page);
    results.push(result);
  }

  await browser.close();

  // Summary
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n❌ FAILED SCENARIOS:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}`);
      r.errors.forEach(e => console.log(`     Step ${e.step}: ${e.error.slice(0, 60)}`));
    });
  }

  console.log(`\n📸 Screenshots: ${SCREENSHOTS_DIR}\n`);

  return failed === 0;
}

// Run
runAllTests()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
  });
