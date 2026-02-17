/**
 * Scenario Runner - executes YAML test scenarios
 *
 * Usage: node scripts/scenario-runner.js [scenario-name|all]
 *
 * Human writes YAML scenarios once, AI just runs them.
 * No AI-generated tests - just declarative execution.
 */
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const SCENARIOS_DIR = path.join(__dirname, '../tests/scenarios');
const SCREENSHOTS_DIR = path.join(__dirname, '../tests/scenario-screenshots');
const CONTEXT_FILE = path.join(__dirname, '../../.ai/context.json');

const context = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8'));
const BASE_URL = process.env.BASE_URL || context.prod_url;

// Ensure screenshots dir exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runScenario(scenarioPath) {
  const content = fs.readFileSync(scenarioPath, 'utf-8');
  const scenario = yaml.parse(content);
  const scenarioName = path.basename(scenarioPath, '.yaml');

  console.log(`\n🎬 Running: ${scenario.name}`);
  console.log(`   ${scenario.description || ''}\n`);

  const browser = await chromium.launch({ headless: true });
  const browserContext = await browser.newContext();
  const page = await browserContext.newPage();

  const results = {
    name: scenario.name,
    file: scenarioName,
    steps: [],
    passed: true,
    errors: []
  };

  let stepNum = 0;

  // Process variables
  const vars = {
    TIMESTAMP: Date.now(),
    ...scenario.variables
  };

  function replaceVars(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/\$\{(\w+)\}/g, (_, name) => vars[name] || '');
  }

  try {
    for (const step of scenario.steps) {
      stepNum++;
      const stepResult = { step: stepNum, action: null, status: 'ok', error: null };

      try {
        // GOTO
        if (step.goto) {
          const url = `${BASE_URL}${replaceVars(step.goto)}`;
          stepResult.action = `goto ${step.goto}`;
          process.stdout.write(`  ${stepNum}. goto ${step.goto} ... `);
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
          console.log('✅');
        }

        // CLICK
        if (step.click) {
          const clickOpts = typeof step.click === 'string'
            ? { text: step.click }
            : step.click;

          stepResult.action = `click "${clickOpts.text || clickOpts.selector}"`;
          process.stdout.write(`  ${stepNum}. click "${clickOpts.text || clickOpts.selector}" ... `);

          if (clickOpts.text) {
            const locator = page.locator(`text="${clickOpts.text}"`).first();
            await locator.click({ timeout: 5000 });
          } else if (clickOpts.selector) {
            const locator = page.locator(clickOpts.selector);
            if (clickOpts.index !== undefined) {
              await locator.nth(clickOpts.index).click({ timeout: 5000 });
            } else {
              await locator.first().click({ timeout: 5000 });
            }
          }
          console.log('✅');
        }

        // FILL
        if (step.fill) {
          const selector = step.fill.selector;
          const value = replaceVars(step.fill.value);
          stepResult.action = `fill ${selector}`;
          process.stdout.write(`  ${stepNum}. fill ${selector} ... `);
          await page.locator(selector).fill(value, { timeout: 5000 });
          console.log('✅');
        }

        // EXPECT
        if (step.expect) {
          if (step.expect.url_contains) {
            stepResult.action = `expect url contains "${step.expect.url_contains}"`;
            process.stdout.write(`  ${stepNum}. expect url contains "${step.expect.url_contains}" ... `);
            await page.waitForURL(`**${step.expect.url_contains}**`, { timeout: 10000 });
            console.log('✅');
          }
        }

        // ASSERT
        if (step.assert) {
          if (step.assert.visible) {
            stepResult.action = `assert visible "${step.assert.visible}"`;
            process.stdout.write(`  ${stepNum}. assert visible "${step.assert.visible}" ... `);
            await page.locator(`text="${step.assert.visible}"`).waitFor({ state: 'visible', timeout: 5000 });
            console.log('✅');
          }

          if (step.assert.selector) {
            stepResult.action = `assert selector "${step.assert.selector}"`;
            process.stdout.write(`  ${stepNum}. assert ${step.assert.selector} ... `);
            const elements = await page.locator(step.assert.selector).all();
            if (step.assert.min_count && elements.length < step.assert.min_count) {
              throw new Error(step.assert.message || `Expected at least ${step.assert.min_count} elements, found ${elements.length}`);
            }
            console.log('✅');
          }
        }

        // WAIT
        if (step.wait) {
          await page.waitForTimeout(step.wait);
        }

        // SCREENSHOT
        if (step.screenshot) {
          const screenshotPath = path.join(SCREENSHOTS_DIR, `${scenarioName}-${String(stepNum).padStart(2, '0')}.png`);
          await page.screenshot({ path: screenshotPath });
        }

      } catch (err) {
        stepResult.status = 'error';
        stepResult.error = err.message;
        results.passed = false;
        results.errors.push({ step: stepNum, error: err.message });
        console.log('❌');
        console.log(`     Error: ${err.message.slice(0, 100)}`);
      }

      results.steps.push(stepResult);
    }
  } finally {
    await browser.close();
  }

  return results;
}

async function main() {
  const target = process.argv[2] || 'all';

  console.log(`\n🧪 Scenario Runner`);
  console.log(`📍 Base URL: ${BASE_URL}\n`);

  let scenarios = [];

  if (target === 'all') {
    const files = fs.readdirSync(SCENARIOS_DIR).filter(f => f.endsWith('.yaml'));
    scenarios = files.map(f => path.join(SCENARIOS_DIR, f));
  } else {
    const file = path.join(SCENARIOS_DIR, `${target}.yaml`);
    if (fs.existsSync(file)) {
      scenarios = [file];
    } else {
      console.error(`Scenario not found: ${target}`);
      process.exit(1);
    }
  }

  console.log(`📋 Scenarios to run: ${scenarios.length}\n`);

  const allResults = [];

  for (const scenario of scenarios) {
    const result = await runScenario(scenario);
    allResults.push(result);
  }

  // Summary
  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.filter(r => !r.passed).length;

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log(`\n❌ FAILED SCENARIOS:`);
    allResults.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}`);
      r.errors.forEach(e => console.log(`     Step ${e.step}: ${e.error.slice(0, 80)}`));
    });
    process.exit(1);
  } else {
    console.log(`\n✅ ALL SCENARIOS PASSED\n`);
  }
}

main().catch(console.error);
