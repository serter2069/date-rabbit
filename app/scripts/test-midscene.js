/**
 * Midscene.js Test - AI-driven UI testing
 *
 * Natural language commands, AI understands the UI
 */
const { chromium } = require('playwright');
const { PlaywrightAgent } = require('@midscene/web');

const BASE_URL = 'https://daterabbit.smartlaunchhub.com';

async function runMidsceneTest() {
  console.log('\n🤖 Midscene.js Test\n');

  const browser = await chromium.launch({ headless: false }); // visible for demo
  const context = await browser.newContext();
  const page = await context.newPage();

  // Initialize Midscene AI Agent
  const agent = new PlaywrightAgent(page);

  try {
    // Go to welcome page
    await page.goto(`${BASE_URL}/welcome`);
    await page.waitForTimeout(2000);
    console.log('1. Opened welcome page');

    // AI commands in natural language
    await agent.aiAction('click the "Create Account" button');
    console.log('2. ✅ Clicked Create Account');

    await page.waitForTimeout(1000);

    await agent.aiAction('click on "Book dates" or "Date Seeker" option');
    console.log('3. ✅ Selected Date Seeker role');

    await page.waitForTimeout(1000);

    await agent.aiAction('fill the name input field with "Test User"');
    console.log('4. ✅ Filled name');

    await agent.aiAction('fill the email input with "test@example.com"');
    console.log('5. ✅ Filled email');

    await agent.aiAction('fill birth year field with "1990"');
    console.log('6. ✅ Filled birth year');

    await agent.aiAction('fill city or location field with "New York"');
    console.log('7. ✅ Filled location');

    // Take screenshot
    await page.screenshot({ path: 'tests/scenario-screenshots/midscene-filled.png' });

    // Assert
    await agent.aiAssert('the registration form has all fields filled');
    console.log('8. ✅ Assertion passed');

    console.log('\n✅ MIDSCENE TEST PASSED\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'tests/scenario-screenshots/midscene-error.png' });
  } finally {
    await browser.close();
  }
}

runMidsceneTest().catch(console.error);
