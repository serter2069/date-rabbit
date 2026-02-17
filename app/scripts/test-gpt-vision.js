/**
 * GPT-4 Vision Test - AI смотрит на скриншоты и управляет браузером
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://daterabbit.smartlaunchhub.com';
const SCREENSHOTS_DIR = path.join(__dirname, '../tests/scenario-screenshots');

// OpenRouter API - 280+ models including vision
const OPENROUTER_API_KEY = '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';
const VISION_MODEL = 'anthropic/claude-sonnet-4.5'; // Better at coordinates

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
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${imageBase64}`
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      }],
      max_tokens: 500
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.choices[0].message.content;
}

async function getClickTarget(screenshotPath, elementDescription) {
  const imageData = fs.readFileSync(screenshotPath);
  const base64 = imageData.toString('base64');

  const prompt = `You are a UI testing assistant analyzing a 1280x720 pixel screenshot.
Your task: Find the CENTER coordinates of "${elementDescription}"

IMPORTANT:
- x=0 is left edge, x=1280 is right edge
- y=0 is TOP edge, y=720 is BOTTOM edge
- The element is likely in the CENTER of the image (x around 400-900, y around 200-600)

Return ONLY valid JSON: {"x": number, "y": number}
If not found: {"error": "not found", "reason": "brief explanation"}`;

  const result = await callVisionAI(base64, prompt);
  console.log('   AI response:', result.slice(0, 100));

  try {
    const match = result.match(/\{[^}]+\}/);
    return match ? JSON.parse(match[0]) : { error: 'no json' };
  } catch {
    return { error: 'parse failed', raw: result };
  }
}

async function runTest() {
  console.log('\n🧠 AI Vision Test (OpenRouter + Gemini)\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  try {
    // Step 1: Welcome page
    console.log('Step 1: Opening welcome page...');
    await page.goto(`${BASE_URL}/welcome`);
    await page.waitForTimeout(2000);
    const shot1 = path.join(SCREENSHOTS_DIR, 'gpt-vision-01.png');
    await page.screenshot({ path: shot1 });

    // Find Create Account
    const createBtn = await getClickTarget(shot1, 'the coral/salmon colored "Create Account" button');
    console.log('   Found button at:', createBtn);

    if (createBtn.x && createBtn.y) {
      // Step 2: Click Create Account
      console.log('Step 2: Clicking Create Account...');
      await page.mouse.click(createBtn.x, createBtn.y);
      await page.waitForTimeout(1500);

      const shot2 = path.join(SCREENSHOTS_DIR, 'gpt-vision-02.png');
      await page.screenshot({ path: shot2 });

      // Find Date Seeker
      const seekerBtn = await getClickTarget(shot2, 'the "Book dates" button or Date Seeker option');
      console.log('   Found seeker at:', seekerBtn);

      if (seekerBtn.x && seekerBtn.y) {
        // Step 3: Click Date Seeker
        console.log('Step 3: Clicking Date Seeker...');
        await page.mouse.click(seekerBtn.x, seekerBtn.y);
        await page.waitForTimeout(1500);

        const shot3 = path.join(SCREENSHOTS_DIR, 'gpt-vision-03.png');
        await page.screenshot({ path: shot3 });

        // Verify we're on registration form
        const imageData = fs.readFileSync(shot3);
        const analysis = await callVisionAI(
          imageData.toString('base64'),
          'Is this a registration form? Answer YES or NO and briefly describe what you see.'
        );
        console.log('Step 4: Verification -', analysis);

        if (analysis.toLowerCase().includes('yes')) {
          console.log('\n✅ TEST PASSED - Successfully navigated to registration form\n');
        } else {
          console.log('\n⚠️ TEST WARNING - May not be on registration form\n');
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

runTest().catch(console.error);
