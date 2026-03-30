#!/usr/bin/env node
/**
 * Update existing seed companion profiles to use Unsplash portrait photos
 * Replaces placeholder avatars with real face photos
 *
 * Run after rate limit resets (20 /start calls per hour limit)
 * Uses batching: 9 users per batch with 11-minute waits between batches
 */

const API_BASE = 'https://daterabbit-api.smartlaunchhub.com/api';

// Photo assignments: companion email -> Unsplash portrait URLs
const COMPANION_PHOTO_UPDATES = [
  { email: 'sophia.chen@seed.daterabbit.com',      name: 'Sophia Chen',      photoUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face' },
  { email: 'isabella.romano@seed.daterabbit.com',  name: 'Isabella Romano',  photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face' },
  { email: 'mia.thompson@seed.daterabbit.com',     name: 'Mia Thompson',     photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face' },
  { email: 'ava.williams@seed.daterabbit.com',     name: 'Ava Williams',     photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face' },
  { email: 'emma.davis@seed.daterabbit.com',       name: 'Emma Davis',       photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face' },
  { email: 'olivia.martinez@seed.daterabbit.com',  name: 'Olivia Martinez',  photoUrl: 'https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=400&h=400&fit=crop&crop=face' },
  { email: 'charlotte.lee@seed.daterabbit.com',    name: 'Charlotte Lee',    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face' },
  { email: 'luna.vasquez@seed.daterabbit.com',     name: 'Luna Vasquez',     photoUrl: 'https://images.unsplash.com/photo-1464863979621-258859e62245?w=400&h=400&fit=crop&crop=face' },
  { email: 'zoe.anderson@seed.daterabbit.com',     name: 'Zoe Anderson',     photoUrl: 'https://images.unsplash.com/photo-1496440737103-cd596325d314?w=400&h=400&fit=crop&crop=face' },
  { email: 'natalie.kim@seed.daterabbit.com',      name: 'Natalie Kim',      photoUrl: 'https://images.unsplash.com/photo-1515023115894-bacee3643854?w=400&h=400&fit=crop&crop=face' },
  { email: 'chloe.johnson@seed.daterabbit.com',    name: 'Chloe Johnson',    photoUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop&crop=face' },
  { email: 'aria.patel@seed.daterabbit.com',       name: 'Aria Patel',       photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face' },
  { email: 'grace.wilson@seed.daterabbit.com',     name: 'Grace Wilson',     photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face' },
  { email: 'lily.taylor@seed.daterabbit.com',      name: 'Lily Taylor',      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face' },
  { email: 'harper.brown@seed.daterabbit.com',     name: 'Harper Brown',     photoUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&h=400&fit=crop&crop=face' },
  { email: 'scarlett.nguyen@seed.daterabbit.com',  name: 'Scarlett Nguyen',  photoUrl: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=400&h=400&fit=crop&crop=face' },
  { email: 'maya.robinson@seed.daterabbit.com',    name: 'Maya Robinson',    photoUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face' },
  { email: 'stella.garcia@seed.daterabbit.com',    name: 'Stella Garcia',    photoUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=face' },
  { email: 'penelope.clarke@seed.daterabbit.com',  name: 'Penelope Clarke',  photoUrl: 'https://images.unsplash.com/photo-1514315384763-ba401779410f?w=400&h=400&fit=crop&crop=face' },
  { email: 'victoria.scott@seed.daterabbit.com',   name: 'Victoria Scott',   photoUrl: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=400&h=400&fit=crop&crop=face' },
];

// Additional new companions from seed-test-profiles
const NEW_COMPANION_UPDATES = [
  { email: 'jade.nakamura@seed.daterabbit.com',    name: 'Jade Nakamura',    photoUrl: 'https://images.unsplash.com/photo-1527203561188-dae1bc1a60a1?w=400&h=400&fit=crop&crop=face' },
  { email: 'maya.okonkwo@seed.daterabbit.com',     name: 'Maya Okonkwo',     photoUrl: 'https://images.unsplash.com/photo-1523264653568-3cafe1e40e67?w=400&h=400&fit=crop&crop=face' },
  { email: 'anya.kozlov@seed.daterabbit.com',      name: 'Anya Kozlov',      photoUrl: 'https://images.unsplash.com/photo-1502685104144-0e3e4c9ae73a?w=400&h=400&fit=crop&crop=face' },
  { email: 'valentina.reyes@seed.daterabbit.com',  name: 'Valentina Reyes',  photoUrl: 'https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?w=400&h=400&fit=crop&crop=face' },
  { email: 'diana.sterling@seed.daterabbit.com',   name: 'Diana Sterling',   photoUrl: 'https://images.unsplash.com/photo-1491349174775-aaafddd81942?w=400&h=400&fit=crop&crop=face' },
  { email: 'freya.anderson@seed.daterabbit.com',   name: 'Freya Anderson',   photoUrl: 'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=400&fit=crop&crop=face' },
  { email: 'priya.sharma@seed.daterabbit.com',     name: 'Priya Sharma',     photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face' },
  { email: 'lucia.fontana@seed.daterabbit.com',    name: 'Lucia Fontana',    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face' },
];

// All updates to process
const ALL_UPDATES = [...COMPANION_PHOTO_UPDATES, ...NEW_COMPANION_UPDATES];

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiRequest(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  try {
    return { status: response.status, data: JSON.parse(text) };
  } catch {
    return { status: response.status, data: text };
  }
}

async function authenticateUser(email) {
  const startRes = await apiRequest('POST', '/auth/start', { email });
  if (startRes.status === 429) {
    throw new Error(`Rate limited on /start`);
  }
  if (startRes.status !== 201 && startRes.status !== 200) {
    throw new Error(`Failed to start auth: ${JSON.stringify(startRes.data)}`);
  }

  const verifyRes = await apiRequest('POST', '/auth/verify', { email, code: '000000' });
  if (verifyRes.status === 429) {
    throw new Error(`Rate limited on /verify`);
  }
  if (!verifyRes.data?.token) {
    throw new Error(`Failed to verify: ${JSON.stringify(verifyRes.data)}`);
  }

  return { token: verifyRes.data.token, user: verifyRes.data.user };
}

async function checkHasRealPhoto(name) {
  const res = await apiRequest('GET', `/companions?search=${encodeURIComponent(name)}&limit=5`);
  if (res.data?.companions) {
    const match = res.data.companions.find(
      (c) => c.name.toLowerCase() === name.toLowerCase(),
    );
    if (match && match.primaryPhoto && !match.primaryPhoto.includes('dicebear')) {
      return true;
    }
  }
  return false;
}

async function updateCompanionPhoto(companion) {
  // Check if already has a real photo
  const alreadyReal = await checkHasRealPhoto(companion.name);
  if (alreadyReal) {
    return { skipped: true, reason: 'already has real photo' };
  }

  let authResult;
  try {
    authResult = await authenticateUser(companion.email);
  } catch (err) {
    return { error: true, reason: err.message };
  }

  const token = authResult.token;
  const primaryUrl = companion.photoUrl;
  const secondaryUrl = companion.photoUrl.replace(/photo-[^?]+/, 'photo-1524504388940-b1c1722653e1'); // fallback secondary

  const photos = [
    { id: generateUUID(), url: primaryUrl, order: 0, isPrimary: true },
    { id: generateUUID(), url: secondaryUrl, order: 1, isPrimary: false },
  ];

  const updateRes = await apiRequest('PUT', '/users/me', { photos }, token);

  if (updateRes.data?.id) {
    return { updated: true, photoUrl: primaryUrl };
  }

  return { error: true, reason: JSON.stringify(updateRes.data) };
}

async function main() {
  console.log('DateRabbit Seed Photo Updater');
  console.log('==============================');
  console.log(`Target API: ${API_BASE}`);
  console.log(`Total profiles to check: ${ALL_UPDATES.length}`);
  console.log('');

  const results = { updated: 0, skipped: 0, errors: 0, errorDetails: [] };

  // Process in batches of 9 (under 10/10min verify rate limit)
  const BATCH_SIZE = 9;
  const BATCH_WAIT_MS = 11 * 60 * 1000; // 11 minutes between batches

  for (let i = 0; i < ALL_UPDATES.length; i++) {
    // Wait between batches
    if (i > 0 && i % BATCH_SIZE === 0) {
      console.log(`\nBatch ${Math.floor(i / BATCH_SIZE)} complete.`);
      console.log(`Progress: ${i}/${ALL_UPDATES.length}`);
      console.log(`Waiting 11 minutes for rate limit reset...`);
      await sleep(BATCH_WAIT_MS);
      console.log('Resuming...\n');
    }

    const companion = ALL_UPDATES[i];
    process.stdout.write(`[${i + 1}/${ALL_UPDATES.length}] ${companion.name}... `);

    const result = await updateCompanionPhoto(companion);

    if (result.skipped) {
      process.stdout.write(`SKIP (${result.reason})\n`);
      results.skipped++;
    } else if (result.updated) {
      process.stdout.write(`UPDATED -> ${result.photoUrl}\n`);
      results.updated++;
    } else {
      process.stdout.write(`ERROR: ${result.reason}\n`);
      results.errors++;
      results.errorDetails.push(`${companion.name}: ${result.reason}`);
    }

    // Small delay between requests
    await sleep(400);
  }

  console.log('\n==============================');
  console.log('Done!');
  console.log(`  Updated: ${results.updated}`);
  console.log(`  Skipped: ${results.skipped}`);
  console.log(`  Errors:  ${results.errors}`);
  if (results.errorDetails.length > 0) {
    console.log('\nErrors:');
    results.errorDetails.forEach((e) => console.log(`  - ${e}`));
  }

  // Final stats
  const finalRes = await apiRequest('GET', '/companions?limit=100');
  if (finalRes.data?.companions) {
    const withReal = finalRes.data.companions.filter(
      (c) => c.primaryPhoto && !c.primaryPhoto.includes('dicebear'),
    );
    const withDicebear = finalRes.data.companions.filter(
      (c) => c.primaryPhoto && c.primaryPhoto.includes('dicebear'),
    );
    const noPhoto = finalRes.data.companions.filter((c) => !c.primaryPhoto);
    console.log(`\nFinal state (${finalRes.data.total} total companions):`);
    console.log(`  With real photos: ${withReal.length}`);
    console.log(`  With dicebear:    ${withDicebear.length}`);
    console.log(`  No photo:         ${noPhoto.length}`);
  }
}

main().catch(console.error);
