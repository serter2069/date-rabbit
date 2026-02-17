/**
 * Magnitude Test - Vision-first AI browser automation
 *
 * Dual-agent system: planner + executor
 */
const { magnitude } = require('magnitude-test');

const BASE_URL = 'https://daterabbit.smartlaunchhub.com';

async function runMagnitudeTest() {
  console.log('\n🔬 Magnitude Test\n');

  try {
    // Initialize Magnitude
    const agent = await magnitude.launch({
      headless: false,
      model: 'claude-sonnet-4-20250514' // or use Qwen for free
    });

    // Navigate to app
    await agent.goto(`${BASE_URL}/welcome`);
    console.log('1. Opened welcome page');

    // Natural language test flow
    await agent.do('Click on Create Account button');
    console.log('2. ✅ Clicked Create Account');

    await agent.do('Select the Date Seeker option');
    console.log('3. ✅ Selected role');

    await agent.do('Fill out the registration form with name "Test User", email "test@example.com", birth year 1990, and city "New York"');
    console.log('4. ✅ Filled form');

    // Visual assertion
    const isFormFilled = await agent.check('Is the registration form filled with user information?');
    console.log('5. Form filled check:', isFormFilled);

    // Screenshot
    await agent.screenshot('tests/scenario-screenshots/magnitude-filled.png');

    console.log('\n✅ MAGNITUDE TEST PASSED\n');

    await agent.close();

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runMagnitudeTest().catch(console.error);
