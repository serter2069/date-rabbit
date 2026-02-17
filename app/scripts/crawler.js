/**
 * SPA Crawler - visits all routes from context.json
 * Catches errors, 404s, white screens, console errors
 */
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const CONTEXT_FILE = path.join(__dirname, '../../.ai/context.json');
const BUGS_FILE = path.join(__dirname, '../../.ai/bugs.json');

const context = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8'));
const PROD_URL = process.argv[2] || context.prod_url;
const ROUTES = context.routes || [];

const errors = [];
const results = [];

async function crawl() {
  console.log(`\n🕷️  SPA Crawler starting on ${PROD_URL}`);
  console.log(`📋 Routes to check: ${ROUTES.length}\n`);

  const browser = await chromium.launch({ headless: true });
  const browserContext = await browser.newContext();
  const page = await browserContext.newPage();

  // Catch console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon') && !text.includes('net::ERR')) {
        errors.push({
          type: 'console_error',
          route: page.url().replace(PROD_URL, ''),
          message: text.slice(0, 200)
        });
      }
    }
  });

  // Catch page errors (uncaught exceptions)
  page.on('pageerror', err => {
    errors.push({
      type: 'js_error',
      route: page.url().replace(PROD_URL, ''),
      message: err.message.slice(0, 200)
    });
  });

  // Visit each route
  for (const route of ROUTES) {
    const url = `${PROD_URL}${route}`;
    const result = { route, status: 'ok', error: null };

    try {
      process.stdout.write(`  → ${route} ... `);

      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      // Check HTTP status
      if (response && response.status() >= 400) {
        result.status = 'error';
        result.error = `HTTP ${response.status()}`;
        errors.push({ type: 'http_error', route, message: `HTTP ${response.status()}` });
      }

      // Wait for content to render
      await page.waitForTimeout(500);

      // Check for white screen
      const bodyText = await page.evaluate(() => document.body?.innerText?.trim() || '');
      if (bodyText.length < 20 && !route.includes('otp')) {
        result.status = 'warning';
        result.error = 'Possibly empty page';
      }

      // Check for error boundary or crash
      const hasError = await page.evaluate(() => {
        const text = document.body?.innerText || '';
        return text.includes('Something went wrong') ||
               text.includes('Error:') ||
               text.includes('Cannot read') ||
               text.includes('undefined is not');
      });

      if (hasError) {
        result.status = 'error';
        result.error = 'Error visible on page';
        errors.push({ type: 'visible_error', route, message: 'Error message visible on page' });
      }

      console.log(result.status === 'ok' ? '✅' : result.status === 'warning' ? '⚠️' : '❌');

    } catch (err) {
      result.status = 'error';
      result.error = err.message.slice(0, 100);
      errors.push({ type: 'load_error', route, message: err.message.slice(0, 100) });
      console.log('❌');
    }

    results.push(result);
  }

  await browser.close();

  // Summary
  const passed = results.filter(r => r.status === 'ok').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const failed = results.filter(r => r.status === 'error').length;

  console.log(`\n📊 Results: ${passed} ok, ${warnings} warnings, ${failed} errors`);
  console.log(`🐛 Total issues: ${errors.length}\n`);

  // Write bugs if any
  if (errors.length > 0) {
    const existingBugs = JSON.parse(fs.readFileSync(BUGS_FILE, 'utf-8') || '[]');
    let bugId = existingBugs.length;

    const newBugs = errors.map(err => ({
      id: `bug-${String(++bugId).padStart(3, '0')}`,
      status: 'open',
      source: 'crawler',
      type: err.type,
      route: err.route,
      description: err.message,
      foundAt: new Date().toISOString()
    }));

    fs.writeFileSync(BUGS_FILE, JSON.stringify([...existingBugs, ...newBugs], null, 2));
    console.log(`📝 Written ${newBugs.length} bugs to bugs.json\n`);

    // Print errors
    console.log('Errors found:');
    errors.forEach(e => console.log(`  - [${e.type}] ${e.route}: ${e.message}`));
  } else {
    console.log('✅ No bugs found!\n');
  }
}

crawl().catch(console.error);
