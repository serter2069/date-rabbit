// Logic Testing - Autonomous exploration of DateRabbit
const { chromium } = require('playwright');

const BASE_URL = 'https://daterabbit.smartlaunchhub.com';
const SCREENSHOT_DIR = './tests/logic-screenshots';

async function explore() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro
  });
  const page = await context.newPage();

  let step = 1;
  const findings = {
    url: BASE_URL,
    exploredAt: new Date().toISOString(),
    screens: [],
  };

  async function screenshot(name, description) {
    const path = `${SCREENSHOT_DIR}/${String(step).padStart(2, '0')}-${name}.png`;
    await page.screenshot({ path });
    console.log(`📸 [${step}] ${name}: ${description || ''}`);
    findings.screens.push({ step, name, description, path });
    step++;
    return path;
  }

  async function clickText(text) {
    // React Native Web renders text differently
    const clicked = await page.evaluate((searchText) => {
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        if (el.textContent?.trim() === searchText && el.childNodes.length <= 3) {
          el.click();
          return true;
        }
      }
      return false;
    }, text);
    return clicked;
  }

  async function getVisibleText() {
    return await page.evaluate(() => {
      const texts = [];
      document.querySelectorAll('*').forEach(el => {
        if (el.childNodes.length <= 1 && el.textContent?.trim()) {
          const text = el.textContent.trim();
          if (text.length > 0 && text.length < 100) {
            texts.push(text);
          }
        }
      });
      return [...new Set(texts)];
    });
  }

  try {
    // ========== STEP 1: Landing / Onboarding ==========
    console.log('\n🚀 Starting DateRabbit exploration...\n');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const landingText = await getVisibleText();
    console.log('📋 Visible text:', landingText.join(' | '));
    await screenshot('onboarding-1', 'First onboarding screen');

    // ========== STEP 2: Click through onboarding ==========
    for (let i = 0; i < 4; i++) {
      const hasNext = await clickText('Next');
      if (hasNext) {
        await page.waitForTimeout(800);
        const texts = await getVisibleText();
        console.log(`📋 Screen ${i + 2} text:`, texts.slice(0, 5).join(' | '));
        await screenshot(`onboarding-${i + 2}`, `Onboarding step ${i + 2}`);
      } else {
        break;
      }
    }

    // ========== STEP 3: Role Selection ==========
    const currentText = await getVisibleText();
    console.log('\n📋 Current screen:', currentText.slice(0, 10).join(' | '));

    // Check for role selection
    const hasCompanion = currentText.some(t => t.includes('Companion') || t.includes('Female'));
    const hasSeeker = currentText.some(t => t.includes('Seeker') || t.includes('Male'));

    if (hasCompanion || hasSeeker) {
      console.log('\n👥 Role Selection detected');
      await screenshot('role-selection', 'Choose your role');

      // Click Companion
      const clicked = await clickText('Companion') || await clickText("I'm a Companion");
      if (clicked) {
        await page.waitForTimeout(1000);
        await screenshot('companion-selected', 'After selecting Companion');
      }
    }

    // ========== STEP 4: Check for Welcome screen ==========
    const welcomeText = await getVisibleText();
    console.log('\n📋 After role:', welcomeText.slice(0, 10).join(' | '));

    const hasGetStarted = welcomeText.some(t => t.includes('Get Started') || t.includes('Start'));
    if (hasGetStarted) {
      await screenshot('welcome', 'Welcome screen');
      const started = await clickText('Get Started');
      if (started) {
        await page.waitForTimeout(1000);
        await screenshot('after-get-started', 'After Get Started');
      }
    }

    // ========== STEP 5: Check Login/Register ==========
    const authText = await getVisibleText();
    console.log('\n📋 Auth screen:', authText.slice(0, 10).join(' | '));

    const hasLogin = authText.some(t => t.includes('Log in') || t.includes('Login') || t.includes('Sign in'));
    const hasRegister = authText.some(t => t.includes('Sign up') || t.includes('Register') || t.includes('Create'));

    if (hasLogin || hasRegister) {
      await screenshot('auth-screen', 'Authentication screen');
    }

    // ========== STEP 6: Try to see main app (if accessible) ==========
    const hasSkip = authText.some(t => t === 'Skip');
    if (hasSkip) {
      console.log('⏭️ Found Skip button, clicking...');
      await clickText('Skip');
      await page.waitForTimeout(1000);
      await screenshot('main-app', 'Main app after skip');
    }

    // ========== Final Screenshot ==========
    await screenshot('final-state', 'Final exploration state');

    // ========== Write findings ==========
    require('fs').writeFileSync(
      `${SCREENSHOT_DIR}/findings.json`,
      JSON.stringify(findings, null, 2)
    );

    console.log('\n✅ Exploration complete!');
    console.log(`📊 Captured ${findings.screens.length} screenshots`);
    console.log(`📁 Screenshots: ${SCREENSHOT_DIR}/`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await screenshot('error-state', `Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

explore();
