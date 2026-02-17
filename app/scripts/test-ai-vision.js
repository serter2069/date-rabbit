/**
 * AI Vision Test - простой тест с Claude/GPT vision
 *
 * AI смотрит на скриншот и говорит что делать
 */
const { chromium } = require('playwright');
const Anthropic = require('@anthropic-ai/sdk').default;
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://daterabbit.smartlaunchhub.com';
const SCREENSHOTS_DIR = path.join(__dirname, '../tests/scenario-screenshots');

// Anthropic client - use env var or hardcoded key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'sk-ant-api03-placeholder'
});

async function analyzeScreenshot(screenshotPath, prompt) {
  const imageData = fs.readFileSync(screenshotPath);
  const base64 = imageData.toString('base64');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: base64
          }
        },
        {
          type: 'text',
          text: prompt
        }
      ]
    }]
  });

  return response.content[0].text;
}

async function getClickCoordinates(screenshotPath, elementDescription) {
  const prompt = `Look at this screenshot of a web app.
Find the element: "${elementDescription}"
Return ONLY the x,y coordinates of the CENTER of that element as JSON: {"x": number, "y": number}
The screenshot is 1280x720 pixels.
If element not found, return {"error": "not found"}`;

  const result = await analyzeScreenshot(screenshotPath, prompt);
  try {
    return JSON.parse(result.match(/\{[^}]+\}/)[0]);
  } catch {
    return { error: result };
  }
}

async function runTest() {
  console.log('\n🤖 AI Vision Test\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  try {
    // Step 1: Go to welcome
    await page.goto(`${BASE_URL}/welcome`);
    await page.waitForTimeout(2000);
    const shot1 = path.join(SCREENSHOTS_DIR, 'ai-vision-01.png');
    await page.screenshot({ path: shot1 });
    console.log('1. Screenshot taken: welcome page');

    // Ask AI what it sees
    const analysis = await analyzeScreenshot(shot1, 'What do you see on this page? List the main UI elements and buttons.');
    console.log('   AI analysis:', analysis.slice(0, 200) + '...');

    // Step 2: Find and click "Create Account"
    const coords = await getClickCoordinates(shot1, 'Create Account button');
    console.log('2. Found "Create Account" at:', coords);

    if (!coords.error) {
      await page.mouse.click(coords.x, coords.y);
      await page.waitForTimeout(1500);

      const shot2 = path.join(SCREENSHOTS_DIR, 'ai-vision-02.png');
      await page.screenshot({ path: shot2 });
      console.log('3. Clicked and took screenshot');

      // Ask AI what happened
      const afterClick = await analyzeScreenshot(shot2, 'What screen is this? What are the options available?');
      console.log('   AI sees:', afterClick.slice(0, 200) + '...');

      // Step 3: Find Date Seeker option
      const seekerCoords = await getClickCoordinates(shot2, 'Date Seeker or Book dates option');
      console.log('4. Found "Date Seeker" at:', seekerCoords);

      if (!seekerCoords.error) {
        await page.mouse.click(seekerCoords.x, seekerCoords.y);
        await page.waitForTimeout(1500);

        const shot3 = path.join(SCREENSHOTS_DIR, 'ai-vision-03.png');
        await page.screenshot({ path: shot3 });
        console.log('5. Clicked Date Seeker');

        // Final analysis
        const finalAnalysis = await analyzeScreenshot(shot3, 'Is this a registration form? What fields are visible?');
        console.log('   AI sees:', finalAnalysis.slice(0, 200) + '...');
      }
    }

    console.log('\n✅ AI VISION TEST COMPLETED\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

runTest().catch(console.error);
