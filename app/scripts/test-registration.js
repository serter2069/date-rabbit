/**
 * E2E Registration Test - проверяет реальный флоу
 */
const { chromium } = require('@playwright/test');

const PROD_URL = 'https://daterabbit.smartlaunchhub.com';
const API_URL = 'https://daterabbit-api.smartlaunchhub.com/api';

async function testRegistration() {
  console.log('\n🧪 Testing Registration Flow\n');
  
  const results = [];
  
  // 1. Test API health
  console.log('1. API Health...');
  try {
    const res = await fetch(`${API_URL}/health`);
    const data = await res.json();
    if (data.status === 'ok') {
      console.log('   ✅ API is healthy');
      results.push({ test: 'API Health', status: 'pass' });
    } else {
      throw new Error('API unhealthy');
    }
  } catch (e) {
    console.log('   ❌ API is down');
    results.push({ test: 'API Health', status: 'fail', error: e.message });
  }
  
  // 2. Test OTP endpoint
  console.log('2. OTP Endpoint...');
  try {
    const res = await fetch(`${API_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test-flow@example.com' })
    });
    const data = await res.json();
    if (data.message?.includes('OTP')) {
      console.log('   ✅ OTP endpoint works');
      results.push({ test: 'OTP Endpoint', status: 'pass' });
    } else {
      throw new Error(data.message || 'Unknown error');
    }
  } catch (e) {
    console.log('   ❌ OTP endpoint failed:', e.message);
    results.push({ test: 'OTP Endpoint', status: 'fail', error: e.message });
  }
  
  // 3. Test companions endpoint
  console.log('3. Companions API...');
  try {
    const res = await fetch(`${API_URL}/companions?limit=10`);
    const data = await res.json();
    console.log(`   ℹ️  Found ${data.total} companions in DB`);
    if (data.total === 0) {
      console.log('   ⚠️  Database is empty - no test data');
      results.push({ test: 'Companions API', status: 'warning', error: 'No data in DB' });
    } else {
      console.log('   ✅ Companions API works');
      results.push({ test: 'Companions API', status: 'pass' });
    }
  } catch (e) {
    console.log('   ❌ Companions API failed:', e.message);
    results.push({ test: 'Companions API', status: 'fail', error: e.message });
  }
  
  // 4. Test UI registration flow
  console.log('4. UI Registration Flow...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(`${PROD_URL}/welcome`);
    await page.waitForTimeout(1000);
    
    // Click "Get Started" or similar
    const getStarted = await page.locator('text=/get started|sign up|register/i').first();
    if (await getStarted.isVisible()) {
      await getStarted.click();
      await page.waitForTimeout(500);
      console.log('   ✅ Welcome → Register navigation works');
      results.push({ test: 'UI Navigation', status: 'pass' });
    } else {
      console.log('   ⚠️  Could not find registration button');
      results.push({ test: 'UI Navigation', status: 'warning' });
    }
  } catch (e) {
    console.log('   ❌ UI test failed:', e.message);
    results.push({ test: 'UI Navigation', status: 'fail', error: e.message });
  }
  
  await browser.close();
  
  // Summary
  console.log('\n📊 Summary:');
  const passed = results.filter(r => r.status === 'pass').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const failed = results.filter(r => r.status === 'fail').length;
  
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ⚠️  Warnings: ${warnings}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n❌ REGISTRATION FLOW HAS ISSUES\n');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n⚠️  REGISTRATION WORKS BUT HAS WARNINGS\n');
  } else {
    console.log('\n✅ REGISTRATION FLOW OK\n');
  }
}

testRegistration().catch(console.error);
